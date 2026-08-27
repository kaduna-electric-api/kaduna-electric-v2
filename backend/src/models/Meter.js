const mongoose = require('mongoose');

const meterSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  meterNumber: { type: String, required: true, trim: true },
  meterType: { type: String, enum: ['prepaid', 'postpaid'], default: 'prepaid' },
  address: { type: String, trim: true },
  nickname: { type: String, trim: true },
  isVerified: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

meterSchema.index({ user: 1, meterNumber: 1 }, { unique: true });

module.exports = mongoose.model('Meter', meterSchema);
