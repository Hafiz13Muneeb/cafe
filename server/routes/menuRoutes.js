const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getPublicMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');
const { protect } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// Public route – get menu by cafe slug
router.get('/:slug', getPublicMenu);

// All routes below are protected (owner only)
router.use(protect);

// Get owner's menu items (with filters)
router.get('/', getMenuItems);

// Create a new menu item (with image upload)
router.post('/', uploadSingle, createMenuItem);

// Update a menu item (with optional image upload)
router.put('/:id', uploadSingle, updateMenuItem);

// Delete a menu item
router.delete('/:id', deleteMenuItem);

module.exports = router;