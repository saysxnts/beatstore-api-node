const express = require("express");
const rateLimit = require("express-rate-limit");
const paypal = require("@paypal/checkout-server-sdk");
const { PrismaClient } = require("@prisma/client");
const { sendBeats } = require("../services/email");

const router = express.Router();
const prisma = new PrismaClient();

// ── PayPal client ──────────────────────────────────────────────
function getPayPalClient() {
  const env = process.env.PAYPAL_MODE === "live"
    ? new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      )
    : new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      );
  return new paypal.core.PayPalHttpClient(env);
}

// ── Rate limiting ──────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "Muitas tentativas. Tente novamente em instantes.",
});

// ── Helpers ────────────────────────────────────────────────────
function driveDownloadUrl(id) {
  return `https://drive.google.com/uc?export=download&id=${id}`;
}

// ═══════════════════════════════════════════════════════════════
//  POST /api/checkout/create
//  Cria o pagamento PayPal e retorna a approval_url
// ═══════════════════════════════════════════════════════════════
router.post("/create", limiter, async (req, res) => {
  try {
    const beatIds = req.body;

    if (!Array.isArray(beatIds) || beatIds.length === 0)
      return res.status(400).send("Carrinho vazio.");

    if (beatIds.length > 20)
      return res.status(400).send("Carrinho excede o limite de itens.");

    const uniqueIds = [...new Set(beatIds.map(Number))];
    const beats = await prisma.beat.findMany({ where: { id: { in: uniqueIds } } });

    if (beats.length !== uniqueIds.length)
      return res.status(400).send("Beat inválido.");

    const total = beats.reduce((acc, b) => acc + b.price, 0).toFixed(2);

    // Persiste o pedido antes de ir ao PayPal
    const order = await prisma.order.create({
      data: {
        status: "PENDING",
        paymentMethod: "PAYPAL",
        beatIds: uniqueIds,
      },
    });

    const apiUrl      = process.env.API_URL;
    const successUrl  = `${apiUrl}/api/checkout/success`;
    const cancelUrl   = `${process.env.FRONTEND_URL}/?cancelled=true`;

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [{
        amount: { currency_code: "USD", value: total },
        description: `ORDER:${order.id}`,
      }],
      application_context: {
        return_url: successUrl,
        cancel_url: cancelUrl,
        brand_name: "SAYSXNTS",
        user_action: "PAY_NOW",
      },
    });

    const client   = getPayPalClient();
    const response = await client.execute(request);
    const approvalUrl = response.result.links.find(l => l.rel === "approve")?.href;

    if (!approvalUrl)
      return res.status(500).send("Não foi possível criar o pagamento.");

    // Salva o PayPal order ID no pedido
    await prisma.order.update({
      where: { id: order.id },
      data: { paypalPaymentId: response.result.id },
    });

    res.send(approvalUrl);

  } catch (err) {
    console.error("Erro PayPal create:", err);
    res.status(500).send("Erro ao processar pagamento.");
  }
});

// ═══════════════════════════════════════════════════════════════
//  GET /api/checkout/success
//  PayPal redireciona aqui após aprovação
// ═══════════════════════════════════════════════════════════════
router.get("/success", async (req, res) => {
  const { token } = req.query; // token = PayPal order ID

  if (!token)
    return res.redirect(`${process.env.FRONTEND_URL}/checkout/error`);

  try {
    // Captura o pagamento no PayPal
    const request = new paypal.orders.OrdersCaptureRequest(token);
    request.requestBody({});

    const client   = getPayPalClient();
    const response = await client.execute(request);

    if (response.result.status !== "COMPLETED") {
      console.warn("Pagamento não completado:", response.result.status);
      return res.redirect(`${process.env.FRONTEND_URL}/checkout/error`);
    }

    // Recupera a descrição para achar o pedido interno
    const description = response.result.purchase_units?.[0]?.description || "";
    const orderId = parseInt(description.replace("ORDER:", ""), 10);

    if (!orderId)
      return res.redirect(`${process.env.FRONTEND_URL}/checkout/error`);

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order)
      return res.redirect(`${process.env.FRONTEND_URL}/checkout/error`);

    // Idempotência
    if (order.status === "PAID")
      return res.redirect(`${process.env.FRONTEND_URL}/checkout/success`);

    // E-mail do comprador
    const buyerEmail = response.result.payment_source?.paypal?.email_address
      || response.result.payer?.email_address;

    // Busca os beats comprados
    const beats = await prisma.beat.findMany({
      where: { id: { in: order.beatIds } },
    });

    // Gera URLs de download para WAV + licença
    const wavLinks = beats.map((b) => ({
      name: b.name,
      wavUrl: driveDownloadUrl(b.wavDriveId),
    }));

    const licenseUrl = driveDownloadUrl(process.env.LICENSE_DRIVE_ID);

    // Atualiza o pedido
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "PAID", buyerEmail },
    });

    // Envia o e-mail com os downloads
    await sendBeats(buyerEmail, wavLinks, licenseUrl);

    console.log(`Pedido ${orderId} pago para ${buyerEmail}`);
    res.redirect(`${process.env.FRONTEND_URL}/checkout/success`);

  } catch (err) {
    console.error("Erro PayPal success:", err);
    res.redirect(`${process.env.FRONTEND_URL}/checkout/error`);
  }
});

// ═══════════════════════════════════════════════════════════════
//  GET /api/checkout/cancel
// ═══════════════════════════════════════════════════════════════
router.get("/cancel", (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/?cancelled=true`);
});

module.exports = router;
