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

    // Find user by username, explicitly include password
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    // Check if user is blocked
    if (user.isBlocked) {
      res.status(403);
      throw new Error('Your account has been blocked. Please contact support.');
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid credentials');
    }

    // Prepare response (exclude sensitive fields)
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
    // req.user is already attached by protect middleware
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

    // Validate required fields
    if (!username || !email || !cafeName) {
      res.status(400);
      throw new Error('Username, email, and cafe name are required');
    }

    // Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      res.status(400);
      throw new Error('Username or email already taken');
    }

    // Generate a secure temporary password if not provided
    const generatedPassword = temporaryPassword || Math.random().toString(36).slice(-8) + 'Aa1!';
    // Ensure minimum length (6)
    const finalPassword = generatedPassword.length < 6 ? generatedPassword + 'Aa1!' : generatedPassword;

    // Generate a slug from cafeName
    const baseSlug = cafeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    // Check for uniqueness and append random string if needed
    let slug = baseSlug;
    let slugExists = await User.findOne({ slug });
    if (slugExists) {
      // Append a short random string (6 chars) to make it unique
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      slug = `${baseSlug}-${randomSuffix}`;
      // In the rare case it still exists, loop (but very unlikely)
      while (await User.findOne({ slug })) {
        slug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;
      }
    }

    // Create the owner user
    const newOwner = await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: finalPassword, // will be hashed by pre-save hook
      role: 'owner',
      isBlocked: false,
      cafeName: cafeName.trim(),
      slug: slug,
      // Default theme and other fields will be set via schema defaults
    });

    // Return the created user (without password) and the temporary password
    const userResponse = newOwner.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Cafe owner created successfully',
      data: {
        user: userResponse,
        temporaryPassword: finalPassword, // send back so superadmin can share it
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginUser,
  getProfile,
  createOwner,
};