const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const {
  getDashboardStats,
  getAllUsers,
  getAllTransactions,
  getAllMeters,
  getApprovedMeters,
  addApprovedMeter,
  updateApprovedMeter,
  deleteApprovedMeter,
  toggleUserStatus
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/dashboard', protect, adminOnly, getDashboardStats);
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/transactions', protect, adminOnly, getAllTransactions);
router.get('/meters', protect, adminOnly, getAllMeters);
router.get('/approved-meters', protect, adminOnly, getApprovedMeters);
router.post('/approved-meters', protect, adminOnly, validate([
  body('meterNumber').trim().matches(/^\d{11,13}$/).withMessage('Enter a valid 11 to 13 digit meter number'),
  body('meterType').optional().isIn(['prepaid', 'postpaid']),
  body('address').optional().isString(),
  body('source').optional().isString(),
  body('isActive').optional().isBoolean().toBoolean()
]), addApprovedMeter);
router.put('/approved-meters/:id', protect, adminOnly, validate([
  param('id').isMongoId(),
  body('meterNumber').optional().trim().matches(/^\d{11,13}$/).withMessage('Enter a valid 11 to 13 digit meter number'),
  body('meterType').optional().isIn(['prepaid', 'postpaid']),
  body('address').optional().isString(),
  body('source').optional().isString(),
  body('isActive').optional().isBoolean().toBoolean()
]), updateApprovedMeter);
router.delete('/approved-meters/:id', protect, adminOnly, validate([
  param('id').isMongoId()
]), deleteApprovedMeter);
router.put('/users/:id/toggle', protect, adminOnly, toggleUserStatus);

module.exports = router;
