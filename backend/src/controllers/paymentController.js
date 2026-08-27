const Transaction = require('../models/Transaction');
const Meter = require('../models/Meter');
const { processDemoPayment } = require('../services/payment/demoPayment');
const { initializePaystack, verifyPaystack, verifyWebhook } = require('../services/payment/paystackPayment');
const { generateElectricityToken, calculateUnits, generateTransactionRef } = require('../services/tokenService');
const { sendTokenEmail } = require('../services/emailService');

exports.initializePayment = async (req, res) => {
  try {
    const { meterId, amount } = req.body;
    const meter = await Meter.findOne({ _id: meterId, user: req.user.id });
    if (!meter) {
      return res.status(404).json({ message: 'Meter not found' });
    }
    if (amount < 100) {
      return res.status(400).json({ message: 'Minimum amount is ₦100' });
    }

    const transactionRef = generateTransactionRef();
    const paymentMode = process.env.PAYMENT_MODE || 'demo';

    if (paymentMode === 'demo') {
      // Process demo payment immediately
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
        message: 'Demo payment successful',
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
    } else {
      // Paystack flow
      const callbackUrl = `${process.env.FRONTEND_URL}/payment/callback`;
      const paystackData = await initializePaystack(amount, req.user.email, callbackUrl, {
        meterId,
        userId: req.user.id,
        transactionRef
      });

      // Create pending transaction
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

      res.json({
        status: true,
        authorization_url: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
        transactionRef
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    const transaction = await Transaction.findOne({ transactionRef: reference, user: req.user.id });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.paymentStatus === 'success') {
      return res.json({ status: true, transaction });
    }

    if (process.env.PAYMENT_MODE !== 'demo') {
      const verification = await verifyPaystack(transaction.paystackRef);
      if (verification.data.status === 'success') {
        const token = generateElectricityToken();
        const units = calculateUnits(transaction.amount);

        transaction.paymentStatus = 'success';
        transaction.token = token;
        transaction.units = units;
        await transaction.save();

        await sendTokenEmail(req.user.email, token, transaction.amount, units, transaction.meterNumber, reference);
      } else {
        transaction.paymentStatus = 'failed';
        await transaction.save();
        return res.status(400).json({ status: false, message: 'Payment verification failed' });
      }
    }

    res.json({ status: true, transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.webhook = async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    if (!verifyWebhook(signature, req.body)) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = req.body;
    if (event.event === 'charge.success') {
      const transaction = await Transaction.findOne({ paystackRef: event.data.reference });
      if (transaction && transaction.paymentStatus === 'pending') {
        const token = generateElectricityToken();
        const units = calculateUnits(transaction.amount);

        transaction.paymentStatus = 'success';
        transaction.token = token;
        transaction.units = units;
        await transaction.save();

        const user = await require('../models/User').findById(transaction.user);
        await sendTokenEmail(user.email, token, transaction.amount, units, transaction.meterNumber, transaction.transactionRef);
      }
    }
    res.status(200).send('OK');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
