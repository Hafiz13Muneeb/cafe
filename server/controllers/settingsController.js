const User = require('../models/User');
const AppSettings = require('../models/AppSettings');
const cloudinary = require('../config/cloudinary');

// Helper: extract Cloudinary public_id from URL
const extractPublicId = (imageUrl) => {
  if (!imageUrl) return null;
  const uploadIndex = imageUrl.indexOf('/upload/');
  if (uploadIndex === -1) return null;
  const afterUpload = imageUrl.substring(uploadIndex + 8);
  const parts = afterUpload.split('/');
  if (parts[0].startsWith('v')) {
    parts.shift();
  }
  const publicIdWithExt = parts.join('/');
  return publicIdWithExt.replace(/\.[^/.]+$/, '');
};

// ============================================================
// OWNER SETTINGS (per-cafe)
// ============================================================

// @desc    Get the logged-in owner's settings
// @route   GET /api/settings
// @access  Private (Owner)
const getSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      'cafeName whatsappNumber logoUrl faviconUrl tables'
    );
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.status(200).json({
      success: true,
      data: {
        cafeName: user.cafeName || '',
        whatsappNumber: user.whatsappNumber || '',
        logoUrl: user.logoUrl || '',
        faviconUrl: user.faviconUrl || '',
        tables: user.tables || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update the logged-in owner's settings (cafeName, whatsapp, tables, logo, favicon)
// @route   PUT /api/settings
// @access  Private (Owner)
const updateSettings = async (req, res, next) => {
  try {
    const { cafeName, whatsappNumber, tables } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // --- Update cafeName (also regenerates slug) ---
    if (cafeName !== undefined) {
      const trimmed = cafeName.trim();
      if (!trimmed || trimmed.length === 0) {
        res.status(400);
        throw new Error('Cafe name cannot be empty');
      }
      if (trimmed.length > 100) {
        res.status(400);
        throw new Error('Cafe name must be 100 characters or less');
      }
      user.cafeName = trimmed;

      // Regenerate slug
      const baseSlug = trimmed
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      let newSlug = baseSlug;
      const existing = await User.findOne({ slug: newSlug, _id: { $ne: user._id } });
      if (existing) {
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        newSlug = `${baseSlug}-${randomSuffix}`;
        while (await User.findOne({ slug: newSlug, _id: { $ne: user._id } })) {
          newSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;
        }
      }
      user.slug = newSlug;
    }

    // --- Update WhatsApp number ---
    if (whatsappNumber !== undefined) {
      const trimmed = whatsappNumber.trim();
      if (!/^[0-9]{10,15}$/.test(trimmed)) {
        res.status(400);
        throw new Error('WhatsApp number must be 10-15 digits, no special chars');
      }
      user.whatsappNumber = trimmed;
    }

    // --- Update tables ---
    if (tables !== undefined) {
      let tableArray;
      if (Array.isArray(tables)) {
        tableArray = tables;
      } else if (typeof tables === 'string') {
        tableArray = tables.split(',').map(t => t.trim()).filter(t => t.length > 0);
      } else {
        res.status(400);
        throw new Error('Tables must be an array or comma-separated string');
      }
      if (tableArray.length === 0) {
        res.status(400);
        throw new Error('Please provide at least one table number/name');
      }
      user.tables = tableArray;
    }

    // --- Handle logo upload ---
    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        const logoFile = req.files.logo[0];
        if (user.logoUrl) {
          const publicId = extractPublicId(user.logoUrl);
          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId);
            } catch (cloudinaryError) {
              console.error('Failed to delete old logo from Cloudinary:', cloudinaryError);
            }
          }
        }
        user.logoUrl = logoFile.path;
      }

      if (req.files.favicon && req.files.favicon[0]) {
        const faviconFile = req.files.favicon[0];
        if (user.faviconUrl) {
          const publicId = extractPublicId(user.faviconUrl);
          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId);
            } catch (cloudinaryError) {
              console.error('Failed to delete old favicon from Cloudinary:', cloudinaryError);
            }
          }
        }
        user.faviconUrl = faviconFile.path;
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        cafeName: user.cafeName,
        slug: user.slug,
        whatsappNumber: user.whatsappNumber,
        logoUrl: user.logoUrl || '',
        faviconUrl: user.faviconUrl || '',
        tables: user.tables || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GLOBAL SETTINGS (App-wide theme)
// ============================================================

// @desc    Get global app settings (theme)
// @route   GET /api/settings/global
// @access  Public (anyone can read)
const getGlobalSettings = async (req, res, next) => {
  try {
    const settings = await AppSettings.getSingleton();
    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update global app settings (SuperAdmin only)
// @route   PUT /api/settings/global
// @access  Private (SuperAdmin)
const updateGlobalSettings = async (req, res, next) => {
  try {
    const { primaryColor, secondaryColor, mode } = req.body;

    const settings = await AppSettings.getSingleton();

    if (primaryColor !== undefined) {
      if (!/^#[0-9A-F]{6}$/i.test(primaryColor)) {
        res.status(400);
        throw new Error('Primary color must be a valid hex color');
      }
      settings.primaryColor = primaryColor;
    }

    if (secondaryColor !== undefined) {
      if (!/^#[0-9A-F]{6}$/i.test(secondaryColor)) {
        res.status(400);
        throw new Error('Secondary color must be a valid hex color');
      }
      settings.secondaryColor = secondaryColor;
    }

    if (mode !== undefined) {
      if (!['light', 'dark'].includes(mode)) {
        res.status(400);
        throw new Error('Mode must be either "light" or "dark"');
      }
      settings.mode = mode;
    }

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  getGlobalSettings,
  updateGlobalSettings,
};