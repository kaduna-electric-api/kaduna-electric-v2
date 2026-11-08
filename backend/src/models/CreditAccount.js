const mongoose = require('mongoose');
const { MAX_PURCHASE_AMOUNT } = require('../utils/paymentLimits');

const repaymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 1 },
  reference: { type: String, required: true },
  paidAt: { type: Date, default: Date.now }
}, { _id: false });

const creditAccountSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  balance: { type: Number, default: 0, min: 0, max: MAX_PURCHASE_AMOUNT },
  repayments: { type: [repaymentSchema], default: [] }
});

module.exports = mongoose.model('CreditAccount', creditAccountSchema);
