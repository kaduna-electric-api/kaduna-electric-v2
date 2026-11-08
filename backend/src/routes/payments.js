const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { initializePayment, verifyPayment, webhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { MIN_PURCHASE_AMOUNT, MAX_PURCHASE_AMOUNT } = require('../utils/paymentLimits');

router.post('/initialize', protect, validate([
  body('meterId').notEmpty().withMessage('Meter ID is required'),
  body('paymentMethod').optional().isIn(['demo', 'paystack', 'credit']),
  body('amount')
    .isInt({ min: MIN_PURCHASE_AMOUNT, max: MAX_PURCHASE_AMOUNT })
    .withMessage(`Amount must be a whole number between ₦${MIN_PURCHASE_AMOUNT.toLocaleString()} and ₦${MAX_PURCHASE_AMOUNT.toLocaleString()}`)
    .toInt()
]), initializePayment);

router.get('/verify/:reference', protect, verifyPayment);
router.post('/webhook', webhook);

module.exports = router;
