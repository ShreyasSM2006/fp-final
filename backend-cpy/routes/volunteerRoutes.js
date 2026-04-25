const express = require("express");
const router = express.Router();
const Volunteer = require("../models/Volunteer");
const nodemailer = require("nodemailer");

// ──────────────────────────────────────────────
// Nodemailer transporter (reads from .env)
// ──────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS   // Gmail App Password (not your real password)
  }
});

// ──────────────────────────────────────────────
// POST /api/volunteer/submit
// Accepts a new volunteer application from the public form.
// ──────────────────────────────────────────────
router.post("/submit", async (req, res) => {
  try {
    const { name, email, phone, interest, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required."
      });
    }

    // Save to MongoDB
    const volunteer = new Volunteer({ name, email, phone, interest, message });
    await volunteer.save();

    // Send acknowledgement email to the volunteer
    await transporter.sendMail({
      from: `"NGO Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "We received your volunteer application!",
      html: `
        <h2>Hi ${name},</h2>
        <p>Thank you for your interest in volunteering with us! 🎉</p>
        <p>We have received your application and our team will review it shortly.
           We will get back to you soon.</p>
        <br/>
        <p>Warm regards,<br/><strong>The NGO Team</strong></p>
      `
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully! Check your email for confirmation."
    });

  } catch (err) {
    console.error("❌ Error in /submit:", err);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
});

// ──────────────────────────────────────────────
// GET /api/volunteer/all
// Returns all volunteer submissions (admin only – protected by JWT middleware in server.js).
// ──────────────────────────────────────────────
router.get("/all", async (req, res) => {
  try {
    const volunteers = await Volunteer.find().sort({ createdAt: -1 });
    res.json({ success: true, volunteers });
  } catch (err) {
    console.error("❌ Error in /all:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ──────────────────────────────────────────────
// POST /api/volunteer/reply/:id
// Admin sends a reply to a specific volunteer.
// ──────────────────────────────────────────────
router.post("/reply/:id", async (req, res) => {
  try {
    const { replyMessage } = req.body;
    const { id } = req.params;

    if (!replyMessage) {
      return res.status(400).json({ success: false, message: "Reply message is required." });
    }

    // Find volunteer and update reply fields
    const volunteer = await Volunteer.findByIdAndUpdate(
      id,
      { reply: replyMessage, replied: true },
      { new: true }
    );

    if (!volunteer) {
      return res.status(404).json({ success: false, message: "Volunteer not found." });
    }

    // Send reply email to the volunteer
    await transporter.sendMail({
      from: `"NGO Team" <${process.env.EMAIL_USER}>`,
      to: volunteer.email,
      subject: "Response to your volunteer application",
      html: `
        <h2>Hello ${volunteer.name},</h2>
        <p>Thank you for applying to volunteer with us. Here is a response from our team:</p>
        <blockquote style="border-left:4px solid #2c7be5; padding-left:12px; color:#333;">
          ${replyMessage}
        </blockquote>
        <br/>
        <p>Warm regards,<br/><strong>The NGO Admin Team</strong></p>
      `
    });

    res.json({ success: true, message: "Reply sent and saved successfully." });

  } catch (err) {
    console.error("❌ Error in /reply:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ──────────────────────────────────────────────
// DELETE /api/volunteer/:id
// Admin deletes a volunteer entry.
// ──────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    await Volunteer.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Volunteer entry deleted." });
  } catch (err) {
    console.error("❌ Error deleting volunteer:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;