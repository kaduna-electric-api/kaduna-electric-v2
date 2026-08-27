const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reference: { type: String, required: true, unique: true },
  category: {
    type: String,
    required: true,
    enum: ['Payment problem', 'Token problem', 'Meter problem', 'Account problem', 'Failed transaction', 'Other']
  },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Under Review', 'Resolved', 'Closed'], default: 'Pending' },
  adminResponse: { type: String },
  respondedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', complaintSchema);
