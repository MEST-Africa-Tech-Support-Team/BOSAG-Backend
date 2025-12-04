import 'dotenv/config'; 
import express from "express";
import cors from "cors";
import morgan from "morgan";
import passport from "passport"; 
import session from "express-session"; 
import MongoStore from 'connect-mongo';
import "./Configs/passport.js"; 
import connectDB from "./Configs/database.js";
import userRoutes from "./Routes/user_route.js";
import onboardingRoutes from "./Routes/membership_route.js";
import eventRoutes from "./Routes/event_route.js";


// APP INITIALIZATION
const app = express();


// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Required for Google OAuth to maintain login sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET || "bosag_secret_key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,   
      collectionName: "sessions",
      ttl: 14 * 24 * 60 * 60, 
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production", 
      httpOnly: true,
      maxAge: 14 * 24 * 60 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());

// CONNECT TO DATABASE
connectDB();


// ROUTES
app.get("/", (req, res) => {
  res.send("BOSAG Backend is running...");
});

// User authentication routes
app.use("/api/users", userRoutes);

// Membership onboarding routes
app.use("/api/onboarding", onboardingRoutes);

// Event management routes
app.use("/api/events", eventRoutes);


// ERROR HANDLING
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});


// START SERVER
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});