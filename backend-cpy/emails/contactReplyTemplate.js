// /emails/contactReplyTemplate.js

function contactReplyTemplate(name, originalMessage, replyMessage) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reply from Vatsalya Trust</title>
</head>
<body style="margin:0;padding:0;background-color:#f2f2f2;font-family:Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f2f2f2;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0"
               style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.10);max-width:600px;">

          <!-- HEADER -->
          <tr>
            <td style="background:#1A3A6B;padding:36px 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0;color:#C8973A;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;">Vatsalya Trust, Mumbai</p>
                    <h1 style="margin:6px 0 0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">
                      Care &bull; Protect &bull; Empower
                    </h1>
                  </td>
                  <td align="right" style="vertical-align:top;">
                    <span style="display:inline-block;background:#e63946;color:#fff;font-size:10px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;padding:5px 13px;border-radius:20px;">
                      Official Reply
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- GOLD DIVIDER -->
          <tr>
            <td style="background:#C8973A;height:4px;"></td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:40px 40px 32px;">

              <!-- Greeting -->
              <h2 style="margin:0 0 10px;color:#1A3A6B;font-size:20px;font-weight:700;">
                Dear ${name},
              </h2>
              <p style="margin:0 0 24px;color:#444444;font-size:15px;line-height:1.7;">
                Thank you for reaching out to us. We have carefully reviewed your message and are happy
                to respond. At <strong style="color:#1A3A6B;">Vatsalya Trust</strong>, every voice matters —
                and we appreciate you taking the time to connect with us.
              </p>

              <!-- Original Message Block -->
              <p style="margin:0 0 8px;color:#888888;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">
                Your Message
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="background:#f9f9f9;border-left:4px solid #cccccc;border-radius:4px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;color:#666666;font-size:14px;line-height:1.7;font-style:italic;">
                      "${originalMessage}"
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Reply Block -->
              <p style="margin:0 0 8px;color:#e63946;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">
                Our Response
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="background:#FFF5F5;border-left:4px solid #e63946;border-radius:4px;margin-bottom:28px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0;color:#333333;font-size:15px;line-height:1.8;">
                      ${replyMessage}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 28px;color:#444444;font-size:15px;line-height:1.7;">
                If you have any further questions or require additional assistance, please feel free to
                write back to us at
                <a href="mailto:info@vatsalyatrust.org" style="color:#e63946;text-decoration:none;font-weight:600;">
                  info@vatsalyatrust.org
                </a>.
                We are always here to help. 🙏
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
                <tr>
                  <td style="background:#e63946;border-radius:6px;">
                    <a href="https://www.vatsalyatrust.org"
                       style="display:inline-block;padding:13px 28px;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;letter-spacing:0.5px;">
                      Visit Our Website →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#444444;font-size:15px;line-height:1.7;">
                Warmly,<br/>
                <strong style="color:#1A3A6B;">The Vatsalya Trust Team</strong><br/>
                <span style="color:#888;font-size:13px;">Mumbai, Maharashtra, India</span>
              </p>

            </td>
          </tr>

          <!-- FOOTER DIVIDER -->
          <tr>
            <td style="background:#C8973A;height:2px;"></td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#1A3A6B;padding:22px 40px;text-align:center;">
              <p style="margin:0 0 6px;color:#C8973A;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">
                Vatsalya Trust, Mumbai
              </p>
              <p style="margin:0 0 6px;color:#aac4e8;font-size:11px;line-height:1.6;">
                Kanjurmarg (E), Mumbai – 400 042, Maharashtra, India
              </p>
              <p style="margin:0;color:#aac4e8;font-size:11px;">
                <a href="mailto:info@vatsalyatrust.org" style="color:#C8973A;text-decoration:none;">info@vatsalyatrust.org</a>
                &nbsp;&bull;&nbsp;
                <a href="https://www.vatsalyatrust.org" style="color:#C8973A;text-decoration:none;">www.vatsalyatrust.org</a>
              </p>
              <p style="margin:12px 0 0;color:#6a87a8;font-size:10px;">
                Registered under the Bombay Public Trust Act, 1950 &nbsp;|&nbsp; PAN: AAATV0234F &nbsp;|&nbsp; 80G Certified
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

module.exports = contactReplyTemplate;