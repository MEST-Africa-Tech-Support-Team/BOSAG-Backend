import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import Event from "../Models/event_mod.js";
import { sendEmail, templates } from "../Configs/email.js";

/* -------------------------------
 CLOUDINARY CONFIG
-------------------------------- */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* -------------------------------
   MULTER STORAGE SETUP
-------------------------------- */
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "bosag_event_uploads",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

export const upload = multer({ storage });

/* -------------------------------
   CREATE EVENT  (Admin Only)
-------------------------------- */
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, category } = req.body;
    const image = req.file?.path || null;

    if (!title || !description || !date) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const event = await Event.create({
      title,
      description,
      date,
      location,
      category,
      image,
      createdBy: req.user?._id,
    });

    /* -------------------------------------------
        SEND NOTIFICATION TO APPROVED MEMBERS
    ------------------------------------------- */
    const approvedMembers = await User.find({ stages: "Active Member" });

    approvedMembers.forEach(async (member) => {
      await sendEmail({
        to: member.email,
        subject: `New BOSAG Event: ${title}`,
        html: templates.eventNotification(
          member.firstName || "Member",
          title,
          date,
          location
        ),
      });
    });

    res.status(201).json({
      message: "✅ Event created successfully and Notifications sent",
      event,
    });
  } catch (error) {
    console.error("❌ Create Event Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------
   GET ALL EVENTS (Public)
-------------------------------- */
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json(events);
  } catch (error) {
    console.error("❌ Get All Events Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------
   GET SINGLE EVENT (Public)
-------------------------------- */
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.status(200).json(event);
  } catch (error) {
    console.error("❌ Get Event Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------
 UPDATE EVENT (Admin Only)
-------------------------------- */
export const updateEvent = async (req, res) => {
  try {
    const { title, description, date, location, category } = req.body;
    const updateData = { title, description, date, location, category };

    if (req.file) updateData.image = req.file.path;

    const event = await Event.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!event) return res.status(404).json({ message: "Event not found" });

    res.status(200).json({
      message: "✅ Event updated successfully",
      event,
    });
  } catch (error) {
    console.error("❌ Update Event Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------
 DELETE EVENT (Admin Only)
-------------------------------- */
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    await event.deleteOne();
    res.status(200).json({ message: "🗑️ Event deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Event Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
