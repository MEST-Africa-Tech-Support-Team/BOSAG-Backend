import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../Models/user_mod.js";
import { sendEmail, templates } from "../Configs/email.js";
import Joi from "joi";
import passport from "passport";

// JOI VALIDATION
const registerSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  provider: Joi.string().valid("google", "facebook", "email").default("email"),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// HELPER FUNCTIONS
const createToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { firstName, lastName, email, password, provider } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      provider,
      verificationToken,
      verificationTokenExpires,
      isVerified: false,
    });

    const verificationLink = `${process.env.BACKEND_URL}/api/users/verify-email/${verificationToken}`;
    await sendEmail(email, "Verify Your BOSAG Account", templates.verifyEmail(verificationLink));

    res.status(201).json({
      message: "User registered successfully. Please check your email to verify your account.",
    });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// VERIFY EMAIL
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.send(`
        <h2>Invalid or expired verification link</h2>
        <p>Please request a new verification email.</p>
      `);

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    try {
      await sendEmail(user.email, "Welcome to BOSAG!", templates.welcome(user.firstName));
    } catch (emailErr) {
      console.error("⚠️ Welcome email failed:", emailErr.message);
    }

    res.send(`
      <div style="font-family: Arial, sans-serif; text-align:center; margin-top:50px;">
        <h1 style="color:#0b58bc;">🎉 Account Verified!</h1>
        <p>Hello ${user.firstName}, your account has been successfully verified.</p>
        <a href="${process.env.FRONTEND_URL}/login" style="display:inline-block;background:#0b58bc;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;margin-top:20px;">
          Go to Login
        </a>
      </div>
    `);
  } catch (err) {
    console.error("❌ Email Verification Error:", err);
    res.status(500).send("<h2>Server Error</h2><p>Please try again later.</p>");
  }
};

// LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isVerified)
      return res.status(401).json({ message: "Please verify your email before logging in" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = createToken(user);
    res.json({ message: "Login successful", token, user });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// GOOGLE LOGIN (Passport)
export const googleAuth = passport.authenticate("google", { scope: ["profile", "email"] });

export const googleCallback = (req, res) => {
  const token = createToken(req.user);
  res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}`);
};

// SOCIAL LOGIN (manual fallback)
export const socialLogin = async (req, res) => {
  try {
    const { email, provider, firstName, lastName } = req.body;
    if (!email || !provider)
      return res.status(400).json({ message: "Email and provider are required" });

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        provider,
        firstName: firstName || "",
        lastName: lastName || "",
        isVerified: true,
      });
    }

    const token = createToken(user);
    res.json({ message: "Social login successful", token, user });
  } catch (err) {
    console.error("❌ Social Login Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendEmail(email, "Reset Your BOSAG Password", templates.resetPassword(resetLink));

    res.json({ message: "Password reset email sent successfully." });
  } catch (err) {
    console.error("❌ Forgot Password Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("❌ Reset Password Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, phone, email } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (email) {
      const emailExists = await User.findOne({ email });
      if (emailExists && emailExists._id.toString() !== userId)
        return res.status(400).json({ message: "Email already in use" });
      user.email = email;
    }

    await user.save();
    res.status(200).json({
      message: "Profile updated successfully",
      user: { ...user._doc, password: undefined },
    });
  } catch (err) {
    console.error("❌ Update Profile Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// CREATE ADMIN (Superadmin only)
export const createAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      provider: "email",
      role: "admin",
      isVerified: true,
    });

    res.status(201).json({
      message: "✅ Admin created successfully",
      admin: newAdmin,
    });
  } catch (err) {
    console.error("❌ Create Admin Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

