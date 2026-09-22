const axios = require('axios');
(async () => {
  try {
    const base = 'http://localhost:5000/api';
    const email = `e2e.${Date.now()}@example.com`;
    console.log('email', email);

    const reg = await axios.post(`${base}/auth/register`, { firstName: 'E2E', lastName: 'Tester', email, password: 'Password123!', phone: '08000000000' });
    console.log('register', JSON.stringify(reg.data, null, 2));

    const token = reg.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    const meter = await axios.post(`${base}/meters`, { meterNumber: '12345678901', nickname: 'Home' }, { headers });
    console.log('meter', JSON.stringify(meter.data, null, 2));

    const init = await axios.post(`${base}/payments/initialize`, { meterId: meter.data._id, amount: 1000 }, { headers });
    console.log('initialize', JSON.stringify(init.data, null, 2));

  } catch (e) {
    if (e.response) {
      console.error('error response', e.response.status, JSON.stringify(e.response.data, null, 2));
    } else {
      console.error('error', e.message);
    }
    process.exit(1);
  }
})();