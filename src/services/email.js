const { Resend } = require("resend");

/**
 * Envia e-mail com links de download dos WAVs e da licença PDF.
 *
 * @param {string} toEmail  - e-mail do comprador (vem do PayPal)
 * @param {Array}  wavLinks - [{ name, wavUrl }]
 * @param {string} licenseUrl - URL do PDF de licença no Drive
 */
async function sendBeats(toEmail, wavLinks, licenseUrl) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const html = buildHtml(wavLinks, licenseUrl);

    await resend.emails.send({
      from: process.env.MAIL_FROM || "onboarding@resend.dev",
      to: toEmail,
      subject: "Your order - saysxnts",
      html,
    });

    console.log(`E-mail enviado para ${toEmail}`);
  } catch (err) {
    // Não quebra o fluxo se o e-mail falhar
    console.error("Erro ao enviar e-mail:", err.message || err);
  }
}

function buildHtml(wavLinks, licenseUrl) {
  const beatRows = wavLinks.map(({ name, wavUrl }) => `
    <tr>
      <td style="padding:20px;background-color:#252525;border-radius:8px;border:1px solid #333;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="color:#ffffff;font-size:16px;font-weight:bold;">
              ${name}
              <br>
              <span style="color:#680000;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:800;">WAV LICENSE</span>
            </td>
            <td align="right" style="width:140px;">
              <a href="${wavUrl}"
                 style="background-color:#680000;color:#ffffff;padding:12px 25px;text-decoration:none;border-radius:4px;font-weight:bold;font-size:12px;display:inline-block;border:1px solid #800000;">
                DOWNLOAD WAV
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td height="12"></td></tr>
  `).join("");

  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#121212;font-family:Helvetica,Arial,sans-serif;">
  <table role="presentation" style="width:100%;border-collapse:collapse;background-color:#121212;">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table role="presentation" style="width:600px;border-collapse:collapse;border:1px solid #333;background-color:#1E1E1E;text-align:left;">

          <tr>
            <td style="padding:40px;text-align:center;border-bottom:1px solid #333;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;letter-spacing:4px;text-transform:uppercase;font-weight:800;">SAYSXNTS</h1>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 40px 20px 40px;">
              <h2 style="margin:0 0 20px 0;color:#ffffff;font-size:22px;">Thank you for your order.</h2>
              <p style="margin:0;color:#aaaaaa;font-size:16px;line-height:24px;">
                Your payment was successful. Here are your secure download links:
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px 20px 40px;">
              <table role="presentation" style="width:100%;border-collapse:collapse;">
                ${beatRows}
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px 40px 40px;">
              <table role="presentation" style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:20px;background-color:#1a1a1a;border-radius:8px;border:1px solid #333;">
                    <table role="presentation" style="width:100%;border-collapse:collapse;">
                      <tr>
                        <td style="color:#aaaaaa;font-size:15px;">
                          License Agreement
                          <br>
                          <span style="color:#555555;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Beat_Usage_License_saysxnts.pdf</span>
                        </td>
                        <td align="right" style="width:140px;">
                          <a href="${licenseUrl}"
                             style="background-color:#222222;color:#ffffff;padding:12px 25px;text-decoration:none;border-radius:4px;font-weight:bold;font-size:12px;display:inline-block;border:1px solid #444444;">
                            DOWNLOAD PDF
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:30px;background-color:#151515;text-align:center;color:#555555;font-size:12px;border-top:1px solid #333;">
              <p style="margin:0;">© 2026 SAYSXNTS. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

module.exports = { sendBeats };