const express = require("express");
const https = require("https");
const rateLimit = require("express-rate-limit");
const { PrismaClient } = require("@prisma/client");
const { sendBeats } = require("../services/email");

const router = express.Router();
const prisma = new PrismaClient();

const limiter = rateLimit({ windowMs: 60 * 1000, max: 10 });

// ── PayPal HTTP helpers ────────────────────────────────────────
function getPayPalBase() {
  return process.env.PAYPAL_MODE === "live"
    ? "api-m.paypal.com"
    : "api-m.sandbox.paypal.com";
}

function paypalRequest(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (data) headers["Content-Length"] = Buffer.byteLength(data);

    const req = https.request({
      hostname: getPayPalBase(),
      path,
      method,
      headers,
    }, (res) => {
      let raw = "";
      res.on("data", (chunk) => raw += chunk);
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode, body: raw });
        }
      });
    });
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

async function getAccessToken() {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  return new Promise((resolve, reject) => {
    const body = "grant_type=client_credentials";
    const req = https.request({
      hostname: getPayPalBase(),
      path: "/v1/oauth2/token",
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(body),
      },
    }, (res) => {
      let raw = "";
      res.on("data", (chunk) => raw += chunk);
      res.on("end", () => {
        try {
          const parsed = JSON.parse(raw);
          resolve(parsed.access_token);
        } catch { reject(new Error("Failed to parse token")); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function driveDownloadUrl(id) {
  return `https://drive.google.com/uc?export=download&id=${id}&confirm=t`;
}

// ═══════════════════════════════════════════════════════════════
//  POST /api/checkout/create
// ═══════════════════════════════════════════════════════════════
router.post("/create", limiter, async (req, res) => {
  try {
    const beatIds = req.body;
    if (!Array.isArray(beatIds) || beatIds.length === 0)
      return res.status(400).send("Carrinho vazio.");

    const uniqueIds = [...new Set(beatIds.map(Number))];
    const beats = await prisma.beat.findMany({ where: { id: { in: uniqueIds } } });
    if (beats.length !== uniqueIds.length)
      return res.status(400).send("Beat inválido.");

    const total = beats.reduce((acc, b) => acc + b.price, 0).toFixed(2);

    const order = await prisma.order.create({
      data: { status: "PENDING", paymentMethod: "PAYPAL", beatIds: uniqueIds },
    });

    const token = await getAccessToken();
    const apiUrl = process.env.API_URL;
    const frontendUrl = process.env.FRONTEND_URL;

    const response = await paypalRequest("POST", "/v2/checkout/orders", {
      intent: "CAPTURE",
      purchase_units: [{
        amount: { currency_code: "USD", value: total },
        description: `ORDER:${order.id}`,
      }],
      application_context: {
        return_url: `${apiUrl}/api/checkout/success`,
        cancel_url: `${frontendUrl}/?cancelled=true`,
        brand_name: "SAYSXNTS",
        user_action: "PAY_NOW",
      },
    }, token);

    if (response.status !== 201)
      return res.status(500).send("Erro ao criar pagamento PayPal.");

    await prisma.order.update({
      where: { id: order.id },
      data: { paypalPaymentId: response.body.id },
    });

    const approvalUrl = response.body.links?.find(l => l.rel === "approve")?.href;
    if (!approvalUrl) return res.status(500).send("Approval URL não encontrada.");

    res.send(approvalUrl);
  } catch (err) {
    console.error("Erro PayPal create:", err);
    res.status(500).send("Erro ao processar pagamento.");
  }
});

// ═══════════════════════════════════════════════════════════════
//  GET /api/checkout/success
// ═══════════════════════════════════════════════════════════════
router.get("/success", async (req, res) => {
  const { token } = req.query;
  if (!token) return res.redirect(`${process.env.FRONTEND_URL}/checkout/error`);

  try {
    const accessToken = await getAccessToken();

    const capture = await paypalRequest(
      "POST",
      `/v2/checkout/orders/${token}/capture`,
      {},
      accessToken
    );

    if (capture.status !== 201 && capture.status !== 200) {
      console.error("PayPal capture failed:", capture.body);
      return res.redirect(`${process.env.FRONTEND_URL}/checkout/error`);
    }

    if (capture.body.status !== "COMPLETED") {
      return res.redirect(`${process.env.FRONTEND_URL}/checkout/error`);
    }

    const description = capture.body.purchase_units?.[0]?.description || "";
    const orderId = parseInt(description.replace("ORDER:", ""), 10);
    if (!orderId) return res.redirect(`${process.env.FRONTEND_URL}/checkout/error`);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.redirect(`${process.env.FRONTEND_URL}/checkout/error`);
    if (order.status === "PAID")
      return res.redirect(`${process.env.FRONTEND_URL}/checkout/success`);

    const buyerEmail = capture.body.payment_source?.paypal?.email_address
      || capture.body.payer?.email_address;

    const beats = await prisma.beat.findMany({ where: { id: { in: order.beatIds } } });
    const wavLinks = beats.map(b => ({ name: b.name, wavUrl: driveDownloadUrl(b.wavDriveId) }));
    const licenseUrl = driveDownloadUrl(process.env.LICENSE_DRIVE_ID);

    await prisma.order.update({
      where: { id: orderId },
      data: { status: "PAID", buyerEmail },
    });

    await sendBeats(buyerEmail, wavLinks, licenseUrl);

    console.log(`Pedido ${orderId} pago para ${buyerEmail}`);
    res.redirect(`${process.env.FRONTEND_URL}/checkout/success`);

  } catch (err) {
    console.error("Erro PayPal success:", err);
    res.redirect(`${process.env.FRONTEND_URL}/checkout/error`);
  }
});

router.get("/cancel", (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/?cancelled=true`);
});

module.exports = router;