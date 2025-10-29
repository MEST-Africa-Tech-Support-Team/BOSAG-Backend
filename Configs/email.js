import sgMail from "@sendgrid/mail";

// ================================
// 1️⃣ Configure SendGrid
// ================================
if (!process.env.SENDGRID_API_KEY) {
  console.error("❌ Missing SENDGRID_API_KEY in environment variables");
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log("📨 SendGrid API Key: ✅ Loaded");
}

// ================================
// 2️⃣ Email Templates
// ================================
const templates = {
  verifyEmail: (link) => `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #0b58bc;">Verify Your BOSAG Account</h2>
      <p>Thank you for registering with <strong>BOSAG</strong>.</p>
      <a href="${link}" 
         style="display:inline-block;background:#0b58bc;color:#fff;
                padding:10px 20px;border-radius:6px;text-decoration:none;">
        Verify Email
      </a>
      <p>This link expires in 24 hours.</p>
      <hr />
      <p style="font-size: 12px; color: #888;">BOSAG Team © ${new Date().getFullYear()}</p>
    </div>
  `,

  resetPassword: (link) => `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #0b58bc;">Reset Your Password</h2>
      <p>Click below to set a new password:</p>
      <a href="${link}" 
         style="display:inline-block;background:#0b58bc;color:#fff;
                padding:10px 20px;border-radius:6px;text-decoration:none;">
        Reset Password
      </a>
      <p>This link expires in 15 minutes.</p>
      <hr />
      <p style="font-size: 12px; color: #888;">BOSAG Team © ${new Date().getFullYear()}</p>
    </div>
  `,

  welcome: (name) => `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #0b58bc;">Welcome to BOSAG, ${name}!</h2>
      <p>We’re thrilled to have you on board 🎉</p>
      <hr />
      <p style="font-size: 12px; color: #888;">BOSAG Team © ${new Date().getFullYear()}</p>
    </div>
  `,
};

// ================================
// 3️⃣ Send Email Function
// ================================
export const sendEmail = async (to, subject, htmlContent) => {
  try {
    if (!process.env.SENDGRID_FROM_EMAIL) {
      throw new Error("Missing SENDGRID_FROM_EMAIL in environment variables");
    }

    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL, // ✅ verified sender
        name: "BOSAG Support",
      },
      subject,
      html: htmlContent,
    };

    await sgMail.send(msg);
    console.log(`✅ Email sent successfully to ${to}`);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    if (error.response?.body) {
      console.error("📩 SendGrid Response:", JSON.stringify(error.response.body, null, 2));
    }
    throw new Error("Email delivery failed");
  }
};

// ================================
// 4️⃣ Export Templates
// ================================
export { templates };
