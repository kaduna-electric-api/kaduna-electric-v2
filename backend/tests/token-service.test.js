const test = require('node:test');
const assert = require('node:assert/strict');
const { generateElectricityToken } = require('../src/services/tokenService');

test('electricity tokens are exactly 20 decimal digits', () => {
  for (let i = 0; i < 100; i += 1) {
    const token = generateElectricityToken();
    assert.match(token, /^[1-9]\d{19}$/);
  }
});
