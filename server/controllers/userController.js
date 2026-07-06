const User = require('../models/User');

// ============================================================
// GET ALL OWNERS (SuperAdmin only)
// ============================================================

// @desc    Get all cafe owners
// @route   GET /api/users/owners
// @access  Private (SuperAdmin)
const getAllOwners = async (req, res, next) => {
  try {
    const owners = await User.find({ role: 'owner' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: owners.length,
      data: owners,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// GET SINGLE OWNER BY ID (SuperAdmin only)
// ============================================================

// @desc    Get a single owner by ID
// @route   GET /api/users/owners/:id
// @access  Private (SuperAdmin)
const getOwnerById = async (req, res, next) => {
  try {
    const owner = await User.findOne({ _id: req.params.id, role: 'owner' }).select('-password');
    if (!owner) {
      res.status(404);
      throw new Error('Owner not found');
    }
    res.status(200).json({
      success: true,
      data: owner,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// TOGGLE BLOCK STATUS (SuperAdmin only)
// ============================================================

// @desc    Toggle block status of an owner
// @route   PUT /api/users/owners/:id/toggle-block
// @access  Private (SuperAdmin)
const toggleBlockOwner = async (req, res, next) => {
  try {
    const owner = await User.findOne({ _id: req.params.id, role: 'owner' });
    if (!owner) {
      res.status(404);
      throw new Error('Owner not found');
    }

    owner.isBlocked = !owner.isBlocked;
    await owner.save();

    res.status(200).json({
      success: true,
      message: `Owner ${owner.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      data: {
        id: owner._id,
        isBlocked: owner.isBlocked,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// UPDATE OWNER DETAILS (SuperAdmin only)
// ============================================================

// @desc    Update owner details (cafeName, whatsapp, tables, theme, logo, favicon, currency)
// @route   PUT /api/users/owners/:id
// @access  Private (SuperAdmin)
const updateOwner = async (req, res, next) => {
  try {
    const { cafeName, whatsappNumber, tables, theme, logoUrl, faviconUrl, currency } = req.body;
    const owner = await User.findOne({ _id: req.params.id, role: 'owner' });
    if (!owner) {
      res.status(404);
      throw new Error('Owner not found');
    }

    // --- cafeName & auto-slug regeneration ---
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
      owner.cafeName = trimmed;

      // Regenerate slug from cafeName
      const baseSlug = trimmed
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      let newSlug = baseSlug;
      const existing = await User.findOne({ slug: newSlug, _id: { $ne: owner._id } });
      if (existing) {
        let randomSuffix = Math.random().toString(36).substring(2, 8);
        newSlug = `${baseSlug}-${randomSuffix}`;
        while (await User.findOne({ slug: newSlug, _id: { $ne: owner._id } })) {
          randomSuffix = Math.random().toString(36).substring(2, 8);
          newSlug = `${baseSlug}-${randomSuffix}`;
        }
      }
      owner.slug = newSlug;
    }

    // --- whatsappNumber ---
    if (whatsappNumber !== undefined) {
      const trimmed = whatsappNumber.trim();
      if (!/^[0-9]{10,15}$/.test(trimmed)) {
        res.status(400);
        throw new Error('WhatsApp number must be 10-15 digits, no special chars');
      }
      owner.whatsappNumber = trimmed;
    }

    // --- tables ---
    if (tables !== undefined) {
      if (!Array.isArray(tables)) {
        res.status(400);
        throw new Error('Tables must be an array');
      }
      if (tables.length === 0) {
        res.status(400);
        throw new Error('Please provide at least one table number/name');
      }
      owner.tables = tables.map(t => t.trim()).filter(t => t.length > 0);
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
      owner.currency = trimmed;
    }

    // --- theme ---
    if (theme !== undefined) {
      const { primaryColor, secondaryColor, mode } = theme;
      if (primaryColor && !/^#[0-9A-F]{6}$/i.test(primaryColor)) {
        res.status(400);
        throw new Error('Primary color must be a valid hex color');
      }
      if (secondaryColor && !/^#[0-9A-F]{6}$/i.test(secondaryColor)) {
        res.status(400);
        throw new Error('Secondary color must be a valid hex color');
      }
      if (mode && !['light', 'dark'].includes(mode)) {
        res.status(400);
        throw new Error('Mode must be either "light" or "dark"');
      }
      owner.theme = {
        ...owner.theme,
        ...(primaryColor && { primaryColor }),
        ...(secondaryColor && { secondaryColor }),
        ...(mode && { mode }),
      };
    }

    // --- logo & favicon (URLs, not file uploads) ---
    if (logoUrl !== undefined) {
      owner.logoUrl = logoUrl.trim();
    }
    if (faviconUrl !== undefined) {
      owner.faviconUrl = faviconUrl.trim();
    }

    await owner.save();

    const updatedOwner = await User.findById(owner._id).select('-password');
    res.status(200).json({
      success: true,
      data: updatedOwner,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// DELETE OWNER (SuperAdmin only)
// ============================================================

// @desc    Delete an owner
// @route   DELETE /api/users/owners/:id
// @access  Private (SuperAdmin)
const deleteOwner = async (req, res, next) => {
  try {
    const owner = await User.findOne({ _id: req.params.id, role: 'owner' });
    if (!owner) {
      res.status(404);
      throw new Error('Owner not found');
    }

    // Note: You might want to delete all menu items too, but we keep them for simplicity.
    await owner.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Owner deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllOwners,
  getOwnerById,
  toggleBlockOwner,
  updateOwner,
  deleteOwner,
};