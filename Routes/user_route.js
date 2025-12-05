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
  passport.authenticate("google", { 
    scope: ["profile", "email"], 
    session: false 
  })
);

// Step 2: Google callback - FIXED VERSION
userRoutes.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user, info) => {
      if (err) {
        console.error("Google Auth Error:", err);
        return res.redirect("https://bosag.org/login?error=google_auth_failed");
      }
      
      if (!user) {
        console.error("No user returned from Google strategy");
        return res.redirect("https://bosag.org/login?error=no_user");
      }

      try {
        // Create JWT to send to frontend
        const token = jwt.sign(
          { id: user._id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        res.redirect(`https://bosag.org/dashboard?token=${token}&user=${encodeURIComponent(JSON.stringify({
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }))}`);

        // Method 2: Set token in cookie (if frontend can read it)
        // res.cookie('auth_token', token, {
        //   httpOnly: false, // frontend needs to read it
        //   secure: process.env.NODE_ENV === 'production',
        //   sameSite: 'lax',
        //   maxAge: 7 * 24 * 60 * 60 * 1000
        // });
        // res.redirect('https://bosag.org/dashboard');

      } catch (error) {
        console.error("JWT creation error:", error);
        res.redirect("https://bosag.org/login?error=token_creation_failed");
      }
    })(req, res, next);
  }
);



export default userRoutes;
