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
  type: [String], // 
  enum: ["BPO", "ITO", "Shared Services", "Training Provider", "Technology Vendor", "Other"],
  required: true,
},

otherOrganizationType: {
  type: String, // 
  trim: true,
},

    membershipTier: {
      type: String,
      enum: ["Platinum Member", "Gold Member", "Start-ups & Associate Member", "Vendors & Affiliate Member"],
    },
    sectorFocus: { type: String, trim: true },
    employeesGhana: { type: Number },
    employeesGlobal: { type: Number },

    // ORGANIZATION AND CONTACT INFORMATION
    primaryContactName: { type: String, required: true, trim: true },
    jobTitle: { type: String, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    website: { type: String, trim: true },
    PostalAddress: { type: String, trim: true },
    CompanyEmail: { type: String, required: true, lowercase: true, trim: true },
    CompanyPhone: { type: String, trim: true },

    // GOVERNANCE AND REPRESENTATION
    nominatedRepresentative: { type: String, trim: true },
    position: { type: String, trim: true },
    NomPhone: { type: String, trim: true },
    NomEmail: { type: String, lowercase: true, trim: true },
    alternateRepresentative: { type: String, trim: true },
    altPosition: { type: String, trim: true },
    AltPhone: { type: String, trim: true },
    AltEmail: { type: String, lowercase: true, trim: true },
    
    // COMMITMENT & DECLARATIONS
    agreesConstitution: { type: Boolean, default: false },
    accurateInformation: { type: Boolean, default: false },
    commitsParticipation: { type: Boolean, default: false },
    BosagApproval: { type: Boolean, default: false },
    agreesFeePayment: { type: Boolean, default: false },

    //  REQUIRED ATTACHMENTS (URLs from Cloudinary)
    registrationCertificate: { type: String }, 
    companyProfile: { type: String }, 
    logo: { type: String }, 
    brochure: { type: String },  

    // AUTHORIZED SIGNATORY DETAILS
    authorizedSignatory: { type: String, trim: true },

    // F. SIGNATURE & CONFIRMATION
    representativeName: { type: String, trim: true },
    dateSigned: { type: Date },

    AcceptedTerms: { type: Boolean, default: false },

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
