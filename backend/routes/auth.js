const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto"); // For reset token
const { sendOTPEmail } = require("../utils/emailService");

// Send OTP for registration
router.post("/send-otp", async (req, res) => {
  const { email, name, password, phone, address, role } = req.body;
  try {
    // Check if verified user already exists
    const existingUser = await User.findOne({ email, isEmailVerified: true });
    if (existingUser) {
      return res.status(400).json({ msg: "User with this email already exists" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP and registration data temporarily
    // Delete any existing unverified user with this email first
    await User.deleteMany({ email, isEmailVerified: false });
    
    // Create new temporary user
    const tempUser = new User({
      email,
      otp,
      otpExpiry,
      isEmailVerified: false,
      tempRegistrationData: {
        name,
        password,
        phone,
        address,
        role: role || "user",
      },
    });
    await tempUser.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
      res.json({ msg: "OTP sent to your email" });
    } catch (emailError) {
      console.error("Error sending OTP email:", emailError);
      return res.status(500).json({ 
        msg: emailError.message || "Error sending OTP. Please try again later." 
      });
    }
  } catch (err) {
    console.error("Error in send-otp route:", err);
    
    // Handle database errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: "Invalid registration data" });
    } else if (err.code === 11000) {
      return res.status(400).json({ msg: "Email already exists" });
    }
    
    res.status(500).json({ 
      msg: err.message || "Error processing request. Please try again later." 
    });
  }
});

// Verify OTP and Register
router.post("/verify-otp-register", async (req, res) => {
  const { email, otp } = req.body;
  try {
    // Find temporary user with OTP
    const tempUser = await User.findOne({ 
      email, 
      otp, 
      otpExpiry: { $gt: Date.now() },
      isEmailVerified: false 
    });

    if (!tempUser || !tempUser.tempRegistrationData) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    // Check if user already exists (double check)
    const existingUser = await User.findOne({ email, isEmailVerified: true });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Update user with actual registration data from tempRegistrationData
    const { name, password, phone, address, role } = tempUser.tempRegistrationData;
    tempUser.name = name;
    tempUser.password = password;
    tempUser.phone = phone;
    tempUser.address = address;
    tempUser.role = role || "user";
    tempUser.isEmailVerified = true;
    tempUser.otp = undefined;
    tempUser.otpExpiry = undefined;
    tempUser.tempRegistrationData = undefined;
    await tempUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: tempUser._id, role: tempUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token, msg: "Registration successful" });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(400).json({ msg: "Invalid credentials" });
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

//Forget Password (send reset email)
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });
    const token = crypto.randomBytes(20).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset",
      text: `Reset link: http://localhost:3000/reset-password/${token}`,
    };
    await transporter.sendMail(mailOptions);
    res.json({ msg: "Reset email sent" });
  } catch (err) {
    res.status(500).json({ msg: "Error sending email" });
  }
});

// Reset Password
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ msg: "Invalid/expired token" });
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    res.json({ msg: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Get user profile
router.get("/profile", require("../middleware/authMiddleware").protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Update user profile
router.put("/profile", require("../middleware/authMiddleware").protect, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    await user.save();
    const userResponse = await User.findById(req.user.id).select("-password");
    res.json(userResponse);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Admin: Get all users
router.get("/users", require("../middleware/authMiddleware").protect, require("../middleware/authMiddleware").admin, async (req, res) => {
  try {
    // Get all users that have a name (actual registered users, not temporary OTP entries)
    // This includes verified users and users created before OTP was implemented
    const users = await User.find({ 
      name: { $exists: true, $ne: null, $ne: "" }
    })
    .select("-password -resetToken -resetTokenExpiry -otp -otpExpiry -tempRegistrationData")
    .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Admin: Delete user
router.delete("/users/:id", require("../middleware/authMiddleware").protect, require("../middleware/authMiddleware").admin, async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user.id;
    
    // Prevent admin from deleting themselves
    if (userId === currentUserId) {
      return res.status(400).json({ msg: "You cannot delete your own account" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    await User.findByIdAndDelete(userId);
    res.json({ msg: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
