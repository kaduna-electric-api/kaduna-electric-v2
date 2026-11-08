const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { apiLimiter } = require('../src/middleware/rateLimiter');

test('development API calls bypass the limiter while production calls remain limited', async () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const app = express();
  app.get('/api/health', (req, res) => res.json({ status: 'OK' }));
  app.use('/api/', apiLimiter);
  app.get('/api/resource', (req, res) => res.json({ status: 'OK' }));
  const server = app.listen(0);

  try {
    await new Promise((resolve, reject) => {
      server.once('listening', resolve);
      server.once('error', reject);
    });
    const url = `http://127.0.0.1:${server.address().port}`;

    process.env.NODE_ENV = 'development';
    for (let request = 0; request < 105; request += 1) {
      const response = await fetch(`${url}/api/resource`);
      assert.equal(response.status, 200);
    }

    process.env.NODE_ENV = 'production';
    let rateLimited = false;
    for (let request = 0; request < 101; request += 1) {
      const response = await fetch(`${url}/api/resource`);
      if (response.status === 429) rateLimited = true;
    }
    assert.equal(rateLimited, true);

    const healthResponse = await fetch(`${url}/api/health`);
    assert.equal(healthResponse.status, 200);
  } finally {
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
    await new Promise((resolve) => server.close(resolve));
  }
});
