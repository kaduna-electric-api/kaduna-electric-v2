const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, getAllTransactions, getAllMeters, toggleUserStatus } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/dashboard', protect, adminOnly, getDashboardStats);
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/transactions', protect, adminOnly, getAllTransactions);
router.get('/meters', protect, adminOnly, getAllMeters);
router.put('/users/:id/toggle', protect, adminOnly, toggleUserStatus);

module.exports = router;
