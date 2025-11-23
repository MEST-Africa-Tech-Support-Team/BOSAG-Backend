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
  "Platinum Member": "GHS 15,000 / year",
  "Gold Member": "GHS 10,000 / year",
  "Vendors & Affiliate Member": "GHS 6,500 / year",
  "Start-ups & Associate Member": "GHS 3,500 / year",
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

    return `
    <table cellpadding="10" cellspacing="0" border="0" width="100%" style="border:1px solid #ddd; border-radius:10px; background:#ffffff; margin:10px 0; border-collapse:collapse;">
      <tr>
        <td style="padding:10px;">
          <h3 style="color:#0b58bc; font-family:Arial, sans-serif; margin:0 0 10px 0;">${icon} ${membershipTier}</h3>
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
      <h2 style="color:#0b58bc; margin:0 0 10px 0;">Hello ${name},</h2>
      <p style="font-size:14px; color:#333;">Thank you for submitting your onboarding form to <strong>BOSAG</strong>. Our team will review it shortly.</p>
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
        <h2 style="color:#0b58bc; margin:0 0 10px 0;">Hello ${name},</h2>
        <p style="font-size:14px; color:#333;">Your membership application status has been updated to:</p>
        <h3 style="color: ${status === "Approved" ? "green" : status === "Rejected" ? "red" : status === "Payment Pending" ? "orange" : "#555"}; margin:5px 0 10px 0;">${status}</h3>
        ${remarks ? `<p style="font-size:14px; color:#333;"><strong>Remarks:</strong> ${remarks}</p>` : ""}
        ${status === "Payment Pending" ? `
          <p style="font-size:14px; color:#333;">Please review your selected membership tier below:</p>
          ${templates.membershipTierDetails(membershipTier)}
          <h3 style="font-family:Arial, sans-serif; color:#0b58bc; margin:10px 0 5px 0;">Payment Instructions</h3>
          <p style="font-size:14px; color:#333;"><strong>BANK PAYMENT:</strong><br />Bank Name: Ghana Commercial Bank (GCB)<br />Account Name: BOSAG<br />Account Number: 123456789012<br />Branch: Accra Main</p>
          <p style="font-size:14px; color:#333;"><strong>MOBILE MONEY:</strong><br />MTN MoMo Number: 024 XXX XXXX<br />Account Name: BOSAG</p>
          <p style="font-size:14px; color:#333;">After payment, email your receipt or screenshot to:<br /><strong>payments@bosag.org</strong></p>
          <p style="font-size:14px; color:#333;">Your membership will be activated once your payment is verified.</p>
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
      from: process.env.SENDGRID_FROM_EMAIL, // verified sender
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error("Email send error:", err.response ? err.response.body : err);
  }
};
