const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

// 📩 Save message
router.post("/contact", async (req, res) => {
    try {
        const newMessage = new Message(req.body);
        await newMessage.save();
        res.send({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).send({ success: false });
    }
});

// 📥 Get all messages
router.get("/messages", async (req, res) => {
    try {
        const messages = await Message.find().sort({ _id: -1 });
        res.send(messages);
    } catch (err) {
        res.status(500).send([]);
    }
});

// ✅ Mark as read
router.put("/mark-read/:id", async (req, res) => {
    try {
        await Message.findByIdAndUpdate(req.params.id, {
            status: "read"
        });
        res.send({ success: true });
    } catch (err) {
        res.status(500).send({ success: false });
    }
});

// ❌ Delete message
router.delete("/delete/:id", async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.send({ success: true });
    } catch (err) {
        res.status(500).send({ success: false });
    }
});

module.exports = router;