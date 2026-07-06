const User = require('../models/User');
const AppSettings = require('../models/AppSettings');
const cloudinary = require('../config/cloudinary');

// ============================================================
// HELPERS
// ============================================================

// Extract Cloudinary public_id from URL
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

// Generate a unique slug from a base string
const generateUniqueSlug = async (baseSlug, excludeId) => {
  let newSlug = baseSlug;
  let counter = 1;
  const query = { slug: newSlug };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  while (await User.findOne(query)) {
    newSlug = `${baseSlug}-${counter}`;
    counter++;
    query.slug = newSlug;
  }
  return newSlug;
};

// ============================================================
// OWNER SETTINGS
// ============================================================

// @desc    Get the logged-in owner's settings
// @route   GET /api/settings
// @access  Private (Owner)
const getSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      'cafeName whatsappNumber logoUrl faviconUrl tables slug currency'
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
        slug: user.slug || '',
        currency: user.currency || 'Rs',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update the logged-in owner's settings
// @route   PUT /api/settings
// @access  Private (Owner)
const updateSettings = async (req, res, next) => {
  try {
    const { cafeName, whatsappNumber, tables, slug, currency } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const changes = {};

    // --- cafeName ---
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
      if (trimmed !== user.cafeName) {
        user.cafeName = trimmed;
        changes.cafeName = trimmed;
      }
    }

    // --- slug (explicit) ---
    if (slug !== undefined) {
      const trimmedSlug = slug.trim().toLowerCase();
      if (!trimmedSlug || trimmedSlug.length === 0) {
        res.status(400);
        throw new Error('Slug cannot be empty');
      }
      if (!/^[a-z0-9-]+$/.test(trimmedSlug)) {
        res.status(400);
        throw new Error('Slug can only contain lowercase letters, numbers, and hyphens');
      }
      if (trimmedSlug !== user.slug) {
        const existing = await User.findOne({
          slug: trimmedSlug,
          _id: { $ne: user._id },
        });
        if (existing) {
          res.status(400);
          throw new Error('This slug is already taken. Please choose another.');
        }
        user.slug = trimmedSlug;
        changes.slug = trimmedSlug;
      }
    } else if (cafeName !== undefined && cafeName.trim() !== user.cafeName) {
      // Auto-regenerate slug from new cafeName
      const baseSlug = user.cafeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const newSlug = await generateUniqueSlug(baseSlug, user._id);
      if (newSlug !== user.slug) {
        user.slug = newSlug;
        changes.slug = newSlug;
        changes.slugWarning =
          'Your cafe URL has changed. Existing QR codes will no longer work. Please regenerate them.';
      }
    }

    // --- whatsappNumber ---
    if (whatsappNumber !== undefined) {
      const trimmed = whatsappNumber.trim();
      if (!/^[0-9]{10,15}$/.test(trimmed)) {
        res.status(400);
        throw new Error('WhatsApp number must be 10-15 digits, no special chars');
      }
      if (trimmed !== user.whatsappNumber) {
        user.whatsappNumber = trimmed;
        changes.whatsappNumber = trimmed;
      }
    }

    // --- tables ---
    if (tables !== undefined) {
      let tableArray;
      if (Array.isArray(tables)) {
        tableArray = tables;
      } else if (typeof tables === 'string') {
        tableArray = tables.split(',').map((t) => t.trim()).filter((t) => t.length > 0);
      } else {
        res.status(400);
        throw new Error('Tables must be an array or comma-separated string');
      }
      if (tableArray.length === 0) {
        res.status(400);
        throw new Error('Please provide at least one table number/name');
      }
      user.tables = tableArray;
      changes.tables = tableArray;
    }

    // --- currency ---
    if (currency !== undefined) {
      const trimmed = currency.trim();
      if (!trimmed || trimmed.length === 0) {
        res.status(400);
        throw new Error('Currency symbol cannot be empty');
      }
      if (trimmed.length > 10) {
        res.status(400);
        throw new Error('Currency symbol must be 10 characters or less');
      }
      if (trimmed !== user.currency) {
        user.currency = trimmed;
        changes.currency = trimmed;
      }
    }

    // --- logo & favicon uploads ---
    if (req.files) {
      // Logo
      if (req.files.logo && req.files.logo[0]) {
        const logoFile = req.files.logo[0];
        const oldLogoUrl = user.logoUrl;
        try {
          user.logoUrl = logoFile.path;
          if (oldLogoUrl) {
            const publicId = extractPublicId(oldLogoUrl);
            if (publicId) {
              try {
                await cloudinary.uploader.destroy(publicId);
              } catch (cloudinaryError) {
                console.error('Failed to delete old logo from Cloudinary:', cloudinaryError);
              }
            }
          }
          changes.logoUrl = logoFile.path;
        } catch (uploadError) {
          user.logoUrl = oldLogoUrl;
          console.error('Failed to upload new logo:', uploadError);
          res.status(400);
          throw new Error('Failed to upload logo. Please try again.');
        }
      }

      // Favicon
      if (req.files.favicon && req.files.favicon[0]) {
        const faviconFile = req.files.favicon[0];
        const oldFaviconUrl = user.faviconUrl;
        try {
          user.faviconUrl = faviconFile.path;
          if (oldFaviconUrl) {
            const publicId = extractPublicId(oldFaviconUrl);
            if (publicId) {
              try {
                await cloudinary.uploader.destroy(publicId);
              } catch (cloudinaryError) {
                console.error('Failed to delete old favicon from Cloudinary:', cloudinaryError);
              }
            }
          }
          changes.faviconUrl = faviconFile.path;
        } catch (uploadError) {
          user.faviconUrl = oldFaviconUrl;
          console.error('Failed to upload new favicon:', uploadError);
          res.status(400);
          throw new Error('Failed to upload favicon. Please try again.');
        }
      }
    }

    await user.save();

    const responseData = {
      cafeName: user.cafeName,
      slug: user.slug,
      whatsappNumber: user.whatsappNumber,
      logoUrl: user.logoUrl || '',
      faviconUrl: user.faviconUrl || '',
      tables: user.tables || [],
      currency: user.currency || 'Rs',
    };

    if (changes.slugWarning) {
      responseData.warning = changes.slugWarning;
    }

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GLOBAL SETTINGS (App-wide)
// ============================================================

// @desc    Get global app settings (theme + favicon + pricing)
// @route   GET /api/settings/global
// @access  Public
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
    const { primaryColor, secondaryColor, mode, monthlyPrice, trialPeriodDays } = req.body;
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

    if (monthlyPrice !== undefined) {
      if (typeof monthlyPrice !== 'number' || monthlyPrice < 0) {
        res.status(400);
        throw new Error('Monthly price must be a positive number');
      }
      settings.monthlyPrice = monthlyPrice;
    }

    if (trialPeriodDays !== undefined) {
      if (typeof trialPeriodDays !== 'number' || trialPeriodDays < 0) {
        res.status(400);
        throw new Error('Trial period days must be a positive number');
      }
      settings.trialPeriodDays = trialPeriodDays;
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

// @desc    Update global favicon (SuperAdmin only)
// @route   PUT /api/settings/global/favicon
// @access  Private (SuperAdmin)
const updateGlobalFavicon = async (req, res, next) => {
  try {
    const settings = await AppSettings.getSingleton();
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a favicon image');
    }

    const oldFaviconUrl = settings.faviconUrl;
    try {
      settings.faviconUrl = req.file.path;
      if (oldFaviconUrl) {
        const publicId = extractPublicId(oldFaviconUrl);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (cloudinaryError) {
            console.error('Failed to delete old favicon from Cloudinary:', cloudinaryError);
          }
        }
      }
    } catch (uploadError) {
      settings.faviconUrl = oldFaviconUrl;
      console.error('Failed to upload new favicon:', uploadError);
      res.status(400);
      throw new Error('Failed to upload favicon. Please try again.');
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

// ============================================================
// PUBLIC PRICING ENDPOINT
// ============================================================

// @desc    Get current pricing (monthly price & trial days)
// @route   GET /api/settings/pricing
// @access  Public
const getPricing = async (req, res, next) => {
  try {
    const settings = await AppSettings.getSingleton();
    res.status(200).json({
      success: true,
      data: {
        monthlyPrice: settings.monthlyPrice || 39,
        trialPeriodDays: settings.trialPeriodDays || 30,
        currency: 'USD',
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE PRICING (SuperAdmin only)
// ============================================================

// @desc    Update monthly price (SuperAdmin only)
// @route   PUT /api/settings/pricing
// @access  Private (SuperAdmin)
const updatePricing = async (req, res, next) => {
  try {
    const { monthlyPrice, trialPeriodDays } = req.body;
    const settings = await AppSettings.getSingleton();

    if (monthlyPrice !== undefined) {
      if (typeof monthlyPrice !== 'number' || monthlyPrice < 0) {
        res.status(400);
        throw new Error('Monthly price must be a positive number');
      }
      settings.monthlyPrice = monthlyPrice;
    }

    if (trialPeriodDays !== undefined) {
      if (typeof trialPeriodDays !== 'number' || trialPeriodDays < 0) {
        res.status(400);
        throw new Error('Trial period days must be a positive number');
      }
      settings.trialPeriodDays = trialPeriodDays;
    }

    await settings.save();

    res.status(200).json({
      success: true,
      data: {
        monthlyPrice: settings.monthlyPrice,
        trialPeriodDays: settings.trialPeriodDays,
        currency: 'USD',
      },
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
  updateGlobalFavicon,
  getPricing,
  updatePricing,
};