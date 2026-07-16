// server/controllers/settingsController.js - Single-cafe settings with email support
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

// Helper: expand 3‑digit hex to 6‑digit (e.g. #111 → #111111)
const expandHex = (hex) => {
  if (!hex) return hex;
  const cleaned = hex.trim();
  if (/^#[0-9A-F]{6}$/i.test(cleaned)) return cleaned;
  if (/^#[0-9A-F]{3}$/i.test(cleaned)) {
    const r = cleaned[1];
    const g = cleaned[2];
    const b = cleaned[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return cleaned;
};

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

// Helper: generate a unique slug from a base string
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
// OWNER SETTINGS (single-cafe)
// ============================================================

// @desc    Get the logged-in owner's settings
// @route   GET /api/settings
// @access  Private (Owner)
const getSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      'cafeName whatsappNumber logoUrl faviconUrl tables slug theme email'
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
        email: user.email || '',
        theme: user.theme || { primaryColor: '#d4a843', secondaryColor: '#b8860b', mode: 'light' },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update settings – supports partial updates (cafe, theme, images, email)
// @route   PUT /api/settings
// @access  Private (Owner)
const updateSettings = async (req, res, next) => {
  try {
    const { cafeName, whatsappNumber, tables, slug, email, primaryColor, secondaryColor, mode } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const changes = {};

    // --- Update cafeName ---
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

    // --- Update slug ---
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
        const existing = await User.findOne({ slug: trimmedSlug, _id: { $ne: user._id } });
        if (existing) {
          res.status(400);
          throw new Error('This slug is already taken. Please choose another.');
        }
        user.slug = trimmedSlug;
        changes.slug = trimmedSlug;
      }
    } else if (cafeName !== undefined && cafeName.trim() !== user.cafeName && !slug) {
      const baseSlug = user.cafeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const newSlug = await generateUniqueSlug(baseSlug, user._id);
      if (newSlug !== user.slug) {
        user.slug = newSlug;
        changes.slug = newSlug;
        changes.slugWarning = 'Your cafe URL has changed. Existing QR codes will no longer work. Please regenerate them.';
      }
    }

    // --- Update WhatsApp number ---
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

    // --- Update tables ---
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

    // --- Update Email (support email) ---
    if (email !== undefined) {
      const trimmed = email.trim();
      if (trimmed && !/^\S+@\S+\.\S+$/.test(trimmed)) {
        res.status(400);
        throw new Error('Please provide a valid email address');
      }
      user.email = trimmed || '';
      changes.email = trimmed;
    }

    // --- Update theme (with hex expansion) ---
    if (primaryColor !== undefined || secondaryColor !== undefined || mode !== undefined) {
      if (!user.theme) user.theme = {};
      if (primaryColor !== undefined) {
        const expanded = expandHex(primaryColor);
        if (!/^#[0-9A-F]{6}$/i.test(expanded)) {
          res.status(400);
          throw new Error('Primary color must be a valid hex color (e.g. #d4a843 or #d4a)');
        }
        user.theme.primaryColor = expanded;
        changes.primaryColor = expanded;
      }
      if (secondaryColor !== undefined) {
        const expanded = expandHex(secondaryColor);
        if (!/^#[0-9A-F]{6}$/i.test(expanded)) {
          res.status(400);
          throw new Error('Secondary color must be a valid hex color (e.g. #b8860b or #b88)');
        }
        user.theme.secondaryColor = expanded;
        changes.secondaryColor = expanded;
      }
      if (mode !== undefined) {
        if (!['light', 'dark'].includes(mode)) {
          res.status(400);
          throw new Error('Mode must be either "light" or "dark"');
        }
        user.theme.mode = mode;
        changes.mode = mode;
      }
    }

    // --- Handle logo/favicon upload ---
    if (req.files) {
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
              } catch (err) {
                console.error('Failed to delete old logo:', err);
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
              } catch (err) {
                console.error('Failed to delete old favicon:', err);
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
      email: user.email || '',
      logoUrl: user.logoUrl || '',
      faviconUrl: user.faviconUrl || '',
      tables: user.tables || [],
      theme: user.theme || { primaryColor: '#d4a843', secondaryColor: '#b8860b', mode: 'light' },
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
// GLOBAL SETTINGS (used by public pages for theme & support email)
// ============================================================

// @desc    Get global app settings (theme + favicon + support email)
// @route   GET /api/settings/global
// @access  Public
const getGlobalSettings = async (req, res, next) => {
  try {
    const owner = await User.findOne().select('theme faviconUrl email');
    if (!owner) {
      return res.status(200).json({
        success: true,
        data: {
          primaryColor: '#d4a843',
          secondaryColor: '#b8860b',
          mode: 'light',
          faviconUrl: '',
          supportEmail: '',
        },
      });
    }
    res.status(200).json({
      success: true,
      data: {
        primaryColor: owner.theme?.primaryColor || '#d4a843',
        secondaryColor: owner.theme?.secondaryColor || '#b8860b',
        mode: owner.theme?.mode || 'light',
        faviconUrl: owner.faviconUrl || '',
        supportEmail: owner.email || '',
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
};