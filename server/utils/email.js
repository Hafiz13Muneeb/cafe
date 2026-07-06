// server/utils/email.js
const { Resend } = require('resend');

// ============================================================
// 1. Initialize Resend client (if API key is present)
// ============================================================
let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log('✅ Resend client initialized.');
} else {
  console.warn('⚠️ RESEND_API_KEY is not set. Emails will be simulated (logged to console).');
}

// ============================================================
// 2. Configuration
// ============================================================
const DEFAULT_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const DEFAULT_SUBJECT = 'Your Verification Code';

// ============================================================
// 3. Generate HTML template for OTP email
// ============================================================
const generateOTPEmailHTML = (otp, brandName = 'CafeFlow') => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>OTP Verification</title>
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 480px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 12px;
            padding: 40px 30px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.05);
            border: 1px solid #eaeaea;
          }
          .logo {
            text-align: center;
            margin-bottom: 28px;
          }
          .logo h1 {
            font-size: 24px;
            font-weight: 700;
            color: #3E2723;
            margin: 0;
            letter-spacing: -0.5px;
          }
          .logo span {
            color: #8A9A5B;
          }
          .otp-code {
            text-align: center;
            font-size: 40px;
            font-weight: 700;
            letter-spacing: 12px;
            color: #3E2723;
            background: #F5F5DC;
            padding: 16px 0;
            border-radius: 8px;
            margin: 24px 0 20px;
          }
          .message {
            font-size: 16px;
            line-height: 1.6;
            color: #3E2723;
            text-align: center;
            margin: 20px 0 12px;
          }
          .sub-message {
            font-size: 14px;
            color: #888;
            text-align: center;
            margin: 0 0 28px;
          }
          .footer {
            font-size: 12px;
            color: #aaa;
            text-align: center;
            border-top: 1px solid #eaeaea;
            padding-top: 20px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <h1>${brandName}</h1>
          </div>
          <div class="message">
            Please use the code below to verify your email address.
          </div>
          <div class="otp-code">${otp}</div>
          <div class="sub-message">
            This code will expire in <strong>10 minutes</strong>.
            If you didn’t request this, please ignore this email.
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ${brandName}. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;
};

// ============================================================
// 4. Main function: send OTP email
// ============================================================
/**
 * Send an OTP email to the given address.
 * @param {string} email - Recipient email.
 * @param {string} otp - 6‑digit OTP string.
 * @param {Object} options - Optional overrides.
 * @param {string} options.from - Sender email (default: DEFAULT_FROM).
 * @param {string} options.subject - Email subject (default: DEFAULT_SUBJECT).
 * @param {string} options.brandName - Brand name for HTML template (default: 'CafeFlow').
 * @returns {Promise<Object>} { success, data, error }
 */
const sendOTPEmail = async (email, otp, options = {}) => {
  const {
    from = DEFAULT_FROM,
    subject = DEFAULT_SUBJECT,
    brandName = 'CafeFlow',
  } = options;

  // If no Resend client, simulate sending (log to console)
  if (!resend || !process.env.RESEND_API_KEY) {
    console.log('📧 [SIMULATED] OTP for', email, ':', otp);
    return { success: true, data: { id: 'sim-' + Date.now() } };
  }

  try {
    const html = generateOTPEmailHTML(otp, brandName);
    const response = await resend.emails.send({
      from,
      to: [email],
      subject,
      html,
    });

    if (response.error) {
      console.error('Resend API error:', response.error);
      return { success: false, error: response.error };
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return { success: false, error: error.message };
  }
};

// ============================================================
// 5. (Optional) Send a generic email (for other use cases)
// ============================================================
const sendEmail = async ({ to, subject, html, from = DEFAULT_FROM }) => {
  if (!resend || !process.env.RESEND_API_KEY) {
    console.log('📧 [SIMULATED] Email to', to, 'subject:', subject);
    return { success: true, data: { id: 'sim-' + Date.now() } };
  }

  try {
    const response = await resend.emails.send({ from, to: [to], subject, html });
    if (response.error) return { success: false, error: response.error };
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOTPEmail,
  sendEmail,
  generateOTPEmailHTML,
};