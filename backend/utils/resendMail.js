// utils/resendMail.js
const { Resend } = require("resend");
const dotenv = require("dotenv");
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const wrapHtml = (subject, bodyHtml) => `
  <div style="background: linear-gradient(to bottom right, #e0f2fe, #0284c7); padding: 32px; font-family: 'Segoe UI', sans-serif; color: #0f172a;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 8px 20px rgba(0,0,0,0.05);">
      <h2 style="color: #0284c7; font-size: 22px; margin-bottom: 16px;">${subject}</h2>
      <div style="font-size: 16px; line-height: 1.6; color: #334155;">${bodyHtml}</div>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #e2e8f0;" />
      <p style="font-size: 13px; color: #64748b; text-align: center;">This is an automated message. Please do not reply.</p>
    </div>
  </div>
`;

/**
 * Send a single email via Resend
 * @param {{to: string|string[], subject: string, message: string}} params
 */
const sendResendMail = async ({ to, subject, message }) => {
  const recipients = Array.isArray(to) ? to : [to];

  try {
    const resp = await resend.emails.send({
      from: process.env.FROM_EMAIL || "Acme <onboarding@resend.dev>",
      to: recipients,
      subject,
      html: wrapHtml(subject, message),
    });
    // Useful in logs to confirm delivery attempt
    console.log("[Resend] Sent:", resp?.id || resp);
    return resp;
  } catch (error) {
    console.error("[Resend] Error:",
      error?.message,
      error?.statusCode || error?.status,
      error?.name,
      error?.response?.data || error
    );
    throw error;
  }
};

const sendNewArrivalNotificationResend = async (emails, products) => {
  const subject = "🆕 New Arrivals Just Dropped!";
  const htmlBody = `
    <p style="font-size: 16px; color: #334155;">Check out our latest additions:</p>
    <ul style="padding-left: 18px;">
      ${products.map((p) => `
        <li style="margin-bottom: 10px;">
          <strong>${p.name}</strong> – ₹${p.price}<br/>
          ${p.images?.[0]?.url ? `<img src="${p.images[0].url}" alt="${p.name}" width="100" style="margin-top: 5px;" />` : ""}
        </li>
      `).join("")}
    </ul>
    <p style="margin-top: 16px;">
      <a href="https://your-site.com/shop" style="color:#0284c7; font-weight:bold;">🛒 Shop Now</a>
    </p>
  `;

  try {
    const resp = await resend.emails.send({
      from: process.env.FROM_EMAIL || "onboarding@resend.dev",
      to: emails,
      subject,
      html: wrapHtml(subject, htmlBody),
    });
    console.log("[Resend] Bulk sent:", resp?.id || resp);
    return resp;
  } catch (error) {
    console.error("[Resend] Bulk error:",
      error?.message,
      error?.statusCode || error?.status,
      error?.name,
      error?.response?.data || error
    );
    throw error;
  }
};

module.exports = {
  sendResendMail,
  sendNewArrivalNotificationResend,
};
