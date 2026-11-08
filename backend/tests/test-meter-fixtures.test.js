const test = require('node:test');
const assert = require('node:assert/strict');
const testMeterNumbers = require('../src/data/testMeterNumbers');
const { isValidMeterNumber } = require('../src/utils/meterNumber');

test('test meter fixtures contain 30 unique valid meter-shaped numbers', () => {
  assert.equal(testMeterNumbers.length, 30);
  assert.equal(new Set(testMeterNumbers).size, 30);
  assert.ok(testMeterNumbers.every(isValidMeterNumber));
});
