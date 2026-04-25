const crypto = require("crypto");
const generateInvoice = require("../utils/generateInvoice");
const Invoice = require("../models/Invoice");

app.post("/payment-success", async (req, res) => {
  try {
    const { name, email, amount, paymentId, orderId } = req.body;

    // 🔥 UNIQUE IDS
    const invoiceId = "INV-" + crypto.randomBytes(4).toString("hex").toUpperCase();
    const receiptNo = "REC-" + Date.now();

    // 🧾 GENERATE PDF
    const { filePath } = await generateInvoice({
      invoiceId,
      receiptNo,
      name: name || "Valued Donor",
      email: email || "N/A",
      amount,
      paymentId,
      orderId
    });

    // 💾 STORE IN MONGODB
    const savedInvoice = await Invoice.create({
      invoiceId,
      receiptNo,
      name,
      email,
      amount,
      currency: "INR",
      paymentId,
      orderId,
      pdfPath: filePath
    });

    // 📧 SEND EMAIL (FIXED)
    await transporter.sendMail({
      to: email,
      subject: "Donation Receipt",
      text: "Attached is your receipt",
      attachments: [
        {
          filename: `${invoiceId}.pdf`,
          path: filePath // ✅ CORRECT
        }
      ]
    });

    res.json({
      success: true,
      invoice: savedInvoice
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
});