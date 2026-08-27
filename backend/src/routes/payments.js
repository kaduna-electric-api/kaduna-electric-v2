const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { initializePayment, verifyPayment, webhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post('/initialize', protect, validate([
  body('meterId').notEmpty().withMessage('Meter ID is required'),
  body('amount').isFloat({ min: 100 }).withMessage('Amount must be at least ₦100')
]), initializePayment);

router.get('/verify/:reference', protect, verifyPayment);
router.post('/webhook', express.raw({ type: 'application/json' }), webhook);

module.exports = router;
