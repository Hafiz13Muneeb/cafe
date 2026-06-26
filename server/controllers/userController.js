const User = require('../models/User');

// @desc    Get all cafe owners (Super-admin only)
// @route   GET /api/users/owners
// @access  Private (Superadmin)
const getAllOwners = async (req, res, next) => {
  try {
    // Only fetch users with role 'owner', exclude password
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

// @desc    Get a single owner by ID (Super-admin only)
// @route   GET /api/users/owners/:id
// @access  Private (Superadmin)
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

// @desc    Toggle block status of an owner (Super-admin only)
// @route   PUT /api/users/owners/:id/toggle-block
// @access  Private (Superadmin)
const toggleBlockOwner = async (req, res, next) => {
  try {
    const owner = await User.findOne({ _id: req.params.id, role: 'owner' });
    if (!owner) {
      res.status(404);
      throw new Error('Owner not found');
    }

    // Toggle the isBlocked field
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

// @desc    Update owner details (Super-admin only)
// @route   PUT /api/users/owners/:id
// @access  Private (Superadmin)
const updateOwner = async (req, res, next) => {
  try {
    const { cafeName, whatsappNumber, tables, theme, logoUrl, faviconUrl } = req.body;

    const owner = await User.findOne({ _id: req.params.id, role: 'owner' });
    if (!owner) {
      res.status(404);
      throw new Error('Owner not found');
    }

    // Update fields if provided
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
      // Regenerate slug if cafe name changes
      const baseSlug = trimmed
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      let newSlug = baseSlug;
      // Ensure uniqueness, but skip the current owner
      const existing = await User.findOne({ slug: newSlug, _id: { $ne: owner._id } });
      if (existing) {
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        newSlug = `${baseSlug}-${randomSuffix}`;
        // In the rare case it still exists, loop
        while (await User.findOne({ slug: newSlug, _id: { $ne: owner._id } })) {
          newSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;
        }
      }
      owner.slug = newSlug;
    }

    if (whatsappNumber !== undefined) {
      const trimmed = whatsappNumber.trim();
      if (!/^[0-9]{10,15}$/.test(trimmed)) {
        res.status(400);
        throw new Error('WhatsApp number must be 10-15 digits, no special chars');
      }
      owner.whatsappNumber = trimmed;
    }

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
      // Merge with existing theme
      owner.theme = {
        ...owner.theme,
        ...(primaryColor && { primaryColor }),
        ...(secondaryColor && { secondaryColor }),
        ...(mode && { mode }),
      };
    }

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

// @desc    Delete an owner (Super-admin only)
// @route   DELETE /api/users/owners/:id
// @access  Private (Superadmin)
const deleteOwner = async (req, res, next) => {
  try {
    const owner = await User.findOne({ _id: req.params.id, role: 'owner' });
    if (!owner) {
      res.status(404);
      throw new Error('Owner not found');
    }

    // You might want to also delete all their menu items, but we can keep them or cascade.
    // For simplicity, we'll delete the user only.
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