const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    status: {
        type: String,
        default: "unread"
    },
    time: {
        type: String,
        default: () => new Date().toLocaleString()
    }
});

module.exports = mongoose.model("Message", messageSchema);