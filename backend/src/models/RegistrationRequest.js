const mongoose = require('mongoose');
const crypto = require('crypto');

const registrationRequestSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  userData: {
    type: Object,
    required: true
  },
  otpHash: {
    type: String,
    required: true
  },
  otpExpires: {
    type: Date,
    required: true
  },
  attemptCount: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 5
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  resendCooldownUntil: {
    type: Date,
    default: Date.now
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

registrationRequestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

registrationRequestSchema.methods.matchesOTP = function(otp) {
  const hash = crypto.createHash('sha256').update(String(otp)).digest('hex');
  return hash === this.otpHash;
};

registrationRequestSchema.methods.isExpired = function() {
  return new Date(this.otpExpires) < new Date();
};

module.exports = mongoose.model('RegistrationRequest', registrationRequestSchema);
