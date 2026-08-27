const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  meter: { type: mongoose.Schema.Types.ObjectId, ref: 'Meter', required: true },
  meterNumber: { type: String, required: true },
  amount: { type: Number, required: true, min: 100 },
  units: { type: Number, required: true },
  token: { type: String, required: true, unique: true },
  transactionRef: { type: String, required: true, unique: true },
  paymentMethod: { type: String, enum: ['demo', 'paystack', 'card', 'transfer'], default: 'demo' },
  paymentStatus: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  paystackRef: { type: String },
  receiptUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
