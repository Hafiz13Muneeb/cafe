// controllers/authController.js
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendOTPEmail } = require('../utils/email');
const generateToken = require('../utils/generateToken');

// ============================================================
// OTP RATE LIMITING (in-memory)
// ============================================================

// Map: email -> array of timestamps (in ms)
const otpRequestLogs = new Map();

// Limits
const OTP_MAX_REQUESTS = 3;               // per window
const OTP_WINDOW_MS = 15 * 60 * 1000;    // 15 minutes
const OTP_MIN_INTERVAL_MS = 60 * 1000;   // 60 seconds between requests

// Periodically clean up expired entries (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [email, timestamps] of otpRequestLogs.entries()) {
    // Filter timestamps that are within the window
    const valid = timestamps.filter(ts => now - ts < OTP_WINDOW_MS);
    if (valid.length === 0) {
      otpRequestLogs.delete(email);
    } else {
      otpRequestLogs.set(email, valid);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check if an email is allowed to request a new OTP.
 * Throws an error with the appropriate message if not allowed.
 */
const checkOTPRateLimit = (email) => {
  const now = Date.now();
  const timestamps = otpRequestLogs.get(email) || [];

  // Clean old entries for this email
  const recent = timestamps.filter(ts => now - ts < OTP_WINDOW_MS);

  // Check max requests
  if (recent.length >= OTP_MAX_REQUESTS) {
    const oldest = recent[0];
    const resetTime = new Date(oldest + OTP_WINDOW_MS);
    throw new Error(`Too many OTP requests. Please try again after ${resetTime.toLocaleTimeString()}.`);
  }

  // Check cooldown (last request)
  if (recent.length > 0) {
    const last = recent[recent.length - 1];
    const elapsed = now - last;
    if (elapsed < OTP_MIN_INTERVAL_MS) {
      const remaining = Math.ceil((OTP_MIN_INTERVAL_MS - elapsed) / 1000);
      throw new Error(`Please wait ${remaining} seconds before requesting a new code.`);
    }
  }

  // Allowed – update the log
  recent.push(now);
  otpRequestLogs.set(email, recent);
};

// ============================================================
// HELPERS
// ============================================================

// Generate a 6‑digit numeric OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ============================================================
// AUTHENTICATION
// ============================================================

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400);
      throw new Error('Please provide username and password');
    }

    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    if (user.isBlocked) {
      res.status(403);
      throw new Error('Your account has been blocked. Please contact support.');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    const token = generateToken(user._id);

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
      cafeName: user.cafeName || '',
      slug: user.slug || '',
      whatsappNumber: user.whatsappNumber || '',
      logoUrl: user.logoUrl || '',
      faviconUrl: user.faviconUrl || '',
      tables: user.tables || [],
      theme: user.theme || { primaryColor: '#d4a843', secondaryColor: '#b8860b', mode: 'light' },
    };

    res.status(200).json({
      success: true,
      data: { user: userResponse },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = async (req, res, next) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0),
      path: '/',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user profile
// @route   GET /api/auth/me
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// OTP (One-Time Password) VERIFICATION
// ============================================================

// @desc    Send OTP to the provided email
// @route   POST /api/auth/send-otp
// @access  Public
const sendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400);
      throw new Error('Email is required');
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      res.status(400);
      throw new Error('Please provide a valid email address');
    }

    const emailLower = email.trim().toLowerCase();

    // ✅ Apply rate limiting
    try {
      checkOTPRateLimit(emailLower);
    } catch (rateError) {
      res.status(429); // Too Many Requests
      throw new Error(rateError.message);
    }

    // Invalidate any existing unverified OTP for this email
    await OTP.deleteMany({ email: emailLower, verified: false });

    // Generate a new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.create({
      email: emailLower,
      otp,
      expiresAt,
    });

    // Send OTP via email
    const result = await sendOTPEmail(emailLower, otp, {
      brandName: process.env.BRAND_NAME || 'CafeFlow',
    });

    if (!result.success) {
      console.error('Failed to send OTP email:', result.error);
      res.status(500);
      throw new Error('Failed to send OTP. Please try again later.');
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      // Optional: for debugging in development
      // otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400);
      throw new Error('Email and OTP are required');
    }

    const emailLower = email.trim().toLowerCase();

    const otpRecord = await OTP.findOne({
      email: emailLower,
      otp: otp.trim(),
      verified: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      res.status(400);
      throw new Error('Invalid or expired OTP. Please request a new one.');
    }

    otpRecord.verified = true;
    await otpRecord.save();

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// OWNER CREATION (SuperAdmin only)
// ============================================================

// @desc    Create a new cafe owner (Super-admin only)
// @route   POST /api/auth/create-owner
// @access  Private (Superadmin)
const createOwner = async (req, res, next) => {
  try {
    const { username, email, cafeName, temporaryPassword } = req.body;

    if (!username || !email || !cafeName) {
      res.status(400);
      throw new Error('Username, email, and cafe name are required');
    }

    if (!temporaryPassword || temporaryPassword.length < 6) {
      res.status(400);
      throw new Error('Password is required and must be at least 6 characters');
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      res.status(400);
      throw new Error('Username or email already taken');
    }

    const baseSlug = cafeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    let slug = baseSlug;
    let slugExists = await User.findOne({ slug });
    if (slugExists) {
      let randomSuffix = Math.random().toString(36).substring(2, 8);
      slug = `${baseSlug}-${randomSuffix}`;
      while (await User.findOne({ slug })) {
        randomSuffix = Math.random().toString(36).substring(2, 8);
        slug = `${baseSlug}-${randomSuffix}`;
      }
    }

    const newOwner = await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: temporaryPassword.trim(),
      role: 'owner',
      isBlocked: false,
      cafeName: cafeName.trim(),
      slug: slug,
    });

    const userResponse = newOwner.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Cafe owner created successfully',
      data: { user: userResponse },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PUBLIC REGISTRATION (with optional OTP verification)
// ============================================================

// @desc    Public registration for new cafe owners
// @route   POST /api/auth/register
// @access  Public
const registerOwner = async (req, res, next) => {
  try {
    const { username, email, cafeName, password } = req.body;

    if (!username || !email || !cafeName || !password) {
      res.status(400);
      throw new Error('All fields are required');
    }
    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      res.status(400);
      throw new Error('Please provide a valid email address');
    }
    if (username.length < 3 || username.length > 30) {
      res.status(400);
      throw new Error('Username must be between 3 and 30 characters');
    }

    const existing = await User.findOne({
      $or: [{ username: username.trim() }, { email: email.trim().toLowerCase() }],
    });
    if (existing) {
      res.status(400);
      throw new Error('Username or email already taken');
    }

    const baseSlug = cafeName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (await User.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const newUser = await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      role: 'owner',
      isBlocked: false,
      cafeName: cafeName.trim(),
      slug,
    });

    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { user: userResponse },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// PASSWORD & PROFILE UPDATES
// ============================================================

// @desc    Change password (for logged-in user)
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      res.status(400);
      throw new Error('Please provide old password, new password, and confirmation');
    }

    if (newPassword.length < 6) {
      res.status(400);
      throw new Error('New password must be at least 6 characters');
    }

    if (newPassword !== confirmPassword) {
      res.status(400);
      throw new Error('New password and confirmation do not match');
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      res.status(401);
      throw new Error('Incorrect current password');
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile (username, email)
// @route   PUT /api/auth/update-profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (username !== undefined) {
      const trimmed = username.trim();
      if (!trimmed || trimmed.length < 3 || trimmed.length > 30) {
        res.status(400);
        throw new Error('Username must be between 3 and 30 characters');
      }
      if (trimmed !== user.username) {
        const existing = await User.findOne({ username: trimmed });
        if (existing) {
          res.status(400);
          throw new Error('Username already taken');
        }
        user.username = trimmed;
      }
    }

    if (email !== undefined) {
      const trimmed = email.trim().toLowerCase();
      if (!trimmed || !/^\S+@\S+\.\S+$/.test(trimmed)) {
        res.status(400);
        throw new Error('Please provide a valid email address');
      }
      if (trimmed !== user.email) {
        const existing = await User.findOne({ email: trimmed });
        if (existing) {
          res.status(400);
          throw new Error('Email already taken');
        }
        user.email = trimmed;
      }
    }

    await user.save();
    const updatedUser = await User.findById(user._id).select('-password');
    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginUser,
  logoutUser,
  getProfile,
  sendOTP,
  verifyOTP,
  createOwner,
  registerOwner,
  changePassword,
  updateProfile,
};