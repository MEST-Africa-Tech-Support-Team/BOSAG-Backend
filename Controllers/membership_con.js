import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import OnboardingForm from "../Models/membership_mod.js";
import User from "../Models/user_mod.js";
import { sendEmail, templates } from "../Configs/email.js";

// CLOUDINARY CONFIG
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MULTER STORAGE CONFIG

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "bosag_onboarding_uploads",
    allowed_formats: ["jpg", "png", "pdf"],
  },
});

export const upload = multer({ storage });

// SUBMIT ONBOARDING FORM

export const submitOnboardingForm = async (req, res) => {
  try {
    const fileFields = ["registrationCertificate", "companyProfile", "logo", "brochure"];
    const uploadedFiles = {};

    fileFields.forEach((field) => {
      if (req.files && req.files[field]) {
        uploadedFiles[field] = req.files[field][0].path; // Cloudinary URL
      }
    });

    const newForm = new OnboardingForm({
      user: req.user._id,
      ...req.body,
      ...uploadedFiles,
    });

    await newForm.save();

    // Send confirmation email
    const user = await User.findById(req.user._id);
    if (user) {
      const name = user.firstName || user.name || "Member";
      await sendEmail(
        user.email,
        "BOSAG Onboarding Form Received",
        templates?.onboardingConfirmation
          ? templates.onboardingConfirmation(name)
          : `<p>Hello ${name}, your onboarding form has been received. Thank you!</p>`
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
// 👤 GET USER’S OWN FORM
// ==============================
export const getMyOnboardingForm = async (req, res) => {
  try {
    const form = await OnboardingForm.findOne({ user: req.user._id });
    if (!form) return res.status(404).json({ message: "Form not found for this user" });

    res.json({ form });
  } catch (err) {
    console.error("❌ Get Form Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ADMIN: GET ALL FORMS
export const getAllOnboardingForms = async (req, res) => {
  try {
    const forms = await OnboardingForm.find()
      .populate("user", "firstName lastName email");
    res.json(forms);
  } catch (err) {
    console.error("❌ Admin Get Forms Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ADMIN: UPDATE STATUS (Approve/Reject)
export const updateOnboardingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const form = await OnboardingForm.findById(id);
    if (!form) return res.status(404).json({ message: "Form not found" });

    form.status = status || form.status;
    form.remarks = remarks || form.remarks;
    await form.save();

    const user = await User.findById(form.user);
    if (user) {
      const name = user.firstName || "Member";
      await sendEmail(
        user.email,
        "BOSAG Membership Application Status Update",
        templates?.onboardingStatusUpdate
          ? templates.onboardingStatusUpdate(name, form.status, form.remarks)
          : `<p>Hello ${name}, your application has been <strong>${form.status}</strong>.<br/>Remarks: ${form.remarks || "None"}</p>`
      );
    }

    res.json({ message: "✅ Form status updated and email sent", form });
  } catch (err) {
    console.error("❌ Update Status Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// USER: UPDATE OWN FORM

export const updateMyOnboardingForm = async (req, res) => {
  try {
    const form = await OnboardingForm.findOne({ user: req.user._id });
    if (!form)
      return res.status(404).json({ message: "No onboarding form found for this user" });

    const fileFields = ["registrationCertificate", "companyProfile", "logo", "brochure"];
    const uploadedFiles = {};

    fileFields.forEach((field) => {
      if (req.files && req.files[field]) {
        uploadedFiles[field] = req.files[field][0].path;
      }
    });

    Object.assign(form, req.body, uploadedFiles);
    await form.save();

    const user = await User.findById(req.user._id);
    if (user) {
      const name = user.firstName || "Member";
      await sendEmail(
        user.email,
        "BOSAG Onboarding Form Updated",
        templates?.onboardingUpdateConfirmation
          ? templates.onboardingUpdateConfirmation(name)
          : `<p>Hello ${name}, your onboarding form has been updated successfully.</p>`
      );
    }

    res.json({
      message: "✅ Onboarding form updated successfully.",
      form,
    });
  } catch (err) {
    console.error("❌ Update Form Error:", err);
    res.status(500).json({ message: "Server error. Could not update form." });
  }
};
