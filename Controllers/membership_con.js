import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import OnboardingForm from "../Models/membership_mod.js";
import User from "../Models/user_mod.js";
import { sendEmail, templates } from "../Configs/email.js";

// ==============================
// 1️⃣ CLOUDINARY CONFIG
// ==============================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ==============================
// 2️⃣ MULTER STORAGE CONFIG
// ==============================
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "bosag_onboarding_uploads",
    allowed_formats: ["jpg", "png", "pdf"],
  },
});

export const upload = multer({ storage });

// ==============================
// 3️⃣ SUBMIT ONBOARDING FORM
// ==============================
export const submitOnboardingForm = async (req, res) => {
  try {
    // Extract uploaded files from Cloudinary
    const fileFields = [
      "registrationCertificate",
      "companyProfile",
      "logo",
      "brochure",
      "signatureImage",
    ];

    const uploadedFiles = {};
    fileFields.forEach((field) => {
      if (req.files && req.files[field]) {
        uploadedFiles[field] = req.files[field][0].path; // Cloudinary URL
      }
    });

    // Create new onboarding form
    const newForm = new OnboardingForm({
      user: req.user._id,
      ...req.body,
      ...uploadedFiles,
    });

    await newForm.save();

    // ✅ Send confirmation email to the user
    const user = await User.findById(req.user._id);
    if (user) {
      await sendEmail(
        user.email,
        "BOSAG Onboarding Form Received",
        templates.onboardingConfirmation(user.firstName || "Member")
      );
    }

    res.status(201).json({
      message: "✅ Onboarding form submitted successfully. Confirmation email sent.",
      form: newForm,
    });
  } catch (err) {
    console.error("❌ Onboarding Form Error:", err);
    res.status(500).json({ message: "Server error. Could not submit form." });
  }
};

// ==============================
// 4️⃣ GET USER’S ONBOARDING FORM
// ==============================
export const getMyOnboardingForm = async (req, res) => {
  try {
    const form = await OnboardingForm.findOne({ user: req.user._id });
    if (!form)
      return res.status(404).json({ message: "Form not found for this user" });

    res.json({ form });
  } catch (err) {
    console.error("❌ Get Form Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 5️⃣ ADMIN: GET ALL SUBMISSIONS
// ==============================
export const getAllOnboardingForms = async (req, res) => {
  try {
    const forms = await OnboardingForm.find().populate("user", "firstName lastName email");
    res.json(forms);
  } catch (err) {
    console.error("❌ Admin Get Forms Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==============================
// 6️⃣ ADMIN: UPDATE STATUS (Approve/Reject)
// ==============================
export const updateOnboardingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const form = await OnboardingForm.findById(id);
    if (!form)
      return res.status(404).json({ message: "Form not found" });

    form.status = status || form.status;
    form.remarks = remarks || form.remarks;

    await form.save();

    // ✅ Notify the user of the status update
    const user = await User.findById(form.user);
    if (user) {
      await sendEmail(
        user.email,
        "BOSAG Membership Application Status Update",
        templates.onboardingStatusUpdate(
          user.firstName || "Member",
          form.status,
          form.remarks
        )
      );
    }

    res.json({ message: "✅ Form status updated and email sent", form });
  } catch (err) {
    console.error("❌ Update Status Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
