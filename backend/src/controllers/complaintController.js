const Complaint = require('../models/Complaint');
const { sendComplaintResponseEmail } = require('../services/emailService');

const generateComplaintRef = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(10000 + Math.random() * 90000);
  return `CMP-${dateStr}-${random}`;
};

exports.createComplaint = async (req, res) => {
  try {
    const { category, subject, description } = req.body;
    const reference = generateComplaintRef();

    const complaint = await Complaint.create({
      user: req.user.id,
      reference,
      category,
      subject,
      description
    });

    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin complaint functions
exports.getAllComplaints = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const complaints = await Complaint.find(query)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(query);
    res.json({ complaints, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.respondToComplaint = async (req, res) => {
  try {
    const { adminResponse, status } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { 
        adminResponse, 
        status: status || 'Resolved',
        respondedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    ).populate('user', 'email');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    await sendComplaintResponseEmail(complaint.user.email, complaint.reference, adminResponse);
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
