// routes/menuRoutes.js - Menu item routes
const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');
const { protect } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// Public route - Get all menu items (with optional category filter)
router.get('/', getMenuItems);

// Protected routes - Admin only
router.post('/', protect, uploadSingle, createMenuItem);
router.put('/:id', protect, uploadSingle, updateMenuItem);
router.delete('/:id', protect, deleteMenuItem);

module.exports = router;