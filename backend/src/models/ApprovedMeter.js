const mongoose = require('mongoose');

const approvedMeterSchema = new mongoose.Schema({
  meterNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  meterType: {
    type: String,
    enum: ['prepaid', 'postpaid'],
    default: 'prepaid'
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  source: {
    type: String,
    default: 'company-api'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ApprovedMeter', approvedMeterSchema);
