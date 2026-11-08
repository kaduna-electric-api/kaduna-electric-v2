const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { forgotPassword, resetPassword } = require('../src/controllers/authController');
const User = require('../src/models/User');
const emailService = require('../src/services/emailService');

const createResponse = () => ({
  statusCode: 200,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.payload = payload;
    return this;
  }
});

test('forgotPassword emails a reset link to the configured frontend URL', async () => {
  const originalFindOne = User.findOne;
  const originalSendEmail = emailService.sendEmail;
  const originalFrontendUrl = process.env.FRONTEND_URL;
  const originalNodeEnv = process.env.NODE_ENV;
  let sentEmail;
  const user = {
    email: 'user@example.com',
    save: async () => ({})
  };
  User.findOne = async () => user;
  emailService.sendEmail = async (...args) => {
    sentEmail = args;
    return true;
  };
  process.env.FRONTEND_URL = 'https://app.example.com/';
  process.env.NODE_ENV = 'production';

  try {
    const res = createResponse();
    await forgotPassword({ body: { email: ' User@Example.com ' } }, res);

    assert.equal(res.statusCode, 200);
    assert.match(sentEmail[2], /https:\/\/app\.example\.com\/reset-password\/[a-f0-9]{40}/);
    assert.equal(user.resetPasswordToken, crypto.createHash('sha256').update(
      sentEmail[2].match(/reset-password\/([a-f0-9]{40})/)[1]
    ).digest('hex'));
    assert.ok(user.resetPasswordExpire > Date.now());
  } finally {
    User.findOne = originalFindOne;
    emailService.sendEmail = originalSendEmail;
    if (originalFrontendUrl === undefined) delete process.env.FRONTEND_URL;
    else process.env.FRONTEND_URL = originalFrontendUrl;
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
  }
});

test('forgotPassword invalidates the reset token and reports email delivery failure', async () => {
  const originalFindOne = User.findOne;
  const originalSendEmail = emailService.sendEmail;
  const originalFrontendUrl = process.env.FRONTEND_URL;
  const originalNodeEnv = process.env.NODE_ENV;
  let saves = 0;
  const user = {
    email: 'user@example.com',
    async save() {
      saves += 1;
    }
  };
  User.findOne = async () => user;
  emailService.sendEmail = async () => false;
  process.env.FRONTEND_URL = 'https://app.example.com';
  process.env.NODE_ENV = 'production';

  try {
    const res = createResponse();
    await forgotPassword({ body: { email: user.email } }, res);

    assert.equal(res.statusCode, 502);
    assert.match(res.payload.message, /Unable to send password reset email/i);
    assert.equal(user.resetPasswordToken, undefined);
    assert.equal(user.resetPasswordExpire, undefined);
    assert.equal(saves, 2);
  } finally {
    User.findOne = originalFindOne;
    emailService.sendEmail = originalSendEmail;
    if (originalFrontendUrl === undefined) delete process.env.FRONTEND_URL;
    else process.env.FRONTEND_URL = originalFrontendUrl;
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
  }
});

test('forgotPassword requires a frontend URL in production', async () => {
  const originalFindOne = User.findOne;
  const originalFrontendUrl = process.env.FRONTEND_URL;
  const originalNodeEnv = process.env.NODE_ENV;
  let userLookupCalled = false;
  User.findOne = async () => {
    userLookupCalled = true;
    return null;
  };
  delete process.env.FRONTEND_URL;
  process.env.NODE_ENV = 'production';

  try {
    const res = createResponse();
    await forgotPassword({ body: { email: 'user@example.com' } }, res);

    assert.equal(res.statusCode, 503);
    assert.equal(userLookupCalled, false);
  } finally {
    User.findOne = originalFindOne;
    if (originalFrontendUrl === undefined) delete process.env.FRONTEND_URL;
    else process.env.FRONTEND_URL = originalFrontendUrl;
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
  }
});

test('resetPassword accepts an unexpired hashed token and updates the password', async () => {
  const originalFindOne = User.findOne;
  const originalJwtSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'password-reset-test-secret';
  const rawToken = crypto.randomBytes(20).toString('hex');
  const user = {
    _id: 'user-id',
    resetPasswordToken: crypto.createHash('sha256').update(rawToken).digest('hex'),
    resetPasswordExpire: Date.now() + 60_000,
    async save() {}
  };
  User.findOne = async (query) => {
    assert.equal(query.resetPasswordToken, user.resetPasswordToken);
    assert.ok(query.resetPasswordExpire.$gt <= Date.now());
    return user;
  };

  try {
    const res = createResponse();
    await resetPassword({ params: { token: rawToken }, body: { password: 'new-password' } }, res);

    assert.equal(res.payload.message, 'Password reset successful');
    assert.equal(user.password, 'new-password');
    assert.equal(user.resetPasswordToken, undefined);
    assert.equal(user.resetPasswordExpire, undefined);
    assert.ok(res.payload.token);
  } finally {
    User.findOne = originalFindOne;
    if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalJwtSecret;
  }
});
