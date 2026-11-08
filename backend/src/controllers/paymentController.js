const Transaction = require('../models/Transaction');
const Meter = require('../models/Meter');
const CreditAccount = require('../models/CreditAccount');
const { isApprovedMeterNumber } = require('./meterController');
const User = require('../models/User');
const { processDemoPayment } = require('../services/payment/demoPayment');
const { initializePaystack, verifyPaystack, verifyWebhook } = require('../services/payment/paystackPayment');
const { generateElectricityToken, calculateUnits, generateTransactionRef } = require('../services/tokenService');
const { sendTokenEmail } = require('../services/emailService');
const { MIN_PURCHASE_AMOUNT, MAX_PURCHASE_AMOUNT, isValidPurchaseAmount } = require('../utils/paymentLimits');

const isMatchingPaystackPayment = (payment, transaction) => (
  payment?.status === 'success'
  && payment.reference === transaction.paystackRef
  && payment.amount === Math.round(transaction.amount * 100)
  && payment.currency === 'NGN'
);
exports.isMatchingPaystackPayment = isMatchingPaystackPayment;

const fulfillPaystackTransaction = (transaction) => Transaction.findOneAndUpdate(
  { _id: transaction._id, paymentStatus: 'pending' },
  {
    $set: {
      paymentStatus: 'success',
      token: generateElectricityToken(),
      units: calculateUnits(transaction.amount)
    }
  },
  { new: true, runValidators: true }
);

exports.initializePayment = async (req, res) => {
  try {
    const { meterId } = req.body;
    if (!isValidPurchaseAmount(req.body.amount)) {
      return res.status(400).json({
        message: `Amount must be a whole number between ₦${MIN_PURCHASE_AMOUNT.toLocaleString()} and ₦${MAX_PURCHASE_AMOUNT.toLocaleString()}`
      });
    }
    const amount = Number(req.body.amount);

    const meter = await Meter.findOne({ _id: meterId, user: req.user.id, isActive: true });
    if (!meter) {
      return res.status(404).json({ message: 'Meter not found' });
    }
    if (!await isApprovedMeterNumber(meter.meterNumber)) {
      return res.status(403).json({ message: 'This meter is no longer approved for token purchases' });
    }

    if (req.body.paymentMethod === 'credit') {
      let creditAccount;
      try {
        creditAccount = await CreditAccount.findOneAndUpdate(
          { user: req.user.id, balance: 0 },
          {
            $setOnInsert: { user: req.user.id },
            $inc: { balance: amount }
          },
          { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
        );
      } catch (error) {
        if (error.code === 11000) {
          return res.status(409).json({
            message: 'You must repay your outstanding credit balance before making another credit purchase.'
          });
        }
        throw error;
      }
      if (!creditAccount) {
        return res.status(409).json({
          message: 'You must repay your outstanding credit balance before making another credit purchase.'
        });
      }

      const token = generateElectricityToken();
      const units = calculateUnits(amount);
      const transactionRef = generateTransactionRef();
      let transaction;
      try {
        transaction = await Transaction.create({
          user: req.user.id,
          meter: meterId,
          meterNumber: meter.meterNumber,
          amount,
          units,
          token,
          transactionRef,
          paymentMethod: 'credit',
          paymentStatus: 'success',
          creditStatus: 'unpaid'
        });
      } catch (error) {
        try {
          await CreditAccount.updateOne(
            { user: req.user.id, balance: amount },
            { $set: { balance: 0 } }
          );
        } catch (rollbackError) {
          console.error('Failed to release demo credit after purchase creation failed:', rollbackError);
        }
        throw error;
      }

      await sendTokenEmail(
        req.user.email,
        token,
        amount,
        units,
        meter.meterNumber,
        transactionRef,
        { isCredit: true }
      );

      return res.json({
        status: true,
        message: 'Credit purchase recorded. Repay your balance before buying on credit again.',
        data: {
          transaction,
          token,
          units,
          amount,
          meterNumber: meter.meterNumber,
          reference: transactionRef,
          isDemo: true,
          isCredit: true,
          creditBalance: creditAccount.balance
        }
      });
    }

    const transactionRef = generateTransactionRef();
    const paymentMode = process.env.PAYMENT_MODE || 'demo';

    if (paymentMode === 'demo') {
      const demoResult = await processDemoPayment(amount, req.user.email, { meterId, userId: req.user.id });
      const token = generateElectricityToken();
      const units = calculateUnits(amount);

      const transaction = await Transaction.create({
        user: req.user.id,
        meter: meterId,
        meterNumber: meter.meterNumber,
        amount,
        units,
        token,
        transactionRef,
        paymentMethod: 'demo',
        paymentStatus: 'success',
        paystackRef: demoResult.data.reference
      });

      await sendTokenEmail(req.user.email, token, amount, units, meter.meterNumber, transactionRef);

      return res.json({
        status: true,
        message: 'Simulated payment successful',
        data: {
          transaction,
          token,
          units,
          amount,
          meterNumber: meter.meterNumber,
          reference: transactionRef,
          isDemo: true
        }
      });
    }

    if (paymentMode !== 'paystack') {
      return res.status(500).json({ message: 'Unsupported payment mode. Use simulated or Paystack test checkout.' });
    }

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
    const paystackData = await initializePaystack(amount, req.user.email, `${frontendUrl}/payment/success`, {
      meterId,
      userId: req.user.id,
      transactionRef
    });

    await Transaction.create({
      user: req.user.id,
      meter: meterId,
      meterNumber: meter.meterNumber,
      amount,
      units: 0,
      token: 'PENDING',
      transactionRef,
      paymentMethod: 'paystack',
      paymentStatus: 'pending',
      paystackRef: paystackData.data.reference
    });

    return res.json({
      status: true,
      authorization_url: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
      transactionRef
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    const transaction = await Transaction.findOne({
      $or: [{ transactionRef: reference }, { paystackRef: reference }],
      user: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.paymentStatus === 'success') {
      return res.json({ status: true, transaction });
    }

    if (transaction.paymentMethod !== 'paystack') {
      return res.status(400).json({ status: false, message: 'This simulated payment is not awaiting verification' });
    }

    const verification = await verifyPaystack(transaction.paystackRef);
    const payment = verification?.data;
    if (payment?.status !== 'success') {
      if (['failed', 'abandoned'].includes(payment?.status)) {
        await Transaction.updateOne(
          { _id: transaction._id, paymentStatus: 'pending' },
          { $set: { paymentStatus: 'failed' } }
        );
      }
      return res.status(400).json({ status: false, message: 'Payment has not been completed' });
    }

    if (!isMatchingPaystackPayment(payment, transaction)) {
      await Transaction.updateOne(
        { _id: transaction._id, paymentStatus: 'pending' },
        { $set: { paymentStatus: 'failed' } }
      );
      return res.status(400).json({ status: false, message: 'Payment verification did not match this transaction' });
    }

    const fulfilledTransaction = await fulfillPaystackTransaction(transaction);
    if (fulfilledTransaction) {
      await sendTokenEmail(
        req.user.email,
        fulfilledTransaction.token,
        fulfilledTransaction.amount,
        fulfilledTransaction.units,
        fulfilledTransaction.meterNumber,
        fulfilledTransaction.transactionRef
      );
    }

    const latestTransaction = fulfilledTransaction || await Transaction.findById(transaction._id);
    return res.json({ status: latestTransaction?.paymentStatus === 'success', transaction: latestTransaction });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.webhook = async (req, res) => {
  try {
    if (!verifyWebhook(req.headers['x-paystack-signature'], req.rawBody)) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = JSON.parse(req.rawBody.toString('utf8'));
    if (event.event === 'charge.success') {
      const payment = event.data;
      const transaction = await Transaction.findOne({ paystackRef: payment.reference });
      if (transaction && transaction.paymentStatus === 'pending') {
        if (
          payment.amount !== Math.round(transaction.amount * 100)
          || payment.currency !== 'NGN'
        ) {
          return res.status(400).json({ message: 'Payment amount or currency does not match the transaction' });
        }

        const fulfilledTransaction = await fulfillPaystackTransaction(transaction);
        if (fulfilledTransaction) {
          const user = await User.findById(transaction.user);
          if (user) {
            await sendTokenEmail(
              user.email,
              fulfilledTransaction.token,
              fulfilledTransaction.amount,
              fulfilledTransaction.units,
              fulfilledTransaction.meterNumber,
              fulfilledTransaction.transactionRef
            );
          }
        }
      }
    }

    return res.status(200).send('OK');
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
