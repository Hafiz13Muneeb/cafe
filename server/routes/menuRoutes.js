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
const subscriptionGuard = require('../middleware/subscriptionGuard');
const { uploadSingle } = require('../middleware/upload');

// Public route – get menu by cafe slug
router.get('/:slug', getPublicMenu);

// All routes below are protected (owner only)
router.use(protect);

// Get owner's menu items (with filters) – free users can view
router.get('/', getMenuItems);

// Create a new menu item (with image upload) – requires paid subscription
router.post('/', subscriptionGuard('paid'), uploadSingle, createMenuItem);

// Update a menu item (with optional image upload) – requires paid subscription
router.put('/:id', subscriptionGuard('paid'), uploadSingle, updateMenuItem);

// Delete a menu item – requires paid subscription
router.delete('/:id', subscriptionGuard('paid'), deleteMenuItem);

module.exports = router;