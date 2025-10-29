import 'dotenv/config'; 
import express from "express";
import cors from "cors";
import morgan from "morgan";
import passport from "passport"; 
import session from "express-session"; 
import "./Configs/passport.js"; 

import connectDB from "./Configs/database.js";
import userRoutes from "./Routes/user_route.js";
import onboardingRoutes from "./Routes/membership_route.js";

// ======================
// APP INITIALIZATION
// ======================
const app = express();

// ======================
// MIDDLEWARE
// ======================
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ✅ Required for Google OAuth to maintain login sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || "bosag_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ======================
// CONNECT TO DATABASE
// ======================
connectDB();

// ======================
// ROUTES
// ======================
app.get("/", (req, res) => {
  res.send("🚀 BOSAG Backend is running...");
});

// User authentication routes
app.use("/api/users", userRoutes);

// Membership onboarding routes
app.use("/api/onboarding", onboardingRoutes);

// ======================
// ERROR HANDLING
// ======================
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 7700;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
