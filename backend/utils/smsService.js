const twilio = require("twilio");

/**
 * Sends a 6-digit verification code to the user's phone number.
 * Formats the number to E.164 (defaults to prepending country code from env).
 * Returns true if successful, false otherwise.
 */
const sendOTP = async (phone, code) => {
  try {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!sid || !token || !fromNumber) {
      console.warn("[SMS Service] Twilio credentials missing in .env. Skipping real SMS dispatch.");
      return false;
    }

    const client = twilio(sid.trim(), token.trim());
    
    // Format phone number to E.164 format
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith("+")) {
      const countryCode = process.env.TWILIO_COUNTRY_CODE || "+91";
      formattedPhone = `${countryCode.trim()}${formattedPhone}`;
    }

    const message = await client.messages.create({
      body: `Your PlotVista verification code is: ${code}. It is valid for 10 minutes.`,
      from: fromNumber.trim(),
      to: formattedPhone,
    });

    console.log(`[SMS Service] SMS sent successfully to ${formattedPhone}. Message SID: ${message.sid}`);
    return true;
  } catch (error) {
    console.error("[SMS Service] Twilio send error:", error.message);
    return false;
  }
};

module.exports = { sendOTP };
