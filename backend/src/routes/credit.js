const express = require('express');
const router = express.Router();
const { getCreditAccount, repayCredit } = require('../controllers/creditController');
const { protect } = require('../middleware/auth');

router.get('/account', protect, getCreditAccount);
router.post('/repay', protect, repayCredit);

module.exports = router;
