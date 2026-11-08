const MIN_PURCHASE_AMOUNT = 100;
const MAX_PURCHASE_AMOUNT = 10000;

const isValidPurchaseAmount = (amount) => {
  const isDecimalInteger = typeof amount === 'number'
    || (typeof amount === 'string' && /^\d+$/.test(amount));
  const value = Number(amount);

  return isDecimalInteger
    && Number.isInteger(value)
    && value >= MIN_PURCHASE_AMOUNT
    && value <= MAX_PURCHASE_AMOUNT;
};

module.exports = {
  MIN_PURCHASE_AMOUNT,
  MAX_PURCHASE_AMOUNT,
  isValidPurchaseAmount
};
