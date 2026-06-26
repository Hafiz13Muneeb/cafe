const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Login user (both superadmin and cafe owners)
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
      data: {
        user: userResponse,
        token: generateToken(user._id),
      },
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

    // ❗ Password is now REQUIRED (no auto-generation)
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

    // Generate slug from cafeName
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
      password: temporaryPassword.trim(), // will be hashed by pre-save
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
      data: {
        user: userResponse,
        // We don't return the password anymore – superadmin provided it.
      },
    });
  } catch (error) {
    next(error);
  }
};

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

module.exports = {
  loginUser,
  getProfile,
  createOwner,
  changePassword,
};