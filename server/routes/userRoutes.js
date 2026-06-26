const express = require('express');
const router = express.Router();
const {
  getAllOwners,
  getOwnerById,
  toggleBlockOwner,
  updateOwner,
  deleteOwner,
} = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');

// All routes in this file are super-admin only
router.use(protect, restrictTo('superadmin'));

// Get all cafe owners
router.get('/owners', getAllOwners);

// Get a single owner by ID
router.get('/owners/:id', getOwnerById);

// Toggle block status of an owner
router.put('/owners/:id/toggle-block', toggleBlockOwner);

// Update owner details (cafeName, whatsapp, tables, theme, etc.)
router.put('/owners/:id', updateOwner);

// Delete an owner
router.delete('/owners/:id', deleteOwner);

module.exports = router;