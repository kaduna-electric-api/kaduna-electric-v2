const crypto = require('crypto');

const generateElectricityToken = () => {
  const firstGroup = crypto.randomInt(1000, 10000);
  const remainingGroups = Array.from(
    { length: 4 },
    () => crypto.randomInt(0, 10000).toString().padStart(4, '0')
  );
  return `${firstGroup}${remainingGroups.join('')}`;
};

const calculateUnits = (amount) => {
  // Simplified calculation: ~₦55 per kWh (Nigerian average)
  const rate = 55;
  const units = amount / rate;
  return parseFloat(units.toFixed(2));
};

const generateTransactionRef = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TXN-${timestamp}${random}`;
};

module.exports = { generateElectricityToken, calculateUnits, generateTransactionRef };
