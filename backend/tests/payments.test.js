const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { MAX_PURCHASE_AMOUNT, MIN_PURCHASE_AMOUNT, isValidPurchaseAmount } = require('../src/utils/paymentLimits');
const { getPaystackSecretKey, verifyWebhook } = require('../src/services/payment/paystackPayment');
const paymentController = require('../src/controllers/paymentController');
const { isMatchingPaystackPayment } = paymentController;
const Meter = require('../src/models/Meter');
const ApprovedMeter = require('../src/models/ApprovedMeter');

test('purchase amount accepts the inclusive demo limit', () => {
  assert.equal(MIN_PURCHASE_AMOUNT, 100);
  assert.equal(MAX_PURCHASE_AMOUNT, 10000);
  assert.equal(isValidPurchaseAmount(100), true);
  assert.equal(isValidPurchaseAmount('10000'), true);
});

test('purchase amount rejects values outside the limit and non-integer input', () => {
  for (const amount of [99, 10001, 10000.5, '100.5', '1e3', '-100', '', null]) {
    assert.equal(isValidPurchaseAmount(amount), false, `Expected ${String(amount)} to be rejected`);
  }
});

test('Paystack webhook verification signs the exact raw request body and accepts test keys only', () => {
  const originalSecret = process.env.PAYSTACK_SECRET_KEY;
  const secret = 'sk_test_local_unit_test_key';
  const rawBody = Buffer.from('{"event":"charge.success"}');
  const signature = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');

  try {
    process.env.PAYSTACK_SECRET_KEY = secret;
    assert.equal(verifyWebhook(signature, rawBody), true);
    assert.equal(verifyWebhook(signature, Buffer.from(`${rawBody.toString()} `)), false);

    process.env.PAYSTACK_SECRET_KEY = 'sk_live_disabled_for_demo';
    assert.equal(verifyWebhook(signature, rawBody), false);
  } finally {
    if (originalSecret === undefined) delete process.env.PAYSTACK_SECRET_KEY;
    else process.env.PAYSTACK_SECRET_KEY = originalSecret;
  }
});

test('Paystack configuration refuses live secret keys', () => {
  const originalSecret = process.env.PAYSTACK_SECRET_KEY;
  try {
    process.env.PAYSTACK_SECRET_KEY = 'sk_live_disabled_for_demo';
    assert.throws(() => getPaystackSecretKey(), /Live keys are disabled/);
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_local_unit_test_key';
    assert.equal(getPaystackSecretKey(), 'sk_test_local_unit_test_key');
  } finally {
    if (originalSecret === undefined) delete process.env.PAYSTACK_SECRET_KEY;
    else process.env.PAYSTACK_SECRET_KEY = originalSecret;
  }
});

test('Paystack verification must match status, provider reference, amount, and currency', () => {
  const transaction = { paystackRef: 'ref-demo-123', amount: 10000 };
  const payment = { status: 'success', reference: 'ref-demo-123', amount: 1000000, currency: 'NGN' };

  assert.equal(isMatchingPaystackPayment(payment, transaction), true);
  assert.equal(isMatchingPaystackPayment({ ...payment, amount: 1000001 }, transaction), false);
  assert.equal(isMatchingPaystackPayment({ ...payment, currency: 'USD' }, transaction), false);
  assert.equal(isMatchingPaystackPayment({ ...payment, reference: 'another-ref' }, transaction), false);
  assert.equal(isMatchingPaystackPayment({ ...payment, status: 'failed' }, transaction), false);
});

test('payment initialization rejects a meter that is no longer admin-approved', async () => {
  const originalMeterFindOne = Meter.findOne;
  const originalApprovedFindOne = ApprovedMeter.findOne;
  Meter.findOne = async () => ({ meterNumber: '123456789012' });
  ApprovedMeter.findOne = async () => null;
  const res = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    }
  };

  try {
    await paymentController.initializePayment({
      body: { meterId: 'meter-id', amount: 1000 },
      user: { id: 'customer-id', email: 'customer@example.com' }
    }, res);

    assert.equal(res.statusCode, 403);
    assert.match(res.payload.message, /no longer approved/i);
  } finally {
    Meter.findOne = originalMeterFindOne;
    ApprovedMeter.findOne = originalApprovedFindOne;
  }
});
