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

// ============================================================
// ALL ROUTES ARE SUPER-ADMIN ONLY
// ============================================================
router.use(protect, restrictTo('superadmin'));

// -----------------------------------------------------------------
// 1. GET ALL CAFE OWNERS
// -----------------------------------------------------------------
router.get('/owners', getAllOwners);

// -----------------------------------------------------------------
// 2. GET SINGLE OWNER BY ID
// -----------------------------------------------------------------
router.get('/owners/:id', getOwnerById);

// -----------------------------------------------------------------
// 3. TOGGLE BLOCK STATUS
// -----------------------------------------------------------------
router.put('/owners/:id/toggle-block', toggleBlockOwner);

// -----------------------------------------------------------------
// 4. UPDATE OWNER DETAILS (cafeName, whatsapp, tables, theme, currency, etc.)
// -----------------------------------------------------------------
router.put('/owners/:id', updateOwner);

// -----------------------------------------------------------------
// 5. DELETE AN OWNER
// -----------------------------------------------------------------
router.delete('/owners/:id', deleteOwner);

module.exports = router;