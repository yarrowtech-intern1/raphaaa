const axios = require("axios");

/**
 * Send a WhatsApp message via the Meta WhatsApp Cloud API.
 *
 * Required env vars:
 *   WHATSAPP_PHONE_NUMBER_ID  — your Business Phone Number ID from Meta
 *   WHATSAPP_ACCESS_TOKEN     — permanent or temporary access token
 *
 * If the env vars are missing, the function logs a mock message and returns
 * without throwing so the rest of the order flow is never blocked.
 *
 * @param {string} to      — recipient's phone in E.164 format, e.g. "+919876543210"
 * @param {string} message — plain-text body (max ~4096 chars for text type)
 */
const sendWhatsApp = async (to, message) => {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.log(`[WhatsApp Mock] To: ${to}\n${message}`);
    return;
  }

  // Normalise phone — strip spaces/dashes, ensure leading +
  const phone = String(to).replace(/[\s\-()]/g, "");

  try {
    await axios.post(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        timeout: 8000,
      }
    );
  } catch (err) {
    // Never block the main flow — just log
    console.error("[WhatsApp] Send failed:", err.response?.data?.error?.message || err.message);
  }
};

module.exports = sendWhatsApp;
