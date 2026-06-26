const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
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

// @desc    Get menu items for the logged-in owner (admin dashboard)
// @route   GET /api/menu
// @access  Private (Owner)
const getMenuItems = async (req, res, next) => {
  try {
    const { category, all, page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    // Base filter: only items belonging to this owner
    const filter = { ownerId: req.user.id };

    // If 'all' is not 'true', only show available items
    if (all !== 'true') {
      filter.isAvailable = true;
    }

    // Category filter
    if (category && category !== 'all') {
      filter.category = category;
    }

    const [menuItems, totalCount] = await Promise.all([
      MenuItem.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      MenuItem.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: menuItems.length,
      total: totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      data: menuItems,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public menu for a specific cafe (by slug)
// @route   GET /api/menu/:slug
// @access  Public
const getPublicMenu = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Find the cafe owner by slug
    const cafe = await User.findOne({ slug, role: 'owner' }).select(
      'cafeName whatsappNumber logoUrl faviconUrl tables theme isBlocked'
    );

    if (!cafe) {
      res.status(404);
      throw new Error('Cafe not found');
    }

    // If the cafe is blocked, return 403
    if (cafe.isBlocked) {
      res.status(403);
      throw new Error('This cafe is currently unavailable');
    }

    // Fetch all available menu items for this cafe
    const menuItems = await MenuItem.find({
      ownerId: cafe._id,
      isAvailable: true,
    }).sort({ createdAt: -1 });

    // Extract categories for filtering (optional, but useful for frontend)
    const categories = [...new Set(menuItems.map(item => item.category))];

    res.status(200).json({
      success: true,
      data: {
        cafe: {
          name: cafe.cafeName,
          whatsappNumber: cafe.whatsappNumber,
          logoUrl: cafe.logoUrl || '',
          faviconUrl: cafe.faviconUrl || '',
          tables: cafe.tables || [],
          theme: cafe.theme || { primaryColor: '#d4a843', secondaryColor: '#b8860b', mode: 'light' },
        },
        menu: menuItems,
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new menu item (for the logged-in owner)
// @route   POST /api/menu
// @access  Private (Owner)
const createMenuItem = async (req, res, next) => {
  try {
    let { title, description, price, category, isAvailable } = req.body;

    // Validate required fields
    if (!title || !price || !category) {
      res.status(400);
      throw new Error('Title, price, and category are required');
    }

    if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      res.status(400);
      throw new Error('Price must be a positive number');
    }
    price = parseFloat(price);

    if (title.length > 100) {
      res.status(400);
      throw new Error('Title must be 100 characters or less');
    }
    if (category.length > 50) {
      res.status(400);
      throw new Error('Category must be 50 characters or less');
    }

    // Check if image was uploaded
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload an image');
    }

    // Parse isAvailable
    let available = true;
    if (isAvailable !== undefined) {
      if (typeof isAvailable === 'string') {
        available = isAvailable === 'true' || isAvailable === '1';
      } else {
        available = Boolean(isAvailable);
      }
    }

    const imageUrl = req.file.path;

    const menuItem = await MenuItem.create({
      ownerId: req.user.id, // 🔐 Multi-tenant: associate with logged-in owner
      title: title.trim(),
      description: description ? description.trim() : '',
      price,
      category: category.trim(),
      imageUrl,
      isAvailable: available,
    });

    res.status(201).json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a menu item (owner can only update their own items)
// @route   PUT /api/menu/:id
// @access  Private (Owner)
const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { title, description, price, category, isAvailable } = req.body;

    // Find the item and ensure it belongs to the logged-in owner
    const menuItem = await MenuItem.findOne({ _id: id, ownerId: req.user.id });

    if (!menuItem) {
      res.status(404);
      throw new Error('Menu item not found or you do not have permission');
    }

    // Update fields if provided (with validation)
    if (title !== undefined) {
      if (title.length > 100) {
        res.status(400);
        throw new Error('Title must be 100 characters or less');
      }
      menuItem.title = title.trim();
    }
    if (description !== undefined) {
      menuItem.description = description.trim();
    }
    if (price !== undefined) {
      if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
        res.status(400);
        throw new Error('Price must be a positive number');
      }
      menuItem.price = parseFloat(price);
    }
    if (category !== undefined) {
      if (category.length > 50) {
        res.status(400);
        throw new Error('Category must be 50 characters or less');
      }
      menuItem.category = category.trim();
    }
    if (isAvailable !== undefined) {
      if (typeof isAvailable === 'string') {
        menuItem.isAvailable = isAvailable === 'true' || isAvailable === '1';
      } else {
        menuItem.isAvailable = Boolean(isAvailable);
      }
    }

    // If a new image is uploaded, replace the old one
    if (req.file) {
      // Delete old image from Cloudinary (with error handling)
      if (menuItem.imageUrl) {
        const publicId = extractPublicId(menuItem.imageUrl);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (cloudinaryError) {
            console.error('Failed to delete old image from Cloudinary:', cloudinaryError);
          }
        }
      }
      menuItem.imageUrl = req.file.path;
    }

    await menuItem.save();

    res.status(200).json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a menu item (owner can only delete their own items)
// @route   DELETE /api/menu/:id
// @access  Private (Owner)
const deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findOne({ _id: id, ownerId: req.user.id });

    if (!menuItem) {
      res.status(404);
      throw new Error('Menu item not found or you do not have permission');
    }

    // Delete image from Cloudinary
    if (menuItem.imageUrl) {
      const publicId = extractPublicId(menuItem.imageUrl);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudinaryError) {
          console.error('Failed to delete image from Cloudinary:', cloudinaryError);
        }
      }
    }

    await menuItem.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMenuItems,
  getPublicMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};