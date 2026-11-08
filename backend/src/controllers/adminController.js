const User = require('../models/User');
const Meter = require('../models/Meter');
const ApprovedMeter = require('../models/ApprovedMeter');
const Transaction = require('../models/Transaction');
const CreditAccount = require('../models/CreditAccount');
const Complaint = require('../models/Complaint');
const { normalizeMeterNumber, isValidMeterNumber } = require('../utils/meterNumber');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalTransactions = await Transaction.countDocuments();
    const successfulPayments = await Transaction.countDocuments({
      paymentStatus: 'success',
      paymentMethod: { $ne: 'credit' }
    });
    const totalRevenue = await Transaction.aggregate([
      { $match: { paymentStatus: 'success', paymentMethod: { $ne: 'credit' } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const outstandingCredit = await CreditAccount.aggregate([
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ]);
    const pendingComplaints = await Complaint.countDocuments({ status: 'Pending' });
    const newUsersThisMonth = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: new Date(new Date().setDate(1)) }
    });

    // Revenue by day (last 7 days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const revenueByDay = await Transaction.aggregate([
      { $match: { paymentStatus: 'success', paymentMethod: { $ne: 'credit' }, createdAt: { $gte: last7Days } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Transactions by status
    const transactionsByStatus = await Transaction.aggregate([
      { $match: { paymentMethod: { $ne: 'credit' } } },
      { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
    ]);

    res.json({
      stats: {
        totalCustomers,
        totalTransactions,
        successfulPayments,
        totalRevenue: totalRevenue[0]?.total || 0,
        outstandingCredit: outstandingCredit[0]?.total || 0,
        pendingComplaints,
        newUsersThisMonth
      },
      revenueByDay,
      transactionsByStatus
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { role: 'customer' };
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await User.countDocuments(query);
    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.paymentStatus = status;
    if (search) {
      query.$or = [
        { transactionRef: { $regex: search, $options: 'i' } },
        { meterNumber: { $regex: search, $options: 'i' } }
      ];
    }
    const transactions = await Transaction.find(query)
      .populate('user', 'firstName lastName email')
      .populate('meter', 'nickname')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Transaction.countDocuments(query);
    res.json({ transactions, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllMeters = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { isActive: true };
    if (search) query.meterNumber = { $regex: search, $options: 'i' };

    const meters = await Meter.find(query)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Meter.countDocuments(query);
    res.json({ meters, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getApprovedMeters = async (req, res) => {
  try {
    const meters = await ApprovedMeter.find().sort({ createdAt: -1 });
    res.json(meters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addApprovedMeter = async (req, res) => {
  try {
    const { meterNumber, meterType, address, source, isActive } = req.body;
    const normalizedMeterNumber = normalizeMeterNumber(meterNumber);

    if (!normalizedMeterNumber) {
      return res.status(400).json({ message: 'Meter number is required' });
    }
    if (!isValidMeterNumber(normalizedMeterNumber)) {
      return res.status(400).json({ message: 'Enter a valid 11 to 13 digit meter number' });
    }

    const approvedMeter = await ApprovedMeter.create({
      meterNumber: normalizedMeterNumber,
      meterType: meterType || 'prepaid',
      address: address || '',
      source: source || 'company-api',
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    res.status(201).json(approvedMeter);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This meter number already exists in the company registry' });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.updateApprovedMeter = async (req, res) => {
  try {
    const { meterNumber, meterType, address, source, isActive } = req.body;
    const approvedMeter = await ApprovedMeter.findById(req.params.id);

    if (!approvedMeter) {
      return res.status(404).json({ message: 'Approved meter not found' });
    }

    if (meterNumber !== undefined) {
      const normalizedMeterNumber = normalizeMeterNumber(meterNumber);
      if (!isValidMeterNumber(normalizedMeterNumber)) {
        return res.status(400).json({ message: 'Enter a valid 11 to 13 digit meter number' });
      }
      approvedMeter.meterNumber = normalizedMeterNumber;
    }
    if (meterType) approvedMeter.meterType = meterType;
    if (address !== undefined) approvedMeter.address = address;
    if (source) approvedMeter.source = source;
    if (isActive !== undefined) approvedMeter.isActive = isActive;

    approvedMeter.updatedBy = req.user.id;
    await approvedMeter.save();

    res.json(approvedMeter);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This meter number already exists in the company registry' });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.deleteApprovedMeter = async (req, res) => {
  try {
    const approvedMeter = await ApprovedMeter.findByIdAndDelete(req.params.id);
    if (!approvedMeter) {
      return res.status(404).json({ message: 'Approved meter not found' });
    }
    res.json({ message: 'Approved meter removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
