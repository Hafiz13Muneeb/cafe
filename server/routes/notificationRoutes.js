const express = require('express');
const router = express.Router();
const {
  sendNotification,
  getSentNotifications,
  getOwnerNotifications,
  markNotificationRead,
  getUnreadCount,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationController');
const { protect, restrictTo } = require('../middleware/auth');

// ============================================================
// PROTECTED ROUTES – All require authentication
// ============================================================
router.use(protect);

// Owner routes (available to all authenticated users)
router.get('/owner', getOwnerNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', markNotificationRead);
router.patch('/mark-all-read', markAllAsRead);

// SuperAdmin only
router.post('/', restrictTo('superadmin'), sendNotification);
router.get('/', restrictTo('superadmin'), getSentNotifications);
router.delete('/:id', restrictTo('superadmin'), deleteNotification);

module.exports = router; // ✅ CORRECT