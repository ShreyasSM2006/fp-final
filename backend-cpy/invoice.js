const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
async function generateInvoice(data) {
  try {
    // 📁 Ensure invoices folder exists
    const invoicesDir = path.join(__dirname, "invoices");
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir);
    }

    const receiptNo = data.receiptNo || "REC-" + Date.now();
    const fileName = `invoice-${receiptNo}.pdf`;
    const filePath = path.join(invoicesDir, fileName);

    // 🚀 Launch Puppeteer (Linux fix included)
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu"
      ]
    });

    const page = await browser.newPage();

    // 🎨 Premium HTML UI
const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      color: #333;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      font-size: 18px;
      font-weight: bold;
    }

    .ngo-details {
      text-align: right;
      font-size: 12px;
    }

    .divider {
      border-top: 2px solid #000;
      margin: 10px 0;
    }

    .title {
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      margin: 15px 0;
    }

    .section {
      margin-top: 15px;
    }

    .section-title {
      font-weight: bold;
      margin-bottom: 5px;
    }

    .row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
    }

    .label {
      font-weight: bold;
    }

    .footer {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
    }

    .sign {
      text-align: center;
    }

  </style>
</head>

<body>

  <!-- HEADER -->
  <div class="header">
    <div class="logo">
      NGO LOGO
    </div>

    <div class="ngo-details">
      <div><strong>Vatsalya Trust</strong></div>
      <div>Mumbai, India</div>
      <div>www.vatsalya.org</div>
      <div>support@vatsalya.org</div>
    </div>
  </div>

  <div class="divider"></div>

  <!-- TITLE -->
  <div class="title">
    DONATION RECEIPT / INVOICE
  </div>

  <div class="divider"></div>

  <!-- BASIC INFO -->
  <div class="section">
    <div class="row">
      <div><span class="label">Receipt No:</span> ${data.receiptNo}</div>
      <div><span class="label">Date:</span> ${new Date().toLocaleDateString()}</div>
    </div>

    <div class="row">
      <div><span class="label">Authorization ID:</span> ${data.authId || "-"}</div>
      <div></div>
    </div>
  </div>

  <div class="divider"></div>

  <!-- DONOR DETAILS -->
  <div class="section">
    <div class="section-title">DONOR DETAILS</div>

    <div class="row">
      <div class="label">Name:</div>
      <div>${data.name || "Valued Donor"}</div>
    </div>

    <div class="row">
      <div class="label">Email:</div>
      <div>${data.email || "-"}</div>
    </div>

    <div class="row">
      <div class="label">Phone:</div>
      <div>${data.phone || "-"}</div>
    </div>
  </div>

  <div class="divider"></div>

  <!-- DONATION DETAILS -->
  <div class="section">
    <div class="section-title">DONATION DETAILS</div>

    <div class="row">
      <div class="label">Amount:</div>
      <div>₹ ${Number(data.amount).toLocaleString("en-IN")}</div>
    </div>

    <div class="row">
      <div class="label">Currency:</div>
      <div>${data.currency || "INR"}</div>
    </div>

    <div class="row">
      <div class="label">Purpose:</div>
      <div>${data.purpose || "General Donation"}</div>
    </div>

    <div class="row">
      <div class="label">Payment ID:</div>
      <div>${data.paymentId}</div>
    </div>

    <div class="row">
      <div class="label">Order ID:</div>
      <div>${data.orderId || "-"}</div>
    </div>
  </div>

  <div class="divider"></div>

  <!-- THANK YOU -->
  <div class="section" style="text-align:center; margin-top:20px;">
    <strong>Thank you for your generous contribution!</strong>
  </div>

  <div class="divider"></div>

  <!-- SIGNATURE -->
  <div class="footer">
    <div class="sign">
      _______________________<br/>
      Authorized Signature
    </div>

    <div class="sign">
      _______________________<br/>
      NGO Stamp
    </div>
  </div>

</body>
</html>
`;

    // 📄 Load HTML
    await page.setContent(html, { waitUntil: "networkidle0" });

    // 📥 Generate PDF
    await page.pdf({
      path: filePath,
      format: "A4",
      printBackground: true
    });

    await browser.close();

    console.log("✅ Invoice generated:", filePath);

    // 🔥 RETURN for MongoDB
    return {
      filePath,
      receiptNo
    };

  } catch (error) {
    console.error("❌ Invoice error:", error);
    throw error;
  }
}

module.exports = generateInvoice;