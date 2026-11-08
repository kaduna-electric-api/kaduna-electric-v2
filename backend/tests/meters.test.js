const test = require('node:test');
const assert = require('node:assert/strict');
const { addMeter, getMeters } = require('../src/controllers/meterController');
const ApprovedMeter = require('../src/models/ApprovedMeter');
const Meter = require('../src/models/Meter');

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

test('customers cannot add a meter unless an admin has approved that exact number', async () => {
  const originalApprovedFindOne = ApprovedMeter.findOne;
  const originalMeterFindOne = Meter.findOne;
  const originalMeterCreate = Meter.create;
  let createCalled = false;

  ApprovedMeter.findOne = async () => null;
  Meter.findOne = async () => null;
  Meter.create = async () => {
    createCalled = true;
    return {};
  };

  try {
    const req = {
      body: { meterNumber: '123456789012' },
      user: { id: 'customer-id' }
    };
    const res = createResponse();

    await addMeter(req, res);

    assert.equal(res.statusCode, 400);
    assert.match(res.payload.message, /not been approved/i);
    assert.equal(createCalled, false);
  } finally {
    ApprovedMeter.findOne = originalApprovedFindOne;
    Meter.findOne = originalMeterFindOne;
    Meter.create = originalMeterCreate;
  }
});

test('customers can add a valid meter after an admin approves its number', async () => {
  const originalApprovedFindOne = ApprovedMeter.findOne;
  const originalMeterFindOne = Meter.findOne;
  const originalMeterCreate = Meter.create;
  const createdMeter = { _id: 'meter-id', meterNumber: '123456789012' };

  ApprovedMeter.findOne = async (query) => {
    assert.deepEqual(query, { meterNumber: '123456789012', isActive: true });
    return { meterNumber: '123456789012' };
  };
  Meter.findOne = async () => null;
  Meter.create = async (meter) => {
    assert.equal(meter.user, 'customer-id');
    assert.equal(meter.meterNumber, '123456789012');
    return createdMeter;
  };

  try {
    const req = {
      body: { meterNumber: ' 123456789012 ' },
      user: { id: 'customer-id' }
    };
    const res = createResponse();

    await addMeter(req, res);

    assert.equal(res.statusCode, 201);
    assert.equal(res.payload, createdMeter);
  } finally {
    ApprovedMeter.findOne = originalApprovedFindOne;
    Meter.findOne = originalMeterFindOne;
    Meter.create = originalMeterCreate;
  }
});

test('customers cannot register a malformed meter number even if registry lookup is skipped', async () => {
  const originalApprovedFindOne = ApprovedMeter.findOne;
  let registryLookupCalled = false;
  ApprovedMeter.findOne = async () => {
    registryLookupCalled = true;
    return { meterNumber: '1234' };
  };

  try {
    const req = { body: { meterNumber: '1234' }, user: { id: 'customer-id' } };
    const res = createResponse();

    await addMeter(req, res);

    assert.equal(res.statusCode, 400);
    assert.match(res.payload.message, /11 to 13 digit/i);
    assert.equal(registryLookupCalled, false);
  } finally {
    ApprovedMeter.findOne = originalApprovedFindOne;
  }
});

test('customers can re-add a removed meter without violating the unique meter index', async () => {
  const originalApprovedFindOne = ApprovedMeter.findOne;
  const originalMeterFindOne = Meter.findOne;
  const originalFindOneAndUpdate = Meter.findOneAndUpdate;
  const originalCreate = Meter.create;
  const existingMeter = { _id: 'meter-id', isActive: false, meterNumber: '123456789012' };
  const reactivatedMeter = { ...existingMeter, isActive: true };
  let createCalled = false;

  ApprovedMeter.findOne = async () => ({ meterNumber: '123456789012' });
  Meter.findOne = async () => existingMeter;
  Meter.findOneAndUpdate = async (query, update) => {
    assert.deepEqual(query, { _id: existingMeter._id, user: 'customer-id' });
    assert.equal(update.$set.isActive, true);
    return reactivatedMeter;
  };
  Meter.create = async () => {
    createCalled = true;
  };

  try {
    const req = {
      body: { meterNumber: '123456789012', nickname: 'Home' },
      user: { id: 'customer-id' }
    };
    const res = createResponse();

    await addMeter(req, res);

    assert.equal(res.statusCode, 201);
    assert.equal(res.payload.isActive, true);
    assert.equal(createCalled, false);
  } finally {
    ApprovedMeter.findOne = originalApprovedFindOne;
    Meter.findOne = originalMeterFindOne;
    Meter.findOneAndUpdate = originalFindOneAndUpdate;
    Meter.create = originalCreate;
  }
});

test('customer meter list hides meters disabled in the admin registry', async () => {
  const originalMeterFind = Meter.find;
  const originalApprovedDistinct = ApprovedMeter.distinct;
  const customerMeters = [
    { meterNumber: '123456789012' },
    { meterNumber: '234567890123' }
  ];

  Meter.find = async (query) => {
    assert.deepEqual(query, { user: 'customer-id', isActive: true });
    return customerMeters;
  };
  ApprovedMeter.distinct = async (field, query) => {
    assert.equal(field, 'meterNumber');
    assert.deepEqual(query, {
      meterNumber: { $in: ['123456789012', '234567890123'] },
      isActive: true
    });
    return ['123456789012'];
  };

  try {
    const req = { user: { id: 'customer-id' } };
    const res = createResponse();
    await getMeters(req, res);

    assert.deepEqual(res.payload, [customerMeters[0]]);
  } finally {
    Meter.find = originalMeterFind;
    ApprovedMeter.distinct = originalApprovedDistinct;
  }
});
