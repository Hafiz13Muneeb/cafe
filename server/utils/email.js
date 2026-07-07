// server/utils/email.js
const { Resend } = require('resend');

// ============================================================
// 1. Initialize Resend client (only in production)
// ============================================================
let resend = null;
if (process.env.RESEND_API_KEY && process.env.NODE_ENV === 'production') {
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log('✅ Resend client initialized (production).');
} else {
  console.warn('⚠️ Resend client not initialized. Emails will be simulated.');
}

// ============================================================
// 2. Configuration
// ============================================================
const DEFAULT_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';

// ============================================================
// 3. HTML template
// ============================================================
const generateOTPEmailHTML = (otp, brandName = 'CafeFlow') => {
  return `
    <!DOCTYPE html>
    <html>
      <head><meta charset="UTF-8" /></head>
      <body style="font-family: sans-serif; background: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 12px;">
          <h2 style="color: #3E2723;">${brandName}</h2>
          <p>Please use the code below to verify your email.</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; background: #F5F5DC; padding: 12px; text-align: center; border-radius: 6px;">
            ${otp}
          </div>
          <p style="font-size: 14px; color: #888;">This code expires in 10 minutes.</p>
          <p style="font-size: 12px; color: #aaa; text-align: center; margin-top: 24px;">
            &copy; ${new Date().getFullYear()} ${brandName}
          </p>
        </div>
      </body>
    </html>
  `;
};

// ============================================================
// 4. Send OTP email
// ============================================================
const sendOTPEmail = async (email, otp, options = {}) => {
  const {
    from = DEFAULT_FROM,
    subject = 'Your Verification Code',
    brandName = 'CafeFlow',
  } = options;

  // ✅ In development or if no Resend client, simulate
  if (process.env.NODE_ENV !== 'production' || !resend) {
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
// 5. Generic email sender
// ============================================================
const sendEmail = async ({ to, subject, html, from = DEFAULT_FROM }) => {
  if (process.env.NODE_ENV !== 'production' || !resend) {
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