// /emails/volunteerTemplate.js

function volunteerTemplate(name) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Thank You for Volunteering – Vatsalya Trust</title>
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
                      Volunteer Team
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
                Thank you for taking this meaningful step and expressing your interest in volunteering with
                <strong style="color:#1A3A6B;">Vatsalya Trust, Mumbai</strong>. We are truly grateful for your
                generosity and commitment to making a difference in the lives of those who need it most.
              </p>

              <!-- Highlighted box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="background:#FFF5F5;border-left:4px solid #e63946;border-radius:4px;margin-bottom:24px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0;color:#333333;font-size:14px;line-height:1.7;">
                      Your application has been received and is currently under review by our team.
                      We will reach out to you within <strong>3–5 working days</strong> with the next steps,
                      including a brief orientation and placement details suited to your interests and availability.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;color:#444444;font-size:15px;line-height:1.7;">
                At Vatsalya Trust, every volunteer is a pillar of hope. Since 1983, our trust has worked
                tirelessly to care for orphan and destitute children, empower marginalised youth, and
                build a more compassionate society — and we couldn't do it without people like you.
              </p>

              <p style="margin:0 0 28px;color:#444444;font-size:15px;line-height:1.7;">
                If you have any questions in the meantime, please don't hesitate to reach out to us at
                <a href="mailto:info@vatsalyatrust.org" style="color:#e63946;text-decoration:none;font-weight:600;">
                  info@vatsalyatrust.org
                </a>.
                We look forward to welcoming you to our family. 🙏
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
                With warm regards,<br/>
                <strong style="color:#1A3A6B;">The Volunteer Coordination Team</strong><br/>
                <span style="color:#888;font-size:13px;">Vatsalya Trust, Mumbai</span>
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

module.exports = volunteerTemplate;