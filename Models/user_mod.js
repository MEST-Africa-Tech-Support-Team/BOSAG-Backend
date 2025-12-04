import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String },
  provider: {
    type: String,
    enum: ["email", "google", "facebook"],
    default: "email",
  },
  phone: { type: String, trim: true },
  verificationToken: { type: String },
  verificationTokenExpires: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  role: { type: String, enum: ["member", "admin", "superadmin"], default: "member" },
  stages: { type: String, enum: ["New Account", "Details Submitted", "Details Approved", "Active Member"], default: "New Account" },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });


const User = mongoose.model("User", userSchema);
export default User;
