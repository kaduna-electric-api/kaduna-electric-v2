const axios = require('axios');
const crypto = require('crypto');

const PAYSTACK_BASE = 'https://api.paystack.co';

const getPaystackSecretKey = () => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey || !secretKey.startsWith('sk_test_')) {
    throw new Error('Paystack test mode requires a secret key beginning with sk_test_. Live keys are disabled.');
  }
  return secretKey;
};

const initializePaystack = async (amount, email, callbackUrl, metadata = {}) => {
  try {
    const response = await axios.post(
      `${PAYSTACK_BASE}/transaction/initialize`,
      {
        amount: amount * 100,
        email,
        callback_url: callbackUrl,
        metadata
      },
      {
        headers: {
          Authorization: `Bearer ${getPaystackSecretKey()}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Paystack initialization failed');
  }
};

const verifyPaystack = async (reference) => {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${getPaystackSecretKey()}`
        },
        timeout: 15000
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Paystack verification failed');
  }
};

const verifyWebhook = (signature, rawBody) => {
  if (!signature || !rawBody || !process.env.PAYSTACK_SECRET_KEY?.startsWith('sk_test_')) {
    return false;
  }

  const expected = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest();
  const received = Buffer.from(signature, 'hex');

  return received.length === expected.length && crypto.timingSafeEqual(expected, received);
};

module.exports = { initializePaystack, verifyPaystack, verifyWebhook, getPaystackSecretKey };
