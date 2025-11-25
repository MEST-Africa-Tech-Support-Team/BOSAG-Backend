import express from "express";
import {
  submitOnboardingForm,
  getMyOnboardingForm,
  getAllOnboardingForms,
  updateOnboardingStatus,
  updateMyOnboardingForm,
  upload,
  deleteOnboardingForm, 
} from "../Controllers/membership_con.js";

import { protect, adminOnly } from "../Middleware/auth_mid.js";

const onboardingRoutes = express.Router();

/**
 * @route POST /api/onboarding/submit
 * @desc Submit BOSAG Member Onboarding Form
 * @access Private (Logged-in users only)
 */
onboardingRoutes.post(
  "/submit",
  protect,
  upload.fields([
    { name: "registrationCertificate", maxCount: 1 },
    { name: "companyProfile", maxCount: 1 },
    { name: "logo", maxCount: 1 },
    { name: "brochure", maxCount: 1 },
    { name: "signatureImage", maxCount: 1 },
  ]),
  submitOnboardingForm
);

onboardingRoutes.put("/update", protect, upload.fields([
  { name: "registrationCertificate", maxCount: 1 },
  { name: "companyProfile", maxCount: 1 },
  { name: "logo", maxCount: 1 },
  { name: "brochure", maxCount: 1 },
  { name: "signatureImage", maxCount: 1 },
]), updateMyOnboardingForm);


/**
 * @route GET /api/onboarding/me
 * @desc Get the logged-in user’s onboarding form
 * @access Private
 */
onboardingRoutes.get("/me", protect, getMyOnboardingForm);

/**
 * @route GET /api/onboarding/all
 * @desc Admin: View all submitted onboarding forms
 * @access Admin only
 */
onboardingRoutes.get("/all", protect, adminOnly, getAllOnboardingForms);

// admin-only route
onboardingRoutes.get("/onboarding/:id", protect, adminOnly, getMyOnboardingForm);

/**
 * @route PATCH /api/onboarding/:id/status
 * @desc Admin: Approve or reject onboarding form
 * @access Admin only
 */
onboardingRoutes.patch("/:id/status", protect, adminOnly, updateOnboardingStatus);

onboardingRoutes.delete("/admin/:id", protect, adminOnly, deleteOnboardingForm);

export default onboardingRoutes;
