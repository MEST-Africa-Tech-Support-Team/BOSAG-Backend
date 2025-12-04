import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  createAdmin,
  updateProfile,
  getMyProfile,
  deleteUser,
  getAllUsers,
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
// Step 1: Redirect user to Google
userRoutes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: Google callback
userRoutes.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "https://bosag.org/login",
    session: false
   }),
  (req, res) => {
    const user = req.user;

    // Create JWT to send to frontend
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Redirect to dashboard
    res.redirect(`https://bosag.org/dashboard?token=${token}`);
  }
);


export default userRoutes;
