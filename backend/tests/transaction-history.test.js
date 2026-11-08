const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Transaction = require('../src/models/Transaction');
const { getHistory } = require('../src/controllers/transactionController');

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

test('transaction history scopes data to the customer, filters safely, and returns account-wide totals', async () => {
  const originals = {
    find: Transaction.find,
    countDocuments: Transaction.countDocuments,
    aggregate: Transaction.aggregate
  };
  const userId = new mongoose.Types.ObjectId().toString();
  const transactions = [{ _id: 'transaction-1', amount: 500 }];
  let findQuery;
  let countQuery;
  let aggregatePipeline;
  let pagination;

  Transaction.find = (query) => {
    findQuery = query;
    return {
      sort() {
        return this;
      },
      skip(value) {
        pagination = { ...pagination, skip: value };
        return this;
      },
      limit(value) {
        pagination = { ...pagination, limit: value };
        return this;
      },
      populate() {
        return Promise.resolve(transactions);
      }
    };
  };
  Transaction.countDocuments = async (query) => {
    countQuery = query;
    return 17;
  };
  Transaction.aggregate = async (pipeline) => {
    aggregatePipeline = pipeline;
    return [{ totalTransactions: 42, totalSpent: 85000 }];
  };

  try {
    const response = createResponse();
    await getHistory({
      user: { id: userId },
      query: { page: '2', limit: '1000', search: 'meter.*', status: 'credit-due' }
    }, response);

    assert.equal(response.statusCode, 200);
    assert.deepEqual(findQuery, {
      user: userId,
      $or: [
        { meterNumber: { $regex: 'meter\\.\\*', $options: 'i' } },
        { transactionRef: { $regex: 'meter\\.\\*', $options: 'i' } }
      ],
      paymentMethod: 'credit',
      creditStatus: 'unpaid'
    });
    assert.deepEqual(countQuery, findQuery);
    assert.equal(pagination.skip, 100);
    assert.equal(pagination.limit, 100);
    assert.equal(aggregatePipeline[0].$match.user.toString(), userId);
    assert.deepEqual(response.payload.summary, { totalTransactions: 42, totalSpent: 85000 });
    assert.deepEqual(response.payload.pagination, { page: 2, limit: 100, total: 17, pages: 1 });
    assert.deepEqual(response.payload.transactions, transactions);
  } finally {
    Transaction.find = originals.find;
    Transaction.countDocuments = originals.countDocuments;
    Transaction.aggregate = originals.aggregate;
  }
});

test('transaction history rejects unsupported status and overlong search filters', async () => {
  const originalFind = Transaction.find;
  Transaction.find = () => {
    throw new Error('Invalid filters must not query transactions');
  };

  try {
    const invalidStatusResponse = createResponse();
    await getHistory({
      user: { id: new mongoose.Types.ObjectId().toString() },
      query: { status: 'unexpected' }
    }, invalidStatusResponse);
    assert.equal(invalidStatusResponse.statusCode, 400);

    const longSearchResponse = createResponse();
    await getHistory({
      user: { id: new mongoose.Types.ObjectId().toString() },
      query: { search: 'x'.repeat(101) }
    }, longSearchResponse);
    assert.equal(longSearchResponse.statusCode, 400);
  } finally {
    Transaction.find = originalFind;
  }
});

test('successful payment filter excludes credit purchases that are still due', async () => {
  const originals = {
    find: Transaction.find,
    countDocuments: Transaction.countDocuments,
    aggregate: Transaction.aggregate
  };
  let receivedQuery;

  Transaction.find = (query) => {
    receivedQuery = query;
    return {
      sort() { return this; },
      skip() { return this; },
      limit() { return this; },
      populate() { return Promise.resolve([]); }
    };
  };
  Transaction.countDocuments = async () => 0;
  Transaction.aggregate = async () => [];

  try {
    const response = createResponse();
    await getHistory({
      user: { id: new mongoose.Types.ObjectId().toString() },
      query: { status: 'success' }
    }, response);
    assert.equal(response.statusCode, 200);
    assert.equal(receivedQuery.paymentStatus, 'success');
    assert.deepEqual(receivedQuery.paymentMethod, { $ne: 'credit' });
  } finally {
    Transaction.find = originals.find;
    Transaction.countDocuments = originals.countDocuments;
    Transaction.aggregate = originals.aggregate;
  }
});
