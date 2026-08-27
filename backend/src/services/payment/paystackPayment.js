const axios = require('axios');

const PAYSTACK_BASE = 'https://api.paystack.co';

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
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Paystack initialization failed');
  }
};

const verifyPaystack = async (reference) => {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Paystack verification failed');
  }
};

const verifyWebhook = (signature, body) => {
  const crypto = require('crypto');
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(body))
    .digest('hex');
  return hash === signature;
};

module.exports = { initializePaystack, verifyPaystack, verifyWebhook };
