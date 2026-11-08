const normalizeMeterNumber = (meterNumber) => String(meterNumber || '').trim();

const isValidMeterNumber = (meterNumber) => /^\d{11,13}$/.test(normalizeMeterNumber(meterNumber));

module.exports = { normalizeMeterNumber, isValidMeterNumber };
