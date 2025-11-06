import express from "express";
import { protect, adminOnly } from "../Middleware/auth_mid.js";
import {
  upload,
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../Controllers/event_con.js";

const eventRoutes = express.Router();

// Public routes
eventRoutes.get("/", getAllEvents);
eventRoutes.get("/:id", getEventById);

// Admin routes
eventRoutes.post("/create", protect, adminOnly, upload.single("image"), createEvent);
eventRoutes.put("/:id", protect, adminOnly, upload.single("image"), updateEvent);
eventRoutes.delete("/:id", protect, adminOnly, deleteEvent);

export default eventRoutes;
