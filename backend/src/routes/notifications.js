const express = require('express');
const router = express.Router();
const {
  getNotifications,
  createNotification,
  markNotificationRead,
} = require('../controllers/notificationController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getNotifications);
router.post('/', protect, adminOnly, createNotification);
router.patch('/:id/read', protect, markNotificationRead);

module.exports = router;
