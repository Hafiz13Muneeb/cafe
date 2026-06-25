// controllers/menuController.js - CRUD operations for menu items
const MenuItem = require('../models/MenuItem');
const cloudinary = require('../config/cloudinary');

// Helper: extract Cloudinary public_id from URL
const extractPublicId = (imageUrl) => {
  if (!imageUrl) return null;
  // Example: https://res.cloudinary.com/.../cafe-menu-items/abc123.jpg
  const parts = imageUrl.split('/');
  const filename = parts[parts.length - 1];
  const publicId = filename.split('.')[0];
  // Prepend folder if needed (we use folder 'cafe-menu-items')
  // Since our storage uses folder, the URL contains the folder in path, but we need full public_id.
  // Better: we can extract from URL by removing the base part.
  // Simpler: we store the public_id in the DB? Not currently, so we reconstruct:
  // The public_id is the path without the extension and without the base domain.
  // The URL format: https://res.cloudinary.com/<cloud>/image/upload/v.../<folder>/<name>.<ext>
  // So we can split by '/upload/' and take the part after.
  const uploadIndex = imageUrl.indexOf('/upload/');
  if (uploadIndex === -1) return null;
  const afterUpload = imageUrl.substring(uploadIndex + 8); // after '/upload/'
  // Remove version prefix if present (v1234567/)
  const parts2 = afterUpload.split('/');
  if (parts2[0].startsWith('v')) {
    parts2.shift();
  }
  const publicIdWithExt = parts2.join('/');
  // Remove extension
  return publicIdWithExt.replace(/\.[^/.]+$/, '');
};

// @desc    Get all menu items (public or admin) with pagination
// @route   GET /api/menu
// @access  Public (customer) or Private (admin with ?all=true)
const getMenuItems = async (req, res, next) => {
  try {
    const { category, all, page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    let filter = {};

    // If 'all' is not 'true', only show available items (for customers)
    if (all !== 'true') {
      filter.isAvailable = true;
    }

    // If category filter is provided and not 'all'
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

// @desc    Add a new menu item (protected)
// @route   POST /api/menu
// @access  Private
const createMenuItem = async (req, res, next) => {
  try {
    let { title, description, price, category, isAvailable } = req.body;

    // Validate required fields
    if (!title || !price || !category) {
      res.status(400);
      throw new Error('Title, price, and category are required');
    }

    // Validate price is a number
    if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      res.status(400);
      throw new Error('Price must be a positive number');
    }
    price = parseFloat(price);

    // Validate title length
    if (title.length > 100) {
      res.status(400);
      throw new Error('Title must be 100 characters or less');
    }

    // Validate category length
    if (category.length > 50) {
      res.status(400);
      throw new Error('Category must be 50 characters or less');
    }

    // Check if image was uploaded
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload an image');
    }

    // Parse isAvailable (could be string from FormData)
    let available = true;
    if (isAvailable !== undefined) {
      if (typeof isAvailable === 'string') {
        available = isAvailable === 'true' || isAvailable === '1';
      } else {
        available = Boolean(isAvailable);
      }
    }

    // The image URL is provided by Cloudinary via multer-storage-cloudinary
    const imageUrl = req.file.path;

    const menuItem = await MenuItem.create({
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

// @desc    Update a menu item (protected)
// @route   PUT /api/menu/:id
// @access  Private
const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { title, description, price, category, isAvailable } = req.body;

    // Find the item
    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      res.status(404);
      throw new Error('Menu item not found');
    }

    // Validate fields if provided
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
            // Continue anyway – the new image will be set
          }
        }
      }
      // Set new image URL
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

// @desc    Delete a menu item (protected)
// @route   DELETE /api/menu/:id
// @access  Private
const deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findById(id);

    if (!menuItem) {
      res.status(404);
      throw new Error('Menu item not found');
    }

    // Delete image from Cloudinary (with error handling)
    if (menuItem.imageUrl) {
      const publicId = extractPublicId(menuItem.imageUrl);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudinaryError) {
          console.error('Failed to delete image from Cloudinary:', cloudinaryError);
          // Continue with deletion of the database record
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
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};