import mongoose from "mongoose";

const onboardingFormSchema = new mongoose.Schema(
  {
    // 🔗 Link to the user who submitted the form
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🏢 A. ORGANIZATIONAL DETAILS
    organizationName: { type: String, required: true, trim: true },
    yearEstablished: { type: Number },
    registrationNumber: { type: String, trim: true },
    organizationType: {
      type: String,
      enum: ["SME", "Startup", "NGO", "Corporate", "Other"],
    },
    membershipTier: {
      type: String,
      enum: ["Gold", "Silver", "Bronze", "Associate"],
    },
    sectorFocus: { type: String, trim: true },
    employeesGhana: { type: Number },
    employeesGlobal: { type: Number },

    // 📞 B. CONTACT INFORMATION
    primaryContactName: { type: String, required: true, trim: true },
    jobTitle: { type: String, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    website: { type: String, trim: true },
    address: { type: String, trim: true },

    // 🧑‍💼 C. GOVERNANCE AND REPRESENTATION
    nominatedRepresentative: { type: String, trim: true },
    position: { type: String, trim: true },
    alternateRepresentative: { type: String, trim: true },
    authorizedSignatory: { type: String, trim: true },

    // 📜 D. COMMITMENT & DECLARATIONS
    agreesConstitution: { type: Boolean, default: false },
    agreesCodeOfConduct: { type: Boolean, default: false },
    commitsParticipation: { type: Boolean, default: false },
    allowsLogoDisplay: { type: Boolean, default: false },

    // 📂 E. REQUIRED ATTACHMENTS (URLs from Cloudinary)
    registrationCertificate: { type: String }, // PDF/image link
    companyProfile: { type: String }, // PDF
    logo: { type: String }, // image
    brochure: { type: String }, // PDF/image
    signatureImage: { type: String }, // image of signature (URL)

    // ✍️ F. SIGNATURE & CONFIRMATION
    representativeName: { type: String, trim: true },
    dateSigned: { type: Date },

    // 🧑‍⚖️ ADMIN USE
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

const OnboardingForm = mongoose.model("OnboardingForm", onboardingFormSchema);
export default OnboardingForm;
