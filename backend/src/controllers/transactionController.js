const Transaction = require('../models/Transaction');
const PDFDocument = require('pdfkit');
const { generateReceipt } = require('../utils/receiptGenerator');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.getHistory = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;
    const query = { user: req.user.id };
    const { search, status } = req.query;

    if (typeof search === 'string' && search.trim()) {
      if (search.trim().length > 100) {
        return res.status(400).json({ message: 'Search must be 100 characters or fewer.' });
      }
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { meterNumber: { $regex: escapedSearch, $options: 'i' } },
        { transactionRef: { $regex: escapedSearch, $options: 'i' } }
      ];
    }

    if (status && status !== 'all') {
      if (['success', 'pending', 'failed'].includes(status)) {
        query.paymentStatus = status;
        if (status === 'success') query.paymentMethod = { $ne: 'credit' };
      } else if (status === 'credit-due' || status === 'credit-paid') {
        query.paymentMethod = 'credit';
        query.creditStatus = status === 'credit-due' ? 'unpaid' : 'paid';
      } else {
        return res.status(400).json({ message: 'Unsupported transaction status filter.' });
      }
    }

    const [transactions, total, summary] = await Promise.all([
      Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('meter', 'nickname address'),
      Transaction.countDocuments(query),
      Transaction.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            totalSpent: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$paymentStatus', 'success'] },
                      { $ne: ['$paymentMethod', 'credit'] }
                    ]
                  },
                  '$amount',
                  0
                ]
              }
            }
          }
        }
      ])
    ]);

    res.json({
      transactions,
      summary: {
        totalTransactions: summary[0]?.totalTransactions || 0,
        totalSpent: summary[0]?.totalSpent || 0
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReceipt = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('user', 'firstName lastName email phone');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${transaction.transactionRef}.pdf`);

    doc.pipe(res);
    generateReceipt(doc, transaction, transaction.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('meter', 'nickname address');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
