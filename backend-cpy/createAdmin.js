const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Admin = require("./models/Admin"); // Ensure the path to Admin model is correct

// MongoDB Atlas SRV Connection String (Make sure to replace with your correct username, password, and cluster URL)
const mongoURI = "mongodb+srv://shreyasmahajan2006_db_user:$ib%26%2Bt0Ji5h2@cluster0.mongodb.net/admin?retryWrites=true&w=majority";

// Connecting to MongoDB Atlas
mongoose.connect(mongoURI, { connectTimeoutMS: 30000 })
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log("DB connection error:", err));

// Create Admin function
async function createAdmin() {
  try {
    // Hash the password for security
    const hashedPassword = await bcrypt.hash("$ib&+t0Ji5h2", 10);

    // Check if an admin already exists
    const existingAdmin = await Admin.findOne({ email: "admin@example.com" });

    if (existingAdmin) {
      console.log("Admin already exists!");
      return;
    }

    // Create an admin account with email and hashed password
    const admin = new Admin({
      email: "admin@example.com", // You can change this email
      password: hashedPassword
    });

    await admin.save();
    console.log("Admin created successfully!");

    // Exit the process after admin creation
    process.exit();
  } catch (error) {
    console.log("Error creating admin:", error);
    process.exit(1); // Exit with error code
  }
}

// Call the createAdmin function
createAdmin();