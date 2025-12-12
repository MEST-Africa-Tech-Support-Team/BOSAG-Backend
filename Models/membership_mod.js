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
  enum: ["BPO", "ITO", "Shared Services", "Training Provider", "Technology Vendor", "Consultancy", "Public Sector", "Other"],
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
    headOfOrganizationName: { type: String, required: true, trim: true },
    jobTitle: { type: String, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    companyWebsite: { type: String, trim: true },
    companyAddress: { type: String, trim: true },
    contactEmail: { type: String, required: true, lowercase: true, trim: true },
    contactPhone: { type: String, trim: true },

    socialMedia: {
  linkedin:   { type: String, trim: true },
  x:          { type: String, trim: true },
  instagram:  { type: String, trim: true },
  whatsapp:   { type: String, trim: true },
  facebook:   { type: String, trim: true },
  tiktok:     { type: String, trim: true },
},


    // GOVERNANCE AND REPRESENTATION
    nominatedRep: { type: String, required: true, trim: true },
    nomPositionRole: { type: String, trim: true },
    nomPhoneNumber: { type: String, required: true, trim: true },
    nomEmailAddress: { type: String, lowercase: true, required: true, trim: true },
    alternateRep: { type: String, trim: true },
    altPositionRole: { type: String, trim: true },
    altPhoneNumber: { type: String, trim: true },
    altEmailAddress: { type: String, lowercase: true, trim: true },
    
    // COMMITMENT & DECLARATIONS
    agreesConstitution: { type: Boolean, required: true, default: false },
    accurateInformation: { type: Boolean, required: true, default: false },
    commitsParticipation: { type: Boolean, default: false },
    BosagApproval: { type: Boolean, required: true, default: false },
    agreesFeePayment: { type: Boolean, required: true, default: false },

    //  REQUIRED ATTACHMENTS (URLs from Cloudinary)
    registrationCertificate: { type: String, required: true }, 
    companyProfile: { type: String, required: true }, 
    logo: { type: String, required: true }, 
    brochure: { type: String },  

  

    acknowledged: { type: Boolean, required: true, default: false },

    // ADMIN USE
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Payment Pending"],
      default: "Pending",
    },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

const OnboardingForm = mongoose.model("OnboardingForm", onboardingFormSchema);
export default OnboardingForm;
