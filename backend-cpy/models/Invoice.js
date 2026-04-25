const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
    invoiceId: { type: String, unique: true },
    receiptNo: { type: String, unique: true },

    name: String,
    email: String,

    amount: Number,
    currency: String,

    paymentId: String,
    orderId: String,

    pdfPath: String,

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Invoice", invoiceSchema);