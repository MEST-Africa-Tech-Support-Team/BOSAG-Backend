
import passport from "passport";
import {
  
  verifyEmail,
  loginUser,
  forgotPassword,
  resetPassword,
  socialLogin,
  createAdmin,
  updateProfile,
  googleAuth,
  googleCallback,
  registerUser,
} from "../Controllers/user_con.js";
import { protect, adminOnly } from "../Middleware/auth_mid.js";
import { Router } from "express";

const userRoutes = Router()

// ======================
// USER AUTH ROUTES
// ======================

// Register new user (public)
userRoutes.post("/register", registerUser);

// Verify email via link (public)
userRoutes.get("/verify-email/:token", verifyEmail);

// Login user (public)
userRoutes.post("/login", loginUser);

// Forgot password (public)
userRoutes.post("/forgot-password", forgotPassword);

// Reset password (public)
userRoutes.post("/reset-password/:token", resetPassword);

// Manual/Firebase social login (public)
userRoutes.post("/social-login", socialLogin);

// ======================
// GOOGLE AUTH ROUTES
// ======================

// Step 1: Redirect user to Google for consent
userRoutes.get("/auth/google", googleAuth);

// Step 2: Handle callback after Google login success/failure
userRoutes.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  googleCallback
);

// ======================
// USER PROFILE ROUTES
// ======================
userRoutes.put("/user-profile", protect, updateProfile);

// ======================
// 👨‍💼 ADMIN ROUTES
// ======================
userRoutes.post("/create-admin", createAdmin);

export default userRoutes;
