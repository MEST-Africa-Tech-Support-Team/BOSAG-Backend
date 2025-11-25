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
    resource_type: "auto", 
    allowed_formats: ["jpg", "png", "pdf", "jpeg"],
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

    // ⭐ UPDATE USER STAGE
    await User.findByIdAndUpdate(
      req.user._id,
      { stages: "Details Submitted" },
      { new: true }
    );


    // Send confirmation email
    const user = await User.findById(req.user._id);
    if (user) {
      const name = user.firstName || user.name || "Member";
      await sendEmail({
      to: user.email,
      subject: "BOSAG Onboarding Form Received",
      html: templates?.onboardingConfirmation(name, newForm.membershipTier)
    });


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
// UsER: GET OWN FORM
export const getMyOnboardingForm = async (req, res) => {
  try {
    const form = await OnboardingForm.findOne({ user: req.user._id });
    if (!form) {
      return res.status(404).json({ message: "Form not found for this user" });
    }

    // ✅ Convert to plain JSON
    const plainForm = form.toObject();

    res.status(200).json(plainForm);
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

// ADMIN: GET SINGLE ONBOARDING FORM BY ID
export const getOnboardingFormById = async (req, res) => {
  try {
    const { id } = req.params;

    const form = await OnboardingForm.findById(id)
      .populate("user", "firstName lastName email");

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.status(200).json(form);
  } catch (err) {
    console.error("❌ Admin Get Single Form Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ADMIN: UPDATE STATUS (Approve/Reject)
export const updateOnboardingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    // Validate status
    const validStatuses = ["Pending", "Payment Pending", "Approved", "Rejected"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find form
    const form = await OnboardingForm.findById(id);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Update form fields
    form.status = status || form.status;
    form.remarks = remarks || form.remarks;
    await form.save();

    // Fetch associated user (the applicant)
    const user = await User.findById(form.user);
    if (user) {
      const name = user.firstName || "Member";

      // Update user stage based on application status
      if (status === "Payment Pending") {
        user.stages = "Details Approved";
      }

      if (status === "Approved") {
        user.stages = "Active Member";
      }

      if (status === "Rejected") {
        user.stages = "Application Rejected";
      }

      await user.save();
      
      // Send status email
      await sendEmail({
      to: user.email,
      subject: "BOSAG Membership Application Status Update",
      html: templates?.onboardingStatusUpdate
      ? templates.onboardingStatusUpdate(name, form.status, form.remarks, form.membershipTier)
      : `<p>Hello ${name}, your application has been <strong>${form.status}</strong>.<br/>Remarks: ${form.remarks || "None"}</p>`
});
    }

    res.json({
      message: "✅ Form status updated, stage updated, and email sent",
      form
    });

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
      await sendEmail({
  to: user.email,
  subject: "BOSAG Onboarding Form Updated",
  html: templates?.updateMyOnboardingForm
    ? templates.updateMyOnboardingForm(name)
    : `<p>Hello ${name}, your onboarding form has been updated successfully.</p>`
});

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

// ADMIN: DELETE ONBOARDING FORM
export const deleteOnboardingForm = async (req, res) => {
  try {
    const { id } = req.params;

    const form = await OnboardingForm.findById(id);
    if (!form) return res.status(404).json({ message: "Form not found" });

    // ⛔ Remove only the form, not Cloudinary files
    await form.deleteOne();

    const user = await User.findById(form.user);
    if (user) {
      const name = user.firstName || "Member";
      await sendEmail({
        to: user.email,
        subject: "BOSAG Onboarding Form Deleted",
        html: `<p>Hello ${name}, your onboarding form has been deleted by the admin.</p>`
      });
    }

    res.json({ message: "Form deleted successfully " });
  } catch (err) {
    console.error("❌ Delete Form Error:", err);
    res.status(500).json({ message: "Server error. Could not delete form." });
  }
};
