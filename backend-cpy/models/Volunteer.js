const mongoose = require("mongoose");

/**
 * Volunteer Schema
 * Stores all volunteer application submissions from the frontend form.
 */
const volunteerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true,
    default: ""
  },
  interest: {
    type: String,
    default: ""
  },
  message: {
    type: String,
    required: [true, "Message is required"],
    trim: true
  },
  reply: {
    type: String,
    default: ""
  },
  replied: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Volunteer", volunteerSchema);