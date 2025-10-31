import mongoose from "mongoose";

const onboardingFormSchema = new mongoose.Schema(
  {
    // Link to the user who submitted the form
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ORGANIZATIONAL DETAILS
    organizationName: { type: String, required: true, trim: true },
    yearEstablished: { type: Number },
    registrationNumber: { type: String, trim: true },
    organizationType: {
      type: String,
      enum: ["BPO", "ITO", "Shared Services", "Training Provider", "Technology Vendor",  "Other"],
    },
    membershipTier: {
      type: String,
      enum: ["Platinum Full Member", "Gold Full Member", "Bronze Full Member", "Associate Member", "Affiliate Member"],
    },
    sectorFocus: { type: String, trim: true },
    employeesGhana: { type: Number },
    employeesGlobal: { type: Number },

    // CONTACT INFORMATION
    primaryContactName: { type: String, required: true, trim: true },
    jobTitle: { type: String, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    website: { type: String, trim: true },
    address: { type: String, trim: true },

    // GOVERNANCE AND REPRESENTATION
    nominatedRepresentative: { type: String, trim: true },
    position: { type: String, trim: true },
    alternateRepresentative: { type: String, trim: true },
    authorizedSignatory: { type: String, trim: true },

    // COMMITMENT & DECLARATIONS
    agreesConstitution: { type: Boolean, default: false },
    agreesCodeOfConduct: { type: Boolean, default: false },
    commitsParticipation: { type: Boolean, default: false },
    allowsLogoDisplay: { type: Boolean, default: false },

    //  REQUIRED ATTACHMENTS (URLs from Cloudinary)
    registrationCertificate: { type: String }, 
    companyProfile: { type: String }, 
    logo: { type: String }, 
    brochure: { type: String }, 
    signatureImage: { type: String }, 

    // F. SIGNATURE & CONFIRMATION
    representativeName: { type: String, trim: true },
    dateSigned: { type: Date },

    // ADMIN USE
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
