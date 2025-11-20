const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phone: { type: String },
  address: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  resetToken: String,
  resetTokenExpiry: Date,
  otp: String,
  otpExpiry: Date,
  isEmailVerified: { type: Boolean, default: false },
  tempRegistrationData: {
    name: String,
    password: String,
    phone: String,
    address: String,
    role: String,
  },
});

userSchema.pre("save", async function (next) {
  // Hash password only if it's modified and not empty
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  
  // Validation: name and password are required only when email is verified
  if (this.isEmailVerified) {
    if (!this.name || !this.password) {
      return next(new Error("Name and password are required for verified users"));
    }
  }
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
