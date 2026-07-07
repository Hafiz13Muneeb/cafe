// server/controllers/feedbackController.js
const OTP = require('../models/OTP');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const { sendOTPEmail, sendEmail } = require('../utils/email');

// ============================================================
// OTP RATE LIMITING (in-memory) – separate from registration
// ============================================================
const feedbackOTPRequestLogs = new Map();
const FEEDBACK_OTP_MAX_REQUESTS = 3;
const FEEDBACK_OTP_WINDOW_MS = 30 * 60 * 1000; // 30 min
const FEEDBACK_OTP_MIN_INTERVAL_MS = 120 * 1000; // 2 min

setInterval(() => {
  const now = Date.now();
  for (const [email, timestamps] of feedbackOTPRequestLogs.entries()) {
    const valid = timestamps.filter(ts => now - ts < FEEDBACK_OTP_WINDOW_MS);
    if (valid.length === 0) feedbackOTPRequestLogs.delete(email);
    else feedbackOTPRequestLogs.set(email, valid);
  }
}, 5 * 60 * 1000);

const checkFeedbackOTPRateLimit = (email) => {
  const now = Date.now();
  const timestamps = feedbackOTPRequestLogs.get(email) || [];
  const recent = timestamps.filter(ts => now - ts < FEEDBACK_OTP_WINDOW_MS);
  if (recent.length >= FEEDBACK_OTP_MAX_REQUESTS) {
    const oldest = recent[0];
    const resetTime = new Date(oldest + FEEDBACK_OTP_WINDOW_MS);
    throw new Error(`Too many OTP requests. Try again after ${resetTime.toLocaleTimeString()}.`);
  }
  if (recent.length > 0) {
    const last = recent[recent.length - 1];
    const elapsed = now - last;
    if (elapsed < FEEDBACK_OTP_MIN_INTERVAL_MS) {
      const remaining = Math.ceil((FEEDBACK_OTP_MIN_INTERVAL_MS - elapsed) / 1000);
      throw new Error(`Please wait ${remaining} seconds before requesting a new code.`);
    }
  }
  recent.push(now);
  feedbackOTPRequestLogs.set(email, recent);
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateFeedbackEmailHTML = (feedback) => {
  return `
    <!DOCTYPE html>
    <html>
      <head><meta charset="UTF-8" /></head>
      <body style="font-family: sans-serif; background: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 12px;">
          <h2 style="color: #3E2723;">📬 New Feedback</h2>
          <p><strong>From:</strong> ${feedback.email}</p>
          <p><strong>Type:</strong> ${feedback.type || 'general'}</p>
          <div style="background: #f9f9f9; padding: 16px; border-left: 4px solid #8A9A5B;">
            <p><strong>Message:</strong></p>
            <p>${feedback.message}</p>
          </div>
          <p style="font-size: 12px; color: #888; text-align: center; margin-top: 24px;">
            &copy; ${new Date().getFullYear()} ${process.env.BRAND_NAME || 'CafeFlow'}
          </p>
        </div>
      </body>
    </html>
  `;
};

// ============================================================
// CONTROLLERS
// ============================================================

const sendFeedbackOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      res.status(400);
      throw new Error('Valid email is required');
    }
    const emailLower = email.trim().toLowerCase();
    checkFeedbackOTPRateLimit(emailLower);
    await OTP.deleteMany({ email: emailLower, verified: false, purpose: 'feedback' });
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await OTP.create({ email: emailLower, otp, expiresAt, purpose: 'feedback' });
    const result = await sendOTPEmail(emailLower, otp, {
      brandName: process.env.BRAND_NAME || 'CafeFlow',
      subject: 'Your Feedback Verification Code',
    });
    if (!result.success) {
      console.error('Failed to send feedback OTP:', result.error);
      res.status(500);
      throw new Error('Failed to send OTP. Please try again later.');
    }
    res.status(200).json({ success: true, message: 'OTP sent for feedback verification.' });
  } catch (error) {
    next(error);
  }
};

const submitFeedback = async (req, res, next) => {
  try {
    const { email, otp, message, type } = req.body;

    // ============================================================
    // LOGGED‑IN USER – skip OTP
    // ============================================================
    if (req.user) {
      if (!message) {
        res.status(400);
        throw new Error('Message is required');
      }

      const userEmail = req.user.email;
      // Spam prevention: 1 feedback per email per 24h
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const existing = await Feedback.findOne({ email: userEmail, createdAt: { $gt: oneDayAgo } });
      if (existing) {
        res.status(429);
        throw new Error('You already submitted feedback recently. Please try again after 24 hours.');
      }

      const feedback = await Feedback.create({
        userId: req.user._id,
        email: userEmail,
        message: message.trim(),
        type: type || 'general',
        status: 'pending',
      });

      // Notify superadmin
      if (process.env.RESEND_API_KEY && process.env.SUPERADMIN_EMAIL) {
        try {
          await sendEmail({
            to: process.env.SUPERADMIN_EMAIL,
            subject: `New Feedback from ${userEmail}`,
            html: generateFeedbackEmailHTML(feedback),
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
          });
        } catch (emailErr) {
          console.error('Failed to send superadmin email:', emailErr);
        }
      }

      return res.status(201).json({
        success: true,
        message: 'Feedback submitted successfully. Thank you!',
        data: { id: feedback._id, status: feedback.status },
      });
    }

    // ============================================================
    // GUEST USER – require OTP
    // ============================================================
    if (!email || !otp || !message) {
      res.status(400);
      throw new Error('Email, OTP, and message are required');
    }

    const emailLower = email.trim().toLowerCase();
    const otpRecord = await OTP.findOne({
      email: emailLower,
      otp: otp.trim(),
      verified: false,
      purpose: 'feedback',
      expiresAt: { $gt: new Date() },
    });
    if (!otpRecord) {
      res.status(400);
      throw new Error('Invalid or expired OTP. Please request a new one.');
    }
    otpRecord.verified = true;
    await otpRecord.save();

    // Spam prevention for guests
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await Feedback.findOne({ email: emailLower, createdAt: { $gt: oneDayAgo } });
    if (existing) {
      res.status(429);
      throw new Error('You already submitted feedback recently. Please try again after 24 hours.');
    }

    const user = await User.findOne({ email: emailLower });
    const feedback = await Feedback.create({
      userId: user?._id || null,
      email: emailLower,
      message: message.trim(),
      type: type || 'general',
      status: 'pending',
    });

    // Notify superadmin
    if (process.env.RESEND_API_KEY && process.env.SUPERADMIN_EMAIL) {
      try {
        await sendEmail({
          to: process.env.SUPERADMIN_EMAIL,
          subject: `New Feedback from ${emailLower}`,
          html: generateFeedbackEmailHTML(feedback),
          from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        });
      } catch (emailErr) {
        console.error('Failed to send superadmin email:', emailErr);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully. Thank you!',
      data: { id: feedback._id, status: feedback.status },
    });
  } catch (error) {
    next(error);
  }
};

const getAllFeedback = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {};
    if (status && ['pending', 'resolved', 'spam'].includes(status)) {
      filter.status = status;
    }
    const [feedback, total] = await Promise.all([
      Feedback.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).populate('userId', 'username email'),
      Feedback.countDocuments(filter),
    ]);
    res.status(200).json({
      success: true,
      data: feedback,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateFeedbackStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;
    if (!status || !['pending', 'resolved', 'spam'].includes(status)) {
      res.status(400);
      throw new Error('Valid status (pending, resolved, spam) is required');
    }
    const feedback = await Feedback.findById(id);
    if (!feedback) {
      res.status(404);
      throw new Error('Feedback not found');
    }
    feedback.status = status;
    if (response !== undefined) {
      feedback.response = response.trim();
      if (response.trim()) {
        feedback.respondedAt = new Date();
        feedback.respondedBy = req.user._id;
      }
    }
    await feedback.save();
    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    next(error);
  }
};

const deleteFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findById(id);
    if (!feedback) {
      res.status(404);
      throw new Error('Feedback not found');
    }
    await feedback.deleteOne();
    res.status(200).json({ success: true, message: 'Feedback deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendFeedbackOTP,
  submitFeedback,
  getAllFeedback,
  updateFeedbackStatus,
  deleteFeedback,
};