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

// REGISTER USER (Auto-verified version)
export const registerUser = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { firstName, lastName, email, password, provider } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Automatically verified
    user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      provider,
      isVerified: true, // <-- already verified
    });

    // Email link just leads to login page
    const loginLink = `${process.env.FRONTEND_URL}/login`;

    await sendEmail(
      email,
      "Welcome to BOSAG!",
      templates.welcomeEmail(firstName, loginLink)
    );

    res.status(201).json({
      message:
        "✅ Account created successfully. Please check your email for confirmation.",
    });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    res.status(500).json({ message: "Server Error" });
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
  res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
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

// GET MY PROFILE
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // exclude password
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile retrieved successfully", user });
  } catch (err) {
    console.error("❌ Get Profile Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ADMIN: GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    // Check if current user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ message: "All users retrieved successfully", users });
  } catch (err) {
    console.error("❌ Get All Users Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ADMIN: DELETE USER
export const deleteUser = async (req, res) => {
  try {
    // Only admins can delete users
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting other admins if needed (optional safeguard)
    if (user.role === "admin") {
      return res.status(400).json({ message: "Admins cannot delete other admins" });
    }

    await user.deleteOne();

    res.json({ message: `✅ User '${user.email}' deleted successfully.` });
  } catch (err) {
    console.error("❌ Delete User Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
