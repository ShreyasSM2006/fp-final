console.log("🚀 Starting NGO server...");

require("dotenv").config();

const express         = require("express");
const mongoose        = require("mongoose");
const cors            = require("cors");
const bcrypt          = require("bcrypt");
const jwt             = require("jsonwebtoken");
const nodemailer      = require("nodemailer");
const crypto          = require("crypto");
const axios           = require("axios");
const Razorpay        = require("razorpay");
const PDFDocument     = require("pdfkit");
const fs              = require("fs");
const path            = require("path");
const connectDB       = require("./config/db");
const volunteerRoutes = require("./routes/volunteerRoutes");
const Volunteer       = require("./models/Volunteer");
const rateLimit       = require("express-rate-limit");

// ──────────────────────────────────────────────
// Email Templates
// ──────────────────────────────────────────────
const volunteerTemplate    = require("./emails/volunteerTemplate");
const contactReplyTemplate = require("./emails/contactReplyTemplate");

const app = express();

// ──────────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────────
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "DELETE", "PUT"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests, please try again later."
});
app.use(limiter);

// ──────────────────────────────────────────────
// Connect to MongoDB
// ──────────────────────────────────────────────
connectDB();

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────
const SECRET_KEY = process.env.JWT_SECRET;

// ──────────────────────────────────────────────
// Razorpay
// ──────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ──────────────────────────────────────────────
// Nodemailer Transporter
// ──────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ──────────────────────────────────────────────
// JWT Auth Middleware  (defined FIRST so all routes can use it)
// ──────────────────────────────────────────────
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, message: "No token provided." });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: "Invalid token." });
    req.user = user;
    next();
  });
}

// ──────────────────────────────────────────────
// Mongoose Models
// ──────────────────────────────────────────────

const adminSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const Admin = mongoose.model("Admin", adminSchema);

const contactSchema = new mongoose.Schema({
  name:      String,
  email:     String,
  message:   String,
  reply:     String,
  replied:   { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Contact = mongoose.model("Contact", contactSchema);

const donationSchema = new mongoose.Schema({
  name:      String,
  email:     String,
  phone:     String,
  currency:  String,
  amount:    Number,
  purpose:   String,
  paymentId: String,
  orderId:   String,
  status:    { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now }
});
const Donation = mongoose.model("Donation", donationSchema);

const invoiceSchema = new mongoose.Schema({
  invoiceId: { type: String, unique: true },
  receiptNo: { type: String, unique: true },
  name:      String,
  email:     String,
  amount:    Number,
  currency:  String,
  paymentId: String,
  orderId:   String,
  pdfPath:   String,
  createdAt: { type: Date, default: Date.now }
});
const Invoice = mongoose.model("Invoice", invoiceSchema);

// ──────────────────────────────────────────────
// CMS Models
// ──────────────────────────────────────────────

const eventSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  image:       { type: String, default: "" },
  date:        { type: String, default: "" },
  type:        { type: String, enum: ["latest", "upcoming", "past"], default: "upcoming" },
  createdAt:   { type: Date, default: Date.now }
});
const Event = mongoose.model("Event", eventSchema);

const projectSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  image:       { type: String, default: "" },
  funded:      { type: Number, default: 0 },
  createdAt:   { type: Date, default: Date.now }
});
const Project = mongoose.model("Project", projectSchema);

const storySchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  image:       { type: String, default: "" },
  createdAt:   { type: Date, default: Date.now }
});
const Story = mongoose.model("Story", storySchema);

const announcementSchema = new mongoose.Schema({
  text:      { type: String, required: true },
  link:      { type: String, default: "" },
  active:    { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
const Announcement = mongoose.model("Announcement", announcementSchema);

// ══════════════════════════════════════════════
// ANNOUNCEMENTS — PUBLIC (homepage)
// GET /api/announcements  → returns only active ones for the homepage
// ══════════════════════════════════════════════
app.get("/api/announcements", async (req, res) => {
  try {
    // If the request carries a valid admin token, return ALL announcements
    // so the admin dashboard can see inactive ones too.
    // Otherwise return only active ones for public use.
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    let isAdmin = false;
    if (token) {
      try {
        jwt.verify(token, SECRET_KEY);
        isAdmin = true;
      } catch (_) { /* not admin */ }
    }

    const filter = isAdmin ? {} : { active: true };
    const announcements = await Announcement.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, announcements });
  } catch (err) {
    console.error("❌ Fetch Announcements Error:", err);
    res.status(500).json({ success: false, message: "Failed to load announcements" });
  }
});

// ══════════════════════════════════════════════
// ANNOUNCEMENTS — ADMIN: CREATE
// POST /api/announcements
// ══════════════════════════════════════════════
app.post("/api/announcements", authenticateToken, async (req, res) => {
  try {
    const { text, link, active } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Announcement text is required." });
    }

    const announcement = await Announcement.create({
      text:   text.trim(),
      link:   (link || "").trim(),
      active: active !== undefined ? active : true
    });

    res.json({ success: true, announcement });
  } catch (err) {
    console.error("❌ Create Announcement Error:", err);
    res.status(500).json({ success: false, message: "Failed to create announcement" });
  }
});

// ══════════════════════════════════════════════
// ANNOUNCEMENTS — ADMIN: DELETE
// DELETE /api/announcements/:id
// ══════════════════════════════════════════════
app.delete("/api/announcements/:id", authenticateToken, async (req, res) => {
  try {
    const deleted = await Announcement.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Announcement not found." });
    }
    res.json({ success: true, message: "Announcement deleted." });
  } catch (err) {
    console.error("❌ Delete Announcement Error:", err);
    res.status(500).json({ success: false, message: "Failed to delete announcement" });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// PDF INVOICE GENERATOR  —  Vatsalya Trust Professional Receipt
// ══════════════════════════════════════════════════════════════════════════════

const TRUST = {
  name:    "VATSALYA TRUST, MUMBAI",
  tagline: "Care  •  Protect  •  Empower",
  address: "Kanjurmarg (E), Mumbai – 400 042, Maharashtra, India",
  email:   "info@vatsalyatrust.org",
  website: "www.vatsalyatrust.org",
  pan:     "AAATV0234F",
  fcra:    "083780374",
  reg:     "Reg. under Bombay Public Trust Act, 1950",
  cert80G: "80G Cert. No.: CIT/Tech/80G/2023-24/XXXXX",
  logo:    path.join(__dirname, "logo.jpg"),
};

const C = {
  navy:   "#1A3A6B",
  gold:   "#C8973A",
  lgold:  "#F5E9D5",
  green:  "#2E7D32",
  lgreen: "#E8F5E9",
  gray:   "#555555",
  lgray:  "#F4F4F4",
  border: "#CCCCCC",
  white:  "#FFFFFF",
  black:  "#000000",
};

function generateInvoicePDF({
  invoiceId,
  receiptNo,
  name,
  email,
  phone    = "",
  address  = "",
  amount,
  currency = "INR",
  paymentId,
  orderId,
  purpose  = "General Donation",
}) {
  return new Promise((resolve, reject) => {
    const invoicesDir = path.join(__dirname, "invoices");
    if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir);

    const filePath = path.join(invoicesDir, `${receiptNo}.pdf`);

    const amountFormatted = new Intl.NumberFormat("en-IN", {
      style: "currency", currency, minimumFractionDigits: 2,
    }).format(amount);

    const now     = new Date();
    const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    const doc = new PDFDocument({ size: "A4", margin: 0, autoFirstPage: true });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const W  = doc.page.width;
    const H  = doc.page.height;
    const ML = 42;

    doc.rect(0, 0, W, 125).fill(C.navy);

    if (fs.existsSync(TRUST.logo)) {
      doc.image(TRUST.logo, ML, 16, { width: 195 });
    }

    doc.font("Helvetica-Bold").fontSize(14).fillColor(C.white)
       .text(TRUST.name, 0, 28, { align: "right", width: W - ML });

    doc.font("Helvetica").fontSize(8).fillColor(C.gold)
       .text(TRUST.tagline, 0, 47, { align: "right", width: W - ML });

    doc.fillColor(C.white).fontSize(7.5)
       .text(TRUST.address,               0, 61, { align: "right", width: W - ML })
       .text(`${TRUST.email}   |   ${TRUST.website}`, 0, 73, { align: "right", width: W - ML })
       .text(`PAN: ${TRUST.pan}   |   FCRA Reg. No.: ${TRUST.fcra}`, 0, 85, { align: "right", width: W - ML })
       .text(TRUST.reg,                   0, 97, { align: "right", width: W - ML })
       .text(TRUST.cert80G,               0, 109, { align: "right", width: W - ML });

    doc.rect(0, 125, W, 5).fill(C.gold);

    let curY = 143;

    doc.font("Helvetica-Bold").fontSize(20).fillColor(C.navy)
       .text("DONATION RECEIPT", ML, curY);

    doc.font("Helvetica-Bold").fontSize(8.5).fillColor(C.gray)
       .text(`Date: ${dateStr}`, 0, curY + 2, { align: "right", width: W - ML });
    doc.font("Helvetica").fontSize(8.5).fillColor(C.gray)
       .text(`Time: ${timeStr}`, 0, curY + 14, { align: "right", width: W - ML });

    curY += 28;
    doc.font("Helvetica").fontSize(8.5).fillColor(C.gray)
       .text(`Receipt No: `, ML, curY, { continued: true })
       .font("Helvetica-Bold").fillColor(C.black).text(receiptNo, { continued: false });

    doc.font("Helvetica").fontSize(8.5).fillColor(C.gray)
       .text(`Invoice ID:  `, W / 2, curY, { continued: true })
       .font("Helvetica-Bold").fillColor(C.black).text(invoiceId);

    curY += 16;
    doc.moveTo(ML, curY).lineTo(W - ML, curY)
       .strokeColor(C.gold).lineWidth(1.5).stroke();
    curY += 10;

    const cardH = 90;
    doc.roundedRect(ML, curY, W - 2 * ML, cardH, 6)
       .fillAndStroke(C.lgray, C.border);

    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(C.navy)
       .text("DONOR INFORMATION", ML + 12, curY + 10);

    const r1y = curY + 26;
    doc.font("Helvetica").fontSize(7.5).fillColor(C.gray).text("Full Name",     ML + 12, r1y);
    doc.font("Helvetica-Bold").fontSize(9).fillColor(C.black).text(name || "—", ML + 12, r1y + 10);

    doc.font("Helvetica").fontSize(7.5).fillColor(C.gray).text("Email Address", W / 2 + 10, r1y);
    doc.font("Helvetica-Bold").fontSize(9).fillColor(C.black).text(email || "—", W / 2 + 10, r1y + 10);

    const r2y = curY + 57;
    doc.font("Helvetica").fontSize(7.5).fillColor(C.gray).text("Phone",         ML + 12, r2y);
    doc.font("Helvetica-Bold").fontSize(9).fillColor(C.black).text(phone || "Not provided", ML + 12, r2y + 10);

    doc.font("Helvetica").fontSize(7.5).fillColor(C.gray).text("Address",       W / 2 + 10, r2y);
    doc.font("Helvetica-Bold").fontSize(8.5).fillColor(C.black)
       .text(address || "Not provided", W / 2 + 10, r2y + 10, { width: W / 2 - ML - 10 });

    curY += cardH + 14;

    const tableW = W - 2 * ML;
    const col    = { desc: ML, purpose: ML + 255, amount: ML + 390 };
    const colW   = { desc: 245, purpose: 135, amount: tableW - 390 };

    doc.rect(ML, curY, tableW, 26).fill(C.navy);
    doc.font("Helvetica-Bold").fontSize(9).fillColor(C.white)
       .text("DESCRIPTION", col.desc + 8,    curY + 9)
       .text("PURPOSE",     col.purpose,      curY + 9, { width: colW.purpose, align: "center" })
       .text("AMOUNT",      col.amount,       curY + 9, { width: colW.amount,  align: "right" });

    const drY = curY + 26;
    doc.rect(ML, drY, tableW, 30).fill(C.lgold);
    doc.font("Helvetica").fontSize(9).fillColor(C.black)
       .text("Charitable Donation – Vatsalya Trust, Mumbai", col.desc + 8, drY + 10, { width: colW.desc - 8 });
    doc.text(purpose, col.purpose, drY + 10, { width: colW.purpose, align: "center" });
    doc.font("Helvetica-Bold")
       .text(amountFormatted, col.amount, drY + 10, { width: colW.amount, align: "right" });

    const totY = drY + 30;
    doc.rect(ML, totY, tableW, 32).fill(C.navy);
    doc.font("Helvetica-Bold").fontSize(11).fillColor(C.gold)
       .text("TOTAL AMOUNT RECEIVED", col.desc + 8, totY + 10);
    doc.fillColor(C.white)
       .text(amountFormatted, col.amount, totY + 10, { width: colW.amount, align: "right" });

    curY = totY + 32 + 16;

    doc.font("Helvetica-Bold").fontSize(10.5).fillColor(C.navy)
       .text("PAYMENT DETAILS", ML, curY);
    curY += 14;
    doc.moveTo(ML, curY).lineTo(W - ML, curY).strokeColor(C.border).lineWidth(0.8).stroke();
    curY += 7;

    const payRows = [
      ["Payment Gateway",      "Razorpay",         false],
      ["Razorpay Order ID",    orderId,             false],
      ["Razorpay Payment ID",  paymentId,           false],
      ["Payment Status",       "✔  Successful",     true ],
      ["Currency",             currency,            false],
    ];

    payRows.forEach(([label, value, isGreen], i) => {
      const rowY = curY + i * 22;
      if (i % 2 === 1) {
        doc.rect(ML, rowY, tableW, 22).fill(C.lgray);
      }
      doc.font("Helvetica").fontSize(8.5).fillColor(C.gray)
         .text(label, ML + 5, rowY + 7);
      doc.font("Helvetica-Bold").fontSize(8.5)
         .fillColor(isGreen ? C.green : C.black)
         .text(value, ML + 180, rowY + 7);
    });

    curY += payRows.length * 22 + 16;

    const taxBoxH = 52;
    doc.roundedRect(ML, curY, tableW, taxBoxH, 5)
       .fillAndStroke(C.lgreen, "#A5D6A7");

    doc.font("Helvetica-Bold").fontSize(9).fillColor(C.green)
       .text("📋  Income Tax Exemption – Section 80G of the Income Tax Act, 1961", ML + 12, curY + 9);

    doc.font("Helvetica").fontSize(7.8).fillColor(C.gray)
       .text(
         "Your donation is eligible for deduction under Section 80G. This receipt is official proof " +
         "of your contribution. Please retain it for your tax records.  " + TRUST.cert80G,
         ML + 12, curY + 23,
         { width: tableW - 24 }
       );

    curY += taxBoxH + 14;

    doc.font("Helvetica-Bold").fontSize(10.5).fillColor(C.navy)
       .text("ABOUT VATSALYA TRUST", ML, curY);
    curY += 14;
    doc.moveTo(ML, curY).lineTo(W - ML, curY).strokeColor(C.border).lineWidth(0.8).stroke();
    curY += 7;

    doc.font("Helvetica").fontSize(8).fillColor(C.gray)
       .text(
         "Founded on 8th February 1983, Vatsalya Trust Mumbai is registered as a Public Charitable Trust " +
         "under the Bombay Public Trust Act, 1950. Our mission is to care, protect and empower destitute " +
         "and deprived members of society with special emphasis on orphan/destitute children and marginalised " +
         "unskilled youth. Over 1,275 children have found loving adoptive homes through our efforts. " +
         "We are recognised by CARA, FCRA registered, Gold Certified by Guidestar India, and ISO 9001:2015 " +
         "certified by TÜV Austria. Projects span Maharashtra: Kanjurmarg, Sanpada, Alibag and Badlapur.",
         ML, curY,
         { width: tableW, align: "justify" }
       );

    doc.rect(0, H - 45, W, 45).fill(C.navy);

    doc.font("Helvetica-Bold").fontSize(8.5).fillColor(C.gold)
       .text(
         "Thank you for your generosity. Your support transforms lives.  🙏",
         0, H - 32, { align: "center", width: W }
       );

    doc.font("Helvetica").fontSize(7.5).fillColor(C.white)
       .text(
         `${TRUST.name}   |   ${TRUST.address}   |   ${TRUST.email}`,
         0, H - 18, { align: "center", width: W }
       );

    doc.end();
    stream.on("finish", () => resolve(filePath));
    stream.on("error",  reject);
  });
}

// ──────────────────────────────────────────────
// Auth Routes
// ──────────────────────────────────────────────

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.json({ success: false, message: "Wrong password" });

    const token = jwt.sign({ email: admin.email }, SECRET_KEY, { expiresIn: "7d" });
    res.json({ success: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/dashboard", authenticateToken, (req, res) => {
  res.json({ success: true, message: `Welcome Admin: ${req.user.email}` });
});

// ──────────────────────────────────────────────
// Contact Routes
// ──────────────────────────────────────────────

app.post("/contact", async (req, res) => {
  const { name, email, message, captchaToken } = req.body;

  if (!captchaToken) {
    return res.json({ success: false, message: "Captcha missing" });
  }

  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      { params: { secret: process.env.RECAPTCHA_SECRET, response: captchaToken } }
    );

    if (!response.data.success) {
      return res.json({ success: false, message: "Captcha failed" });
    }

    const newContact = new Contact({ name, email, message });
    await newContact.save();

    await transporter.sendMail({
      from:    `"Vatsalya Trust" <${process.env.EMAIL_USER}>`,
      to:      process.env.EMAIL_USER,
      subject: "New Contact Message – Vatsalya Trust Website",
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#f2f2f2;font-family:Helvetica,Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2;padding:30px 0;">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0"
                     style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                <tr><td style="background:#1A3A6B;padding:24px 32px;">
                  <h2 style="margin:0;color:#fff;font-size:16px;">New Contact Form Submission</h2>
                  <p style="margin:4px 0 0;color:#C8973A;font-size:11px;">Vatsalya Trust – Admin Notification</p>
                </td></tr>
                <tr><td style="background:#C8973A;height:3px;"></td></tr>
                <tr><td style="padding:28px 32px;">
                  <p style="margin:0 0 8px;color:#555;font-size:13px;"><strong>Name:</strong> ${name}</p>
                  <p style="margin:0 0 8px;color:#555;font-size:13px;"><strong>Email:</strong> ${email}</p>
                  <p style="margin:0 0 8px;color:#555;font-size:13px;"><strong>Message:</strong></p>
                  <p style="margin:0;background:#f9f9f9;border-left:4px solid #e63946;padding:12px 16px;color:#333;font-size:13px;border-radius:4px;">${message}</p>
                </td></tr>
                <tr><td style="background:#1A3A6B;padding:14px 32px;text-align:center;">
                  <p style="margin:0;color:#aac4e8;font-size:10px;">info@vatsalyatrust.org  |  www.vatsalyatrust.org</p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `
    });

    console.log("✅ Contact saved & email sent");
    res.json({ success: true, message: "Message sent successfully" });

  } catch (error) {
    console.error("❌ Contact Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/contact", authenticateToken, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, messages });
  } catch (error) {
    console.error("❌ Fetch Contact Error:", error);
    res.status(500).json({ success: false, message: "Failed to load messages" });
  }
});

app.post("/reply", authenticateToken, async (req, res) => {
  try {
    const { id, email, name, replyMessage } = req.body;

    if (!id || !email || !replyMessage) {
      return res.json({ success: false, message: "Missing fields" });
    }

    const updated = await Contact.findByIdAndUpdate(
      id,
      { reply: replyMessage, replied: true },
      { new: true }
    );

    if (!updated) {
      return res.json({ success: false, message: "Message not found" });
    }

    await transporter.sendMail({
      from:    `"Vatsalya Trust Mumbai" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: `We've Received Your Message – Vatsalya Trust`,
      html:    contactReplyTemplate(name, updated.message, replyMessage)
    });

    console.log("✅ Reply sent to:", email);
    res.json({ success: true });

  } catch (error) {
    console.error("❌ Reply Error:", error);
    res.status(500).json({ success: false, message: "Server error while replying" });
  }
});

app.delete("/contact/:id", authenticateToken, async (req, res) => {
  try {
    const deleted = await Contact.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.json({ success: false, message: "Message not found" });
    }

    res.json({ success: true });

  } catch (error) {
    console.error("❌ Delete Contact Error:", error);
    res.status(500).json({ success: false, message: "Server error while deleting" });
  }
});

// ──────────────────────────────────────────────
// Donation Routes
// ──────────────────────────────────────────────

app.post("/create-order", async (req, res) => {
  try {
    const { name, email, phone, amount, currency, purpose } = req.body;
    const order = await razorpay.orders.create({
      amount:  amount * 100,
      currency,
      receipt: "receipt_" + Date.now()
    });

    await Donation.create({ name, email, phone, currency, amount, purpose, orderId: order.id });
    res.json({ id: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Order creation failed" });
  }
});

app.get("/api/donations", authenticateToken, async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 });
    const totalAmount = donations
      .filter(d => d.status === "completed")
      .reduce((sum, d) => sum + (d.amount || 0), 0);

    res.json({ success: true, donations, totalAmount });
  } catch (error) {
    console.error("❌ Fetch Donations Error:", error);
    res.status(500).json({ success: false, message: "Failed to load donations" });
  }
});

app.post("/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.log("❌ Signature mismatch");
      return res.json({ status: "failed" });
    }

    const donation = await Donation.findOneAndUpdate(
      { orderId: razorpay_order_id },
      { paymentId: razorpay_payment_id, status: "completed" },
      { new: true }
    );

    if (!donation) {
      console.log("❌ Donation record not found for order:", razorpay_order_id);
      return res.json({ status: "success", warning: "Donation record not found" });
    }

    const invoiceId = "INV-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    const receiptNo = "DON-" + Date.now();

    console.log("📄 Generating PDF invoice...");
    const pdfPath = await generateInvoicePDF({
      invoiceId,
      receiptNo,
      name:      donation.name,
      email:     donation.email,
      phone:     donation.phone     || "",
      address:   donation.address   || "",
      amount:    donation.amount,
      currency:  donation.currency  || "INR",
      paymentId: razorpay_payment_id,
      orderId:   razorpay_order_id,
      purpose:   donation.purpose   || "General Donation",
    });
    console.log("✅ PDF generated:", pdfPath);

    await Invoice.create({
      invoiceId,
      receiptNo,
      name:      donation.name,
      email:     donation.email,
      amount:    donation.amount,
      currency:  donation.currency || "INR",
      paymentId: razorpay_payment_id,
      orderId:   razorpay_order_id,
      pdfPath
    });

    console.log("📧 Sending invoice email to:", donation.email);
    await transporter.sendMail({
      from:    `"Vatsalya Trust Mumbai" <${process.env.EMAIL_USER}>`,
      to:      donation.email,
      subject: `Donation Receipt – ${receiptNo} | Vatsalya Trust Mumbai`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#f4f4f4;font-family:Helvetica,Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background:#1A3A6B;padding:28px 36px;">
                    <h1 style="margin:0;color:#ffffff;font-size:20px;letter-spacing:1px;">VATSALYA TRUST, MUMBAI</h1>
                    <p style="margin:4px 0 0;color:#C8973A;font-size:12px;">Care  •  Protect  •  Empower</p>
                  </td>
                </tr>
                <tr><td style="background:#C8973A;height:4px;"></td></tr>
                <tr>
                  <td style="padding:32px 36px;">
                    <h2 style="margin:0 0 8px;color:#1A3A6B;font-size:16px;">Dear ${donation.name},</h2>
                    <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 24px;">
                      Thank you for your generous donation of
                      <strong style="color:#1A3A6B;">${donation.currency || "INR"} ${donation.amount}</strong> to
                      Vatsalya Trust Mumbai. 🙏
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0"
                           style="border:1px solid #e0e0e0;border-radius:6px;overflow:hidden;font-size:13px;margin-bottom:24px;">
                      <tr style="background:#1A3A6B;">
                        <td colspan="2" style="padding:10px 16px;color:#C8973A;font-weight:bold;font-size:12px;">PAYMENT SUMMARY</td>
                      </tr>
                      <tr style="background:#F5E9D5;">
                        <td style="padding:10px 16px;color:#555;">Receipt No</td>
                        <td style="padding:10px 16px;font-weight:bold;color:#111;">${receiptNo}</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 16px;color:#555;">Payment ID</td>
                        <td style="padding:10px 16px;color:#111;">${razorpay_payment_id}</td>
                      </tr>
                      <tr style="background:#f9f9f9;">
                        <td style="padding:10px 16px;color:#555;">Amount</td>
                        <td style="padding:10px 16px;font-weight:bold;color:#1A3A6B;">${donation.currency || "INR"} ${donation.amount}</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 16px;color:#555;">Status</td>
                        <td style="padding:10px 16px;font-weight:bold;color:#2E7D32;">✔ Successful</td>
                      </tr>
                    </table>
                    <p style="color:#555;font-size:13px;">Your formal donation invoice is attached as a PDF.</p>
                    <p style="color:#555;font-size:13px;">With warm regards,<br/><strong style="color:#1A3A6B;">The Vatsalya Trust Team</strong></p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#1A3A6B;padding:16px 36px;text-align:center;">
                    <p style="margin:0;color:#aac4e8;font-size:10.5px;">info@vatsalyatrust.org  |  www.vatsalyatrust.org</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
      attachments: [{ filename: `Invoice-${receiptNo}.pdf`, path: pdfPath }]
    });
    console.log("✅ Invoice email sent to:", donation.email);

    res.json({ status: "success" });

  } catch (err) {
    console.error("❌ Payment verification error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

// ──────────────────────────────────────────────
// Volunteer Routes
// ──────────────────────────────────────────────

app.post("/api/volunteer/submit", async (req, res) => {
  try {
    const { name, email, phone, interest, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Name, email, and message are required." });
    }

    const volunteer = new Volunteer({ name, email, phone, interest, message });
    await volunteer.save();

    await transporter.sendMail({
      from:    `"Vatsalya Trust Mumbai" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: "Thank You for Volunteering with Vatsalya Trust",
      html:    volunteerTemplate(name)
    });

    res.status(201).json({ success: true, message: "Application submitted! Check your email." });
  } catch (err) {
    console.error("❌ Volunteer submit error:", err);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
});

app.use("/api/volunteer", authenticateToken, volunteerRoutes);

// ══════════════════════════════════════════════════════════════════════════════
// CMS ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// ──────────────────────────────────────────────
// EVENTS
// ──────────────────────────────────────────────

app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json({ success: true, events });
  } catch (err) {
    console.error("❌ Fetch Events Error:", err);
    res.status(500).json({ success: false, message: "Failed to load events" });
  }
});

app.post("/api/events", authenticateToken, async (req, res) => {
  try {
    const { title, description, image, date, type } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required." });
    }
    const event = await Event.create({ title, description, image, date, type });
    res.json({ success: true, event });
  } catch (err) {
    console.error("❌ Create Event Error:", err);
    res.status(500).json({ success: false, message: "Failed to create event" });
  }
});

app.put("/api/events/:id", authenticateToken, async (req, res) => {
  try {
    const { title, description, image, date, type } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { title, description, image, date, type },
      { new: true }
    );
    if (!event) return res.json({ success: false, message: "Event not found" });
    res.json({ success: true, event });
  } catch (err) {
    console.error("❌ Update Event Error:", err);
    res.status(500).json({ success: false, message: "Failed to update event" });
  }
});

app.delete("/api/events/:id", authenticateToken, async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return res.json({ success: false, message: "Event not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Delete Event Error:", err);
    res.status(500).json({ success: false, message: "Failed to delete event" });
  }
});

// ──────────────────────────────────────────────
// PROJECTS
// ──────────────────────────────────────────────

app.get("/api/projects", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json({ success: true, projects });
  } catch (err) {
    console.error("❌ Fetch Projects Error:", err);
    res.status(500).json({ success: false, message: "Failed to load projects" });
  }
});

app.post("/api/projects", authenticateToken, async (req, res) => {
  try {
    const { title, description, image, funded } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required." });
    }
    const project = await Project.create({ title, description, image, funded: funded || 0 });
    res.json({ success: true, project });
  } catch (err) {
    console.error("❌ Create Project Error:", err);
    res.status(500).json({ success: false, message: "Failed to create project" });
  }
});

app.put("/api/projects/:id", authenticateToken, async (req, res) => {
  try {
    const { title, description, image, funded } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { title, description, image, funded },
      { new: true }
    );
    if (!project) return res.json({ success: false, message: "Project not found" });
    res.json({ success: true, project });
  } catch (err) {
    console.error("❌ Update Project Error:", err);
    res.status(500).json({ success: false, message: "Failed to update project" });
  }
});

app.delete("/api/projects/:id", authenticateToken, async (req, res) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) return res.json({ success: false, message: "Project not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Delete Project Error:", err);
    res.status(500).json({ success: false, message: "Failed to delete project" });
  }
});

// ──────────────────────────────────────────────
// SUCCESS STORIES
// ──────────────────────────────────────────────

app.get("/api/stories", async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.json({ success: true, stories });
  } catch (err) {
    console.error("❌ Fetch Stories Error:", err);
    res.status(500).json({ success: false, message: "Failed to load stories" });
  }
});

app.post("/api/stories", authenticateToken, async (req, res) => {
  try {
    const { title, description, image } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required." });
    }
    const story = await Story.create({ title, description, image });
    res.json({ success: true, story });
  } catch (err) {
    console.error("❌ Create Story Error:", err);
    res.status(500).json({ success: false, message: "Failed to create story" });
  }
});

app.put("/api/stories/:id", authenticateToken, async (req, res) => {
  try {
    const { title, description, image } = req.body;
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      { title, description, image },
      { new: true }
    );
    if (!story) return res.json({ success: false, message: "Story not found" });
    res.json({ success: true, story });
  } catch (err) {
    console.error("❌ Update Story Error:", err);
    res.status(500).json({ success: false, message: "Failed to update story" });
  }
});

app.delete("/api/stories/:id", authenticateToken, async (req, res) => {
  try {
    const deleted = await Story.findByIdAndDelete(req.params.id);
    if (!deleted) return res.json({ success: false, message: "Story not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Delete Story Error:", err);
    res.status(500).json({ success: false, message: "Failed to delete story" });
  }
});
// ──────────────────────────────────────────────
// Serve Frontend (CORRECT FOR YOUR STRUCTURE)
// ──────────────────────────────────────────────

const publicPath = path.join(__dirname, "public");

app.use(express.static(publicPath));

// Catch-all route (WORKS in latest Express)
app.use((req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
