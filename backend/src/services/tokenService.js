const crypto = require('crypto');

const generateElectricityToken = () => {
  // Generate a 20-digit token in groups of 4
  const bytes = crypto.randomBytes(10);
  const hex = bytes.toString('hex').toUpperCase();
  // Format: XXXX XXXX XXXX XXXX XXXX
  const formatted = hex.match(/.{1,4}/g).join(' ');
  return formatted;
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
