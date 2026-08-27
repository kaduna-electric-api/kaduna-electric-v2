const { v4: uuidv4 } = require('uuid');

const processDemoPayment = async (amount, email, metadata = {}) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const isSuccess = true; // Demo always succeeds for presentation

  if (isSuccess) {
    return {
      status: true,
      message: 'Demo payment successful',
      data: {
        reference: `DEMO-${uuidv4().split('-')[0].toUpperCase()}`,
        status: 'success',
        amount: amount * 100, // in kobo
        gateway_response: 'Demo Payment Successful',
        paid_at: new Date().toISOString(),
        channel: 'demo',
        metadata
      }
    };
  }
};

module.exports = { processDemoPayment };
