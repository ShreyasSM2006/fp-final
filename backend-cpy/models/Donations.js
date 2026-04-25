const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  currency: String,
  amount: Number,
  purpose: String,

  status: {
    type: String,
    default: "pending" // "pending" until payment verified
  },

  order_id: String,          // Razorpay order id
  payment_id: String,        // Razorpay payment id
  signature: String,         // Razorpay signature for verification

  createdAt: {
    type: Date,
    default: Date.now
  },

  paidAt: Date               // when payment is successful
});

module.exports = mongoose.model("Donation", donationSchema);