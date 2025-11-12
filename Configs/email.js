import sgMail from "@sendgrid/mail";

// Configure SendGrid
if (!process.env.SENDGRID_API_KEY) {
  console.error("Missing SENDGRID_API_KEY in environment variables");
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log("SendGrid API Key: Loaded");
}

// Email Templates
const templates = {
  welcomeEmail: (name, loginLink) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Welcome to BOSAG</title>
  </head>
  <body style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px;">
      <h2 style="color: #0b58bc;">Welcome to BOSAG, ${name}!</h2>
      <p>Your account has been created successfully and is ready to use.</p>
      <p>Click below to log in to your account:</p>
      
      <!-- ✅ This link WILL be clickable in all email clients -->
      <p style="text-align: center; margin: 30px 0;">
        <a href="${loginLink}" target="_blank"
           style="display: inline-block; background-color: #0b58bc; color: #ffffff; 
                  text-decoration: none; padding: 12px 24px; border-radius: 6px; 
                  font-size: 16px; font-weight: bold;">
          Login to BOSAG
        </a>
      </p>

      <p>If the button above doesn’t work, copy and paste this link into your browser:</p>
      <p><a href="${loginLink}" target="_blank" style="color: #0b58bc;">${loginLink}</a></p>

      <hr />
      <p style="font-size: 12px; color: #888;">BOSAG Team © ${new Date().getFullYear()}</p>
    </div>
  </body>
  </html>
`,


  resetPassword: (resetLink) => `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #0b58bc;">Reset Your Password</h2>
      <p>Click below to set a new password:</p>
      <a href="${resetLink}" 
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

  // Add these two templates 
  onboardingConfirmation: (name) => `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #0b58bc;">Hello ${name},</h2>
      <p>Thank you for submitting your onboarding form to <strong>BOSAG</strong>.</p>
      <p>We have received your application and our team will review it shortly.</p>
      <p>You’ll receive another email once your membership status is updated.</p>
      <hr />
      <p style="font-size: 12px; color: #888;">BOSAG Team © ${new Date().getFullYear()}</p>
    </div>
  `,

  onboardingStatusUpdate: (name, status, remarks) => `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #0b58bc;">Hello ${name},</h2>
      <p>Your membership application status has been updated to:</p>
      <h3 style="color: ${status === "Approved" ? "green" : status === "Rejected" ? "red" : "#555"};">
        ${status}
      </h3>
      ${remarks ? `<p><strong>Remarks:</strong> ${remarks}</p>` : ""}
      <p>Thank you for being part of BOSAG.</p>
      <hr />
      <p style="font-size: 12px; color: #888;">BOSAG Team © ${new Date().getFullYear()}</p>
    </div>
  `,

  onboardingUpdateConfirmation: (name) => `
  <div style="font-family: Arial, sans-serif; color: #333;">
    <h2 style="color: #0b58bc;">Onboarding Form Updated</h2>
    <p>Hi ${name}, your onboarding form has been successfully updated.</p>
    <hr />
    <p style="font-size: 12px; color: #888;">BOSAG Team © ${new Date().getFullYear()}</p>
  </div>
`,

};


// Send Email Function
export const sendEmail = async (to, subject, htmlContent) => {
  try {
    if (!process.env.SENDGRID_FROM_EMAIL) {
      throw new Error("Missing SENDGRID_FROM_EMAIL in environment variables");
    }

    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: "BOSAG Support",
      },
      subject,
      html: htmlContent,
    };

    await sgMail.send(msg);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error("Email sending failed:", error.message);
    if (error.response?.body) {
      console.error("SendGrid Response:", JSON.stringify(error.response.body, null, 2));
    }
    throw new Error("Email delivery failed");
  }
};

// Export Templates

export { templates };
