import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },
    location: {
      type: String,
      required: [true, "Event location is required"],
    },
    image: {
      type: String, 
      required: [true, "Event image is required"],
    },
    category: {
      type: String,
      enum: ["Workshop", "Seminar", "Conference", "Webinar", "Other"],
      default: "Other",
    },
    status: {
      type: String,
      enum: ["Upcoming", "Past", "inProgerss", "Completed"],
      default: "Upcoming",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
export default Event;
