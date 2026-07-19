// server/controllers/menuController.js
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

// ============================================================
// PROTECTED ROUTES (Owner only)
// ============================================================

// @desc    Get menu items for the logged-in owner
// @route   GET /api/menu
// @access  Private (Owner)
const getMenuItems = async (req, res, next) => {
  try {
    const { category, all, page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const filter = { ownerId: req.user.id };
    if (all !== 'true') filter.isAvailable = true;
    if (category && category !== 'all') filter.category = category;

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

// ============================================================
// PUBLIC ROUTE – get menu by cafe slug (with fallback creation)
// ============================================================

// @desc    Get public menu – smart fallback: find cafe that has items, or create default
// @route   GET /api/menu/:slug
// @access  Public
const getPublicMenu = async (req, res, next) => {
  try {
    const { slug } = req.params;

    let cafe = null;

    // 1. Try to find by slug
    cafe = await User.findOne({ slug }).select(
      'cafeName whatsappNumber logoUrl faviconUrl tables theme'
    );

    // 2. If not found by slug, get the first user that has menu items
    if (!cafe) {
      const anyItem = await MenuItem.findOne().select('ownerId');
      if (anyItem) {
        cafe = await User.findById(anyItem.ownerId).select(
          'cafeName whatsappNumber logoUrl faviconUrl tables theme'
        );
      }
    }

    // 3. If still no cafe, fallback to the first user in DB
    if (!cafe) {
      cafe = await User.findOne().select(
        'cafeName whatsappNumber logoUrl faviconUrl tables theme'
      );
    }

    // 4. If no cafe at all, create one with default settings (ensures the app never 404s)
    if (!cafe) {
      console.warn('⚠️ No cafe found in database. Creating a default one...');
      try {
        const defaultCafe = await User.create({
          username: process.env.OWNER_USERNAME || 'admin',
          password: process.env.OWNER_PASSWORD || 'admin123',
          cafeName: process.env.CAFE_NAME || 'My Cafe',
          slug: 'cafe',
          whatsappNumber: process.env.WHATSAPP_NUMBER || '03001234567',
          tables: ['1', '2', '3', '4', '5'],
          logoUrl: '',
          faviconUrl: '',
          theme: {
            primaryColor: '#d4a843',
            secondaryColor: '#b8860b',
            mode: 'light',
          },
        });
        cafe = defaultCafe;
        console.log('✅ Default cafe created with slug "cafe".');
      } catch (createError) {
        console.error('❌ Failed to create default cafe:', createError.message);
        res.status(500);
        throw new Error('Unable to initialize cafe data. Please check server configuration.');
      }
    }

    // Fetch ALL menu items for this cafe (ignore availability)
    const menuItems = await MenuItem.find({
      ownerId: cafe._id,
    }).sort({ createdAt: -1 });

    const categories = [...new Set(menuItems.map(item => item.category))];

    res.status(200).json({
      success: true,
      data: {
        cafe: {
          id: cafe._id,
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

// ============================================================
// CRUD OPERATIONS (Owner only)
// ============================================================

// @desc    Create a new menu item
// @route   POST /api/menu
// @access  Private (Owner)
const createMenuItem = async (req, res, next) => {
  try {
    let { title, description, price, category, isAvailable } = req.body;

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

    if (!req.file) {
      res.status(400);
      throw new Error('Please upload an image');
    }

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
      ownerId: req.user.id,
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

// @desc    Update a menu item
// @route   PUT /api/menu/:id
// @access  Private (Owner)
const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { title, description, price, category, isAvailable } = req.body;

    const menuItem = await MenuItem.findOne({ _id: id, ownerId: req.user.id });
    if (!menuItem) {
      res.status(404);
      throw new Error('Menu item not found or you do not have permission');
    }

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

    if (req.file) {
      if (menuItem.imageUrl) {
        const publicId = extractPublicId(menuItem.imageUrl);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.error('Failed to delete old image:', err);
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

// @desc    Delete a menu item
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

    if (menuItem.imageUrl) {
      const publicId = extractPublicId(menuItem.imageUrl);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error('Failed to delete image:', err);
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