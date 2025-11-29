import sgMail from "@sendgrid/mail";

// Configure SendGrid
if (!process.env.SENDGRID_API_KEY) {
  console.error("Missing SENDGRID_API_KEY in environment variables");
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log("SendGrid API Key: Loaded");
}

// Membership Pricing
const membershipPricing = {
  "Platinum Member": "USD 5,000.00 (GHS 55,000.00)/ year",
  "Gold Member": "USD 2,500.00 (GHS 27,500.00)/ year",
  "Vendors & Affiliate Member": "USD 1,500.00 (GHS 16,500.00)/ year",
  "Start-ups & Associate Member": "USD 500.00 (GHS 5,500.00)/ year",
};


// Benefits per Tier
const membershipBenefits = {
  "Platinum Member": ["Full voting rights", "Eligible for Governing Council/Advisory Board", "International certification recognition"],
  "Gold Member": ["Full voting rights", "Serve on Governing Council and Committees", "Second tier weighting for benefits"],
  "Vendors & Affiliate Member": ["Non-voting rights", "Can become Associate/Voting later", "Cross-sector partnership opportunities"],
  "Start-ups & Associate Member": ["Access to capacity building", "Eligible for special startup policies", "Listed as growing entities"],
  "Government Member": ["Advisory role participation", "Policy collaboration", "Public-private dialogue inclusion"],
  "Honorary & Observer Member": ["Non-voting observer status", "Access to events and insights", "Strategic collaboration roles"],
};

// MEMBERSHIP DESCRIPTIONS
const membershipDescriptions = {
"Platinum Member": "Includes established BPO, ITO, and shared services providers operating in Ghana, with demonstrated delivery scale, international certifications, and strategic sector leadership.",
"Gold Member": "Active BPO, ITO, and shared services operators with proven delivery.",
"Vendors & Affiliate Member": "Include ecosystem enablers such as training providers, technology vendors, outsourcing consultants, legal and research institutions, and impact sourcing organizations.",
"Start-ups & Associate Member": "Include early-stage BPO/ITO firms, incubated ventures, and small/micro-operators. This tier is designed to offer mentorship, technical assistance, and access to market opportunities.",
};

// Icons
const tierIcons = {
  "Platinum Member": "👑",
  "Gold Member": "🥇",
  "Vendors & Affiliate Member": "🤝",
  "Start-ups & Associate Member": "🚀",

};

// Email Templates
export const templates = {
  // Welcome Email
  welcomeEmail: (name, loginLink) => `
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-family:Arial, sans-serif; max-width:600px; margin:auto; border-collapse:collapse;">
    <tr>
      <td style="padding:20px; background-color:#f8fbff; border-radius:10px; text-align:center;">
      <img 
      src="https://res.cloudinary.com/dr3h18rpt/image/upload/v1764336062/BOSAG-_White_Orange_JPG_hfcool.jpg" 
      alt="BOSAG Logo"
      style="width:160px; margin-bottom:15px;"
    />
        <h2 style="color:#0b58bc; margin:0 0 15px 0;">Welcome to BOSAG, ${name}!</h2>
        <p style="font-size:14px; color:#333; margin:0 0 15px 0;">Your account has been created successfully and is ready to use.</p>
        <a href="${loginLink}" style="display:inline-block; background:#0b58bc; color:#fff; padding:12px 25px; border-radius:6px; text-decoration:none; margin-top:10px;">Login to BOSAG</a>
      </td>
    </tr>
    <tr>
      <td style="text-align:center; font-size:12px; color:#888; padding:10px;">BOSAG Team © ${new Date().getFullYear()}</td>
    </tr>
  </table>
  `,

  // Reset Password Email
  resetPassword: (resetLink) => `
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-family:Arial, sans-serif; max-width:600px; margin:auto; border-collapse:collapse;">
    <tr>
      <td style="padding:20px; background-color:#f8fbff; border-radius:10px; text-align:center;">
      <img 
      src="https://res.cloudinary.com/dr3h18rpt/image/upload/v1764336062/BOSAG-_White_Orange_JPG_hfcool.jpg" 
      alt="BOSAG Logo"
      style="width:160px; margin-bottom:15px;"
    />
        <h2 style="color:#0b58bc; margin:0 0 15px 0;">Reset Your Password</h2>
        <p style="font-size:14px; color:#333; margin:0 0 15px 0;">Click the button below to set a new password:</p>
        <a href="${resetLink}" style="display:inline-block; background:#0b58bc; color:#fff; padding:12px 25px; border-radius:6px; text-decoration:none;">Reset Password</a>
        <p style="margin-top:10px; font-size:14px; color:#555;">This link expires in 15 minutes.</p>
      </td>
    </tr>
    <tr>
      <td style="text-align:center; font-size:12px; color:#888; padding:10px;">BOSAG Team © ${new Date().getFullYear()}</td>
    </tr>
  </table>
  `,


  // Simple Welcome
  welcome: (name) => `
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-family:Arial, sans-serif; max-width:600px; margin:auto; border-collapse:collapse;">
    <tr>
      <td style="padding:20px; background-color:#f8fbff; border-radius:10px; text-align:center;">
      <img 
      src="https://res.cloudinary.com/dr3h18rpt/image/upload/v1764336062/BOSAG-_White_Orange_JPG_hfcool.jpg" 
      alt="BOSAG Logo"
      style="width:160px; margin-bottom:15px;"
    />
        <h2 style="color:#0b58bc; margin:0 0 15px 0;">Welcome to BOSAG, ${name}!</h2>
        <p style="font-size:14px; color:#333; margin:0;">We’re thrilled to have you on board 🎉</p>
      </td>
    </tr>
    <tr>
      <td style="text-align:center; font-size:12px; color:#888; padding:10px;">BOSAG Team © ${new Date().getFullYear()}</td>
    </tr>
  </table>
  `,

  // Membership Tier Details
  membershipTierDetails: (membershipTier) => {
    const price = membershipPricing[membershipTier];
    const benefits = membershipBenefits[membershipTier];
    const icon = tierIcons[membershipTier];
    const Description = membershipDescriptions[membershipTier];

    return `
    <table cellpadding="10" cellspacing="0" border="0" width="100%" style="border:1px solid #ddd; border-radius:10px; background:#ffffff; margin:10px 0; border-collapse:collapse;">
      <tr>
        <td style="padding:10px;">
        <img 
      src="https://res.cloudinary.com/dr3h18rpt/image/upload/v1764336062/BOSAG-_White_Orange_JPG_hfcool.jpg" 
      alt="BOSAG Logo"
      style="width:160px; margin-bottom:15px;"
    />
          <h3 style="color:#0b58bc; font-family:Arial, sans-serif; margin:0 0 10px 0;">${icon} ${membershipTier}</h3>
          <p style="margin:5px 0 15px 0; font-family:Arial, sans-serif; font-size:14px; color:#333;">${Description}</p>
          <p style="margin:5px 0; font-family:Arial, sans-serif; font-size:14px; color:#333;"><strong>Membership Fee:</strong> ${price}</p>
          <p style="margin:10px 0 5px 0; font-family:Arial, sans-serif; font-size:14px; color:#333;"><strong>Benefits:</strong></p>
          <ul style="margin:0; padding-left:20px; line-height:1.5; font-family:Arial, sans-serif; font-size:14px; color:#333;">
            ${benefits.map(b => `<li>${b}</li>`).join("")}
          </ul>
        </td>
      </tr>
    </table>
    `;
  },

  // Onboarding Confirmation
  onboardingConfirmation: (name, membershipTier) => `
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-family:Arial, sans-serif; max-width:600px; margin:auto; border-collapse:collapse;">
  <tr>
    <td style="padding:20px; background-color:#f8fbff; border-radius:10px;">
    <img 
      src="https://res.cloudinary.com/dr3h18rpt/image/upload/v1764336062/BOSAG-_White_Orange_JPG_hfcool.jpg" 
      alt="BOSAG Logo"
      style="width:160px; margin-bottom:15px;"
    />
      <h2 style="color:#0b58bc; margin:0 0 10px 0;">Hello ${name},</h2>
      <p style="font-size:14px; color:#333;">Thank you for submitting your onboarding form to <strong>Business Outsourcing Services Association, Ghana (BOSAG).</strong>. We have received your membership application, and our team will review it and provide feedback within 48 hours.</p>
      ${membershipTier
         ? `<p style="font-size:14px; color:#333;">Your selected membership tier:</p>${templates.membershipTierDetails(membershipTier)}` : ""}
      <p style="font-size:14px; color:#333;">You’ll receive another email once your membership status is updated.</p>
    </td>
  </tr>
  <tr>
    <td style="text-align:center; font-size:12px; color:#888; padding:10px;">BOSAG Team © ${new Date().getFullYear()}</td>
  </tr>
</table>
`,

  // Onboarding Status Update
  onboardingStatusUpdate: (name, status, remarks, membershipTier) => `
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-family:Arial, sans-serif; max-width:600px; margin:auto; border-collapse:collapse;">
    <tr>
      <td style="padding:20px; background-color:#f8fbff; border-radius:10px;">
      <img 
      src="https://res.cloudinary.com/dr3h18rpt/image/upload/v1764336062/BOSAG-_White_Orange_JPG_hfcool.jpg" 
      alt="BOSAG Logo"
      style="width:160px; margin-bottom:15px;"
    />
        <h2 style="color:#0b58bc; margin:0 0 10px 0;">Hello ${name},</h2>
        <h3 style="color: ${status === "Approved" ? "green" : status === "Rejected" ? "red" : status === "Payment Pending" ? "orange" : "#555"}; margin:5px 0 10px 0;">${status}</h3>
        ${remarks ? `<p style="font-size:14px; color:#333;"><strong>Remarks:</strong> ${remarks}</p>` : ""}
        ${status === "Payment Pending" ? `
          <p style="font-size:14px; color:#333;">Congratulations! Your membership application to ,<strong>Business Outsourcing Services Association, Ghana (BOSAG)</strong> has been <strong>approved</strong>.</p>
          <p style="font-size:14px; color:#333;">Here is a summary of your selected membership category:</p>
          ${templates.membershipTierDetails(membershipTier)}
          <h3 style="font-family:Arial, sans-serif; color:#0b58bc; margin:10px 0 5px 0;">To complete your onboarding, please make payment using the details below:</h3>
          <p style="font-size:14px; color:#333;"><strong>BANK PAYMENT:</strong><br />Bank Name: Ecobank Ghana<br />Account Name: BUSINESS OUTSOURCING SERVICES ASSOCIATION, GHANA LBG<br />Account Number:1441005056695 <br />Account Currency:GHS<br />Branch: East Airport <br />Short Code: 130147<br />Swift Code:ECOCGHAC <br />Bank Address:2 Morocco Lane, Off Independence Avenue, Ministerial Area, P. O. Box AN 16746, North Ridge, Accra - Ghana </p>
          <p style="font-size:14px; color:#333;"><br />Once payment is made, kindly send proof of payment to <strong>membership@bosag.org </strong></p>
          <p style="font-size:14px; color:#333;">Welcome to BOSAG! We look forward to working with you to advance Ghana’s business services sector.</p>
          <p style="font-size:14px; color:#333;"><strong>Best regard<br /> <strong>Bosag Team<br />Email: membership@bosag.org <br /> </strong> </p>

        ` : ""}
        ${status === "Approved" ? `
          <p style="font-size:14px; color:#333;">We are pleased to confirm that we have received your payment for your BOSAG membership subscription. Your membership is now approved and active for the current calendar year, running from January to December 2026. </p>
          <p style="font-size:14px; color:#333;">Here is a summary of your selected membership category:</p>
          ${templates.membershipTierDetails(membershipTier)}
          <p style="font-size:14px; color:#333;">We are excited to have you as part of the <strong>Business Outsourcing Services Association, Ghana (BOSAG)</strong> community.</p>
          <h3 style="font-family:Arial, sans-serif; color:#0b58bc; margin:10px 0 5px 0;"><h3 style="font-family:Arial, sans-serif; color:#0b58bc; margin:10px 0 5px 0;">For any further inquiries or information, please contact:</h3>
          <p style="font-size:14px; color:#333;"><strong>David Gowu</strong><br /> <strong>CEO BOSAG</strong><br />Email: david.gowu@bosag.org <br />Contact: +233 242773762 </p>
          <p style="font-size:14px; color:#333;">Thank you for joining BOSAG. We look forward to working with you to advance Ghana’s Business Services ecosystem!</p>
          <p style="font-size:14px; color:#333;"><strong>Best regard<br /> <strong>Bosag Team<br />Email: membership@bosag.org <br /> </strong> </p>


        ` : ""}
      </td>
    </tr>
    <tr>
      <td style="text-align:center; font-size:12px; color:#888; padding:10px;">BOSAG Team © ${new Date().getFullYear()}</td>
    </tr>
  </table>
  `,
};

// Optional helper to send emails
export const sendEmail = async ({ to, subject, html }) => {
  try {
    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL, 
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error("Email send error:", err.response ? err.response.body : err);
  }
};
