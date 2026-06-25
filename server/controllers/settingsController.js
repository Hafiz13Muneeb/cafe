// controllers/settingsController.js - Get and update cafe settings (with theme)
const Admin = require('../models/Admin');
const cloudinary = require('../config/cloudinary');

// Helper: extract Cloudinary public_id from URL (copied from menuController for consistency)
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

// Helper: validate hex color
const isValidHexColor = (color) => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

// @desc    Get cafe settings (public)
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res, next) => {
  try {
    const admin = await Admin.findOne().select('whatsappNumber cafeName logoUrl faviconUrl tables theme');

    if (!admin) {
      res.status(404);
      throw new Error('Settings not found');
    }

    res.status(200).json({
      success: true,
      data: {
        whatsappNumber: admin.whatsappNumber,
        cafeName: admin.cafeName,
        logoUrl: admin.logoUrl || '',
        faviconUrl: admin.faviconUrl || '',
        tables: admin.tables || [],
        theme: admin.theme || { primaryColor: '#d4a843', secondaryColor: '#b8860b', mode: 'light' },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cafe settings (protected) – accepts JSON + optional files
// @route   PUT /api/settings
// @access  Private
const updateSettings = async (req, res, next) => {
  try {
    const { whatsappNumber, cafeName, tables, primaryColor, secondaryColor, mode } = req.body;

    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      res.status(404);
      throw new Error('Admin not found');
    }

    // --- Update text fields with validation ---
    if (whatsappNumber !== undefined) {
      const trimmed = whatsappNumber.trim();
      if (!/^[0-9]{10,15}$/.test(trimmed)) {
        res.status(400);
        throw new Error('WhatsApp number must be 10-15 digits, no special chars');
      }
      admin.whatsappNumber = trimmed;
    }

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
      admin.cafeName = trimmed;
    }

    // --- Tables: parse from comma-separated string to array ---
    if (tables !== undefined) {
      const tableArray = tables.split(',').map(t => t.trim()).filter(t => t.length > 0);
      if (tableArray.length === 0) {
        res.status(400);
        throw new Error('Please provide at least one table number/name');
      }
      admin.tables = tableArray;
    }

    // --- Theme validation ---
    if (primaryColor !== undefined) {
      if (!isValidHexColor(primaryColor)) {
        res.status(400);
        throw new Error('Primary color must be a valid hex color (e.g., #d4a843)');
      }
      admin.theme.primaryColor = primaryColor;
    }
    if (secondaryColor !== undefined) {
      if (!isValidHexColor(secondaryColor)) {
        res.status(400);
        throw new Error('Secondary color must be a valid hex color (e.g., #b8860b)');
      }
      admin.theme.secondaryColor = secondaryColor;
    }
    if (mode !== undefined) {
      if (!['light', 'dark'].includes(mode)) {
        res.status(400);
        throw new Error('Mode must be either "light" or "dark"');
      }
      admin.theme.mode = mode;
    }

    // --- Handle logo upload ---
    if (req.files && req.files.logo) {
      const logoFile = req.files.logo[0];
      if (admin.logoUrl) {
        const publicId = extractPublicId(admin.logoUrl);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (cloudinaryError) {
            console.error('Failed to delete old logo from Cloudinary:', cloudinaryError);
            // Continue with upload
          }
        }
      }
      admin.logoUrl = logoFile.path;
    }

    // --- Handle favicon upload ---
    if (req.files && req.files.favicon) {
      const faviconFile = req.files.favicon[0];
      if (admin.faviconUrl) {
        const publicId = extractPublicId(admin.faviconUrl);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (cloudinaryError) {
            console.error('Failed to delete old favicon from Cloudinary:', cloudinaryError);
            // Continue with upload
          }
        }
      }
      admin.faviconUrl = faviconFile.path;
    }

    await admin.save();

    // Return updated settings
    res.status(200).json({
      success: true,
      data: {
        whatsappNumber: admin.whatsappNumber,
        cafeName: admin.cafeName,
        logoUrl: admin.logoUrl || '',
        faviconUrl: admin.faviconUrl || '',
        tables: admin.tables || [],
        theme: admin.theme,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
};