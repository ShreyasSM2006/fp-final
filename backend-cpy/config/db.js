const mongoose = require("mongoose");

/**
 * connectDB
 * Connects to MongoDB using the URI stored in the .env file.
 * Call this once at server startup.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1); // Stop the server if DB fails
  }
};

module.exports = connectDB;