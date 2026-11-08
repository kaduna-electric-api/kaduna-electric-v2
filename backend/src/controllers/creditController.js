const CreditAccount = require('../models/CreditAccount');
const Transaction = require('../models/Transaction');
const { MAX_PURCHASE_AMOUNT } = require('../utils/paymentLimits');
const { generateTransactionRef } = require('../services/tokenService');

exports.getCreditAccount = async (req, res) => {
  try {
    const account = await CreditAccount.findOne({ user: req.user.id });
    const balance = account?.balance || 0;

    res.json({
      balance,
      maxCredit: MAX_PURCHASE_AMOUNT,
      canPurchaseOnCredit: balance === 0,
      repayments: account?.repayments || []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.repayCredit = async (req, res) => {
  try {
    const account = await CreditAccount.findOne({ user: req.user.id });
    if (!account || account.balance <= 0) {
      return res.status(400).json({ message: 'There is no outstanding credit balance to repay.' });
    }

    const amount = account.balance;
    const paidAt = new Date();
    const reference = `CRP-${generateTransactionRef()}`;
    const updatedAccount = await CreditAccount.findOneAndUpdate(
      { user: req.user.id, balance: amount },
      {
        $set: { balance: 0 },
        $push: { repayments: { amount, reference, paidAt } }
      },
      { new: true, runValidators: true }
    );

    if (!updatedAccount) {
      return res.status(409).json({ message: 'Your credit balance changed. Refresh and try again.' });
    }

    await Transaction.updateMany(
      { user: req.user.id, paymentMethod: 'credit', creditStatus: 'unpaid' },
      { $set: { creditStatus: 'paid' } }
    );

    res.json({
      message: 'Simulated repayment recorded. Your credit balance is now clear.',
      repayment: { amount, reference, paidAt, simulated: true },
      balance: updatedAccount.balance,
      canPurchaseOnCredit: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
