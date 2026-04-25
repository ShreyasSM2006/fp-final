const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

async function generateInvoice(data) {
  try {
    const invoicesDir = path.join(__dirname, "../invoices");

    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir);
    }

    const fileName = `invoice-${data.invoiceId}.pdf`;
    const filePath = path.join(invoicesDir, fileName);

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

    const html = `...YOUR SAME HTML...`;

    await page.setContent(html, { waitUntil: "networkidle0" });

    await page.pdf({
      path: filePath,
      format: "A4",
      printBackground: true
    });

    await browser.close();

    return filePath;

  } catch (err) {
    console.error("❌ Invoice error:", err);
    throw err;
  }
}

module.exports = generateInvoice;