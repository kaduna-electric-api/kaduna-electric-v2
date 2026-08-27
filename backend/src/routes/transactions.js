const express = require('express');
const router = express.Router();
const { getHistory, getReceipt, getTransactionById } = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.get('/history', protect, getHistory);
router.get('/:id/receipt', protect, getReceipt);
router.get('/:id', protect, getTransactionById);

module.exports = router;
