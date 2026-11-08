const test = require('node:test');
const assert = require('node:assert/strict');
const paymentController = require('../src/controllers/paymentController');
const creditController = require('../src/controllers/creditController');
const CreditAccount = require('../src/models/CreditAccount');
const Meter = require('../src/models/Meter');
const ApprovedMeter = require('../src/models/ApprovedMeter');
const Transaction = require('../src/models/Transaction');

const createResponse = () => ({
  statusCode: 200,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.payload = payload;
    return this;
  }
});

test("credit purchase creates a demo token and reserves the customer's credit balance", async () => {
  const originals = {
    meterFindOne: Meter.findOne,
    approvedMeterFindOne: ApprovedMeter.findOne,
    creditFindOneAndUpdate: CreditAccount.findOneAndUpdate,
    transactionCreate: Transaction.create
  };
  let creditFilter;
  let createdTransaction;
  Meter.findOne = async () => ({ meterNumber: '123456789012' });
  ApprovedMeter.findOne = async () => ({ meterNumber: '123456789012' });
  CreditAccount.findOneAndUpdate = async (filter, update) => {
    creditFilter = filter;
    assert.equal(update.$inc.balance, 5000);
    return { balance: 5000 };
  };
  Transaction.create = async (transaction) => {
    createdTransaction = transaction;
    return transaction;
  };
  const response = createResponse();
  const originalError = console.error;
  console.error = () => {};
  const originalEmailSettings = {
    apiKey: process.env.RESEND_API_KEY,
    sender: process.env.RESEND_FROM_EMAIL,
    smtpSender: process.env.SMTP_FROM
  };
  delete process.env.RESEND_API_KEY;
  delete process.env.RESEND_FROM_EMAIL;
  delete process.env.SMTP_FROM;

  try {
    await paymentController.initializePayment({
      body: { meterId: 'meter-id', amount: 5000, paymentMethod: 'credit' },
      user: { id: 'customer-id', email: 'customer@example.com' }
    }, response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.payload.data.isCredit, true);
    assert.equal(response.payload.data.creditBalance, 5000);
    assert.equal(creditFilter.balance, 0);
    assert.equal(createdTransaction.paymentMethod, 'credit');
    assert.equal(createdTransaction.creditStatus, 'unpaid');
    assert.equal(createdTransaction.amount, 5000);
  } finally {
    if (originalEmailSettings.apiKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalEmailSettings.apiKey;
    if (originalEmailSettings.sender === undefined) delete process.env.RESEND_FROM_EMAIL;
    else process.env.RESEND_FROM_EMAIL = originalEmailSettings.sender;
    if (originalEmailSettings.smtpSender === undefined) delete process.env.SMTP_FROM;
    else process.env.SMTP_FROM = originalEmailSettings.smtpSender;
    console.error = originalError;
    Meter.findOne = originals.meterFindOne;
    ApprovedMeter.findOne = originals.approvedMeterFindOne;
    CreditAccount.findOneAndUpdate = originals.creditFindOneAndUpdate;
    Transaction.create = originals.transactionCreate;
  }
});

test('credit purchase is rejected while a customer has unpaid credit', async () => {
  const originals = {
    meterFindOne: Meter.findOne,
    approvedMeterFindOne: ApprovedMeter.findOne,
    creditFindOneAndUpdate: CreditAccount.findOneAndUpdate,
    transactionCreate: Transaction.create
  };
  Meter.findOne = async () => ({ meterNumber: '123456789012' });
  ApprovedMeter.findOne = async () => ({ meterNumber: '123456789012' });
  CreditAccount.findOneAndUpdate = async () => {
    const error = new Error('Duplicate credit account');
    error.code = 11000;
    throw error;
  };
  Transaction.create = async () => {
    throw new Error('A transaction must not be created');
  };
  const response = createResponse();

  try {
    await paymentController.initializePayment({
      body: { meterId: 'meter-id', amount: 1000, paymentMethod: 'credit' },
      user: { id: 'customer-id', email: 'customer@example.com' }
    }, response);

    assert.equal(response.statusCode, 409);
    assert.match(response.payload.message, /repay your outstanding/i);
  } finally {
    Meter.findOne = originals.meterFindOne;
    ApprovedMeter.findOne = originals.approvedMeterFindOne;
    CreditAccount.findOneAndUpdate = originals.creditFindOneAndUpdate;
    Transaction.create = originals.transactionCreate;
  }
});

test('repayment clears the full debt and marks credit purchases as repaid', async () => {
  const originals = {
    findOne: CreditAccount.findOne,
    findOneAndUpdate: CreditAccount.findOneAndUpdate,
    updateMany: Transaction.updateMany
  };
  let repaymentUpdate;
  let transactionUpdate;
  CreditAccount.findOne = async () => ({ balance: 7500 });
  CreditAccount.findOneAndUpdate = async (filter, update) => {
    repaymentUpdate = { filter, update };
    return { balance: 0 };
  };
  Transaction.updateMany = async (filter, update) => {
    transactionUpdate = { filter, update };
    return { modifiedCount: 1 };
  };
  const response = createResponse();

  try {
    await creditController.repayCredit({ user: { id: 'customer-id' } }, response);
    assert.equal(response.statusCode, 200);
    assert.equal(response.payload.repayment.amount, 7500);
    assert.equal(response.payload.repayment.simulated, true);
    assert.equal(repaymentUpdate.filter.balance, 7500);
    assert.equal(repaymentUpdate.update.$set.balance, 0);
    assert.equal(transactionUpdate.filter.creditStatus, 'unpaid');
    assert.equal(transactionUpdate.update.$set.creditStatus, 'paid');
  } finally {
    CreditAccount.findOne = originals.findOne;
    CreditAccount.findOneAndUpdate = originals.findOneAndUpdate;
    Transaction.updateMany = originals.updateMany;
  }
});

test('repayment cannot be recorded when the customer has no outstanding debt', async () => {
  const originalFindOne = CreditAccount.findOne;
  const originalFindOneAndUpdate = CreditAccount.findOneAndUpdate;
  CreditAccount.findOne = async () => ({ balance: 0 });
  CreditAccount.findOneAndUpdate = async () => {
    throw new Error('No update should happen');
  };
  const response = createResponse();

  try {
    await creditController.repayCredit({ user: { id: 'customer-id' } }, response);
    assert.equal(response.statusCode, 400);
    assert.match(response.payload.message, /no outstanding/i);
  } finally {
    CreditAccount.findOne = originalFindOne;
    CreditAccount.findOneAndUpdate = originalFindOneAndUpdate;
  }
});
