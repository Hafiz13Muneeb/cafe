// server/routes/faqRoutes.js - FAQ routes
const express = require('express');
const router = express.Router();
const {
  getFAQs,
  getAllFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
} = require('../controllers/faqController');
const { protect } = require('../middleware/auth');

// ============================================================
// PUBLIC ROUTES
// ============================================================
// Get active FAQs (customers)
router.get('/', getFAQs);

// ============================================================
// PROTECTED ROUTES (Owner only)
// ============================================================
router.use(protect);

// Get all FAQs (includes inactive)
router.get('/all', getAllFAQs);

// Create a new FAQ
router.post('/', createFAQ);

// Update an FAQ
router.put('/:id', updateFAQ);

// Delete an FAQ
router.delete('/:id', deleteFAQ);

module.exports = router;