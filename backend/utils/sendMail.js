const nodemailer = require("nodemailer");

const normalizePassword = (value) => (value ? value.replace(/\s+/g, "") : value);
const stripHtml = (value) =>
  String(value || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const getSmtpConfig = () => {
  const user = process.env.EMAIL_USER || process.env.SMTP_EMAIL;
  const pass = normalizePassword(process.env.EMAIL_PASS || process.env.SMTP_PASSWORD);
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const secure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === "true"
      : port === 465;

  const config = {
    host,
    port,
    secure,
  };

  if (user && pass) {
    config.auth = { user, pass };
  }

  return config;
};

const createTransporter = () => nodemailer.createTransport(getSmtpConfig());

const resolveFromAddress = () =>
  process.env.EMAIL_FROM || process.env.SMTP_EMAIL || process.env.EMAIL_USER;

const sendMail = async ({ to, subject, message, attachments = [] }) => {
  const transporter = createTransporter();
  const fromAddress = resolveFromAddress();

  const mailOptions = {
    from: fromAddress ? `"Raphaaa Support" <${fromAddress}>` : "Raphaaa Support <no-reply@localhost>",
    to,
    subject,
    text: stripHtml(message),
    html: `
  <div style="background: linear-gradient(135deg, #e0f2fe, #0284c7); padding: 40px 20px; font-family: 'Segoe UI', sans-serif; color: #0f172a;">
    <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.08);">
      
      <!-- HEADER -->
      <div style="background: #e3e7ec; text-align: center; padding: 20px 10px;">
        <img src="https://raphaaa.onrender.com/assets/logo1-CDdALl6u.png" alt="Raphaaa" style="max-width: 160px; height: auto;" />
      </div>

      <!-- BODY -->
      <div style="padding: 30px;">
        <p style="font-size: 17px; line-height: 1.7; color: #334155; margin: 0 0 20px;">
          ${message}
        </p>
      </div>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0;" />

      <!-- FOOTER -->
      <div style="text-align: center; padding: 20px; background: #e3e7ec;">
        <p style="font-size: 14px; color: #64748b; margin-bottom: 10px;">Follow us on</p>
        <div>
          <a href="https://facebook.com/raphaaa" target="_blank" style="margin: 0 8px; display: inline-block;">
            <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" width="24" />
          </a>
          <a href="https://instagram.com/raphaaa" target="_blank" style="margin: 0 8px; display: inline-block;">
            <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" width="24" />
          </a>
          <!--- <a href="https://twitter.com/raphaaa" target="_blank" style="margin: 0 8px; display: inline-block;">
            <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" width="24" />
          </a> -->
          <!-- <a href="https://www.linkedin.com/company/raphaaa" target="_blank" style="margin: 0 8px; display: inline-block;">
            <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" width="24" />
          </a> -->
        </div>

        <p style="font-size: 12px; color: #94a3b8; margin-top: 15px;">
          © ${new Date().getFullYear()} Raphaaa. All rights reserved.<br/>
          This is an automated message. Please do not reply.
        </p>
      </div>
    </div>
  </div>
`,

    // forward attachments (Buffers, streams, or data URLs)
    attachments: attachments.map((a) => ({
      filename: a.filename,
      content: a.content, // Buffer from buildInvoicePDF
      contentType: a.contentType || "application/pdf",
    })),
  };

  await transporter.sendMail(mailOptions);
};

// 🛍️ New Arrivals Notification
const sendNewArrivalNotification = async (emails, products) => {
  const transporter = createTransporter();
  const fromAddress = resolveFromAddress();
  const htmlBody = `
    <div style="background: linear-gradient(to bottom right, #e0f2fe, #0284c7); padding: 32px; font-family: 'Segoe UI', sans-serif; color: #0f172a;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 8px 20px rgba(0,0,0,0.05);">
        <h2 style="color: #0284c7; font-size: 22px; margin-bottom: 16px;">🆕 New Arrivals at Raphaaa!</h2>
        <p style="font-size: 16px; color: #334155;">Check out our latest additions:</p>
        <ul style="padding-left: 18px;">
          ${products
            .map(
              (p) => `
              <li style="margin-bottom: 10px;">
                <strong>${p.name}</strong> – ₹${p.price}<br/>
                ${
                  p.images?.[0]?.url
                    ? `<img src="${p.images[0].url}" alt="${p.name}" width="100" style="margin-top: 5px;" />`
                    : ""
                }
              </li>
            `
            )
            .join("")}
        </ul>
        <p style="margin-top: 16px;">
          <a href="https://raphaaa.onrender.com/collections/all" style="color:#0284c7; font-weight:bold;">🛒 Shop Now</a>
        </p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e2e8f0;" />
        <p style="font-size: 13px; color: #64748b; text-align: center;">This is an automated message. Please do not reply.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: fromAddress ? `"Raphaaa Store" <${fromAddress}>` : "Raphaaa Store <no-reply@localhost>",
    to: emails,
    subject: "🆕 New Arrivals Just Dropped!",
    text: stripHtml(htmlBody),
    html: htmlBody,
  });
};

module.exports = {
  sendMail,
  sendNewArrivalNotification,
};
