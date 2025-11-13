import express from "express";
import passport from "passport";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  socialLogin,
  createAdmin,
  updateProfile,
  getMyProfile,
  deleteUser,
  getAllUsers,
  googleOAuthLogin,
} from "../Controllers/user_con.js";
import { protect, adminOnly } from "../Middleware/auth_mid.js";

const userRoutes = express.Router();

// USER AUTH ROUTES

// Register new user (public)
userRoutes.post("/register", (req, res, next) => {
  console.log("Register route hit");
  next();
}, registerUser);

// Login user (public)
userRoutes.post("/login", loginUser);

// User get their own profile (private)
userRoutes.get("/get-profile", protect, getMyProfile)

// Forgot password (public)
userRoutes.post("/forgot-password", forgotPassword);

// Reset password (public)
userRoutes.put("/reset-password/:token", resetPassword);

// Manual/Firebase social login (public)
userRoutes.post("/social-login", socialLogin);

// User deletes account (private)
userRoutes.delete("/delete-account", protect, deleteUser);

//  USER PROFILE ROUTES
userRoutes.put("/user-profile", protect, updateProfile);

// ADMIN ROUTES
// A dmin creation route
userRoutes.post("/create-admin", createAdmin);

// Admin delete user 
userRoutes.delete("/delete-user/:id", protect, adminOnly, deleteUser);

// Admin get all users
userRoutes.get("/get-all", protect, adminOnly, getAllUsers);

// GOOGLE OAUTH LOGIN ROUTE
userRoutes.post("/auth/google", googleOAuthLogin);

export default userRoutes;
