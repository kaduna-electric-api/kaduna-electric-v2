const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const { generateRegistrationOTP, register, verifyOtp, setPassword, resendOtp, login, setupAdmin } = require('../src/controllers/authController');
const { isApprovedMeterNumber } = require('../src/controllers/meterController');
const ApprovedMeter = require('../src/models/ApprovedMeter');
const User = require('../src/models/User');
const RegistrationRequest = require('../src/models/RegistrationRequest');
const emailService = require('../src/services/emailService');

test('accepts only company-approved meter numbers', async () => {
  const originalFindOne = ApprovedMeter.findOne;
  ApprovedMeter.findOne = async ({ meterNumber, isActive }) => {
    if (meterNumber === '123456789012' && isActive === true) {
      return { meterNumber };
    }
    return null;
  };

  try {
    assert.equal(await isApprovedMeterNumber('123456789012'), true);
    assert.equal(await isApprovedMeterNumber('999999999999'), false);
  } finally {
    ApprovedMeter.findOne = originalFindOne;
  }
});

test('login accepts mixed-case email addresses', async () => {
  process.env.JWT_SECRET = 'test-secret';
  const originalFindOne = User.findOne;
  User.findOne = async ({ email }) => {
    assert.equal(email, 'user@example.com');
    return {
      email: 'user@example.com',
      isActive: true,
      isEmailVerified: true,
      matchPassword: async () => true
    };
  };

  try {
    const req = { body: { email: 'USER@Example.com', password: 'secret123' } };
    const res = {
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.payload = payload; return this; }
    };

    await login(req, res);
    assert.equal(res.payload.user.email, 'user@example.com');
  } finally {
    User.findOne = originalFindOne;
    delete process.env.JWT_SECRET;
  }
});

test('setupAdmin compares emails case-insensitively', async () => {
  const originalFindOne = User.findOne;
  const originalFindOneAndUpdate = User.findOneAndUpdate;
  process.env.ADMIN_SECRET_KEY = 'secret';
  process.env.PRIMARY_ADMIN_EMAIL = 'admin@kadunaelectric.com';

  User.findOne = async ({ role }) => {
    if (role === 'admin') {
      return { email: 'admin@kadunaelectric.com' };
    }
    return null;
  };
  User.findOneAndUpdate = async ({ email }, update, options) => {
    assert.equal(email, 'admin@kadunaelectric.com');
    return { email: 'admin@kadunaelectric.com', role: 'admin' };
  };

  try {
    const req = { body: { email: 'ADMIN@kadunaelectric.com', secretKey: 'secret' } };
    const res = {
      json(payload) { this.payload = payload; return this; },
      status(code) { this.statusCode = code; return this; }
    };

    await setupAdmin(req, res);
    assert.equal(res.payload.user.role, 'admin');
  } finally {
    User.findOne = originalFindOne;
    User.findOneAndUpdate = originalFindOneAndUpdate;
    delete process.env.ADMIN_SECRET_KEY;
    delete process.env.PRIMARY_ADMIN_EMAIL;
  }
});

test('otp is always six digits', () => {
  const otp = generateRegistrationOTP();
  assert.match(otp, /^\d{6}$/);
});

test('pending users may lack a password but active verified users may not', async () => {
  const pendingUser = new User({
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'pending@example.com',
    isEmailVerified: false,
    isActive: false
  });
  await assert.doesNotReject(pendingUser.validate());

  const activeUser = new User({
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'active@example.com',
    isEmailVerified: true,
    isActive: true
  });
  await assert.rejects(activeUser.validate(), /password/i);
});

test('Resend configuration accepts the existing SMTP sender setting', () => {
  const resendKeys = ['RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'SMTP_FROM'];
  const previousValues = Object.fromEntries(resendKeys.map((key) => [key, process.env[key]]));
  process.env.RESEND_API_KEY = 'test-resend-key';
  delete process.env.RESEND_FROM_EMAIL;
  process.env.SMTP_FROM = 'Kaduna Electric <verify@example.com>';

  try {
    assert.equal(emailService.isEmailConfigured(), true);
    delete process.env.SMTP_FROM;
    assert.equal(emailService.isEmailConfigured(), false);
  } finally {
    resendKeys.forEach((key) => {
      if (previousValues[key] === undefined) delete process.env[key];
      else process.env[key] = previousValues[key];
    });
  }
});

test('register creates an inactive account without a password and sends a hashed OTP', async () => {
  const originalFindOne = User.findOne;
  const originalCreate = User.create;
  const originalRequestFindOne = RegistrationRequest.findOne;
  const originalFindOneAndUpdate = RegistrationRequest.findOneAndUpdate;
  const originalSendEmail = emailService.sendEmail;
  let storedOtpExpiry;
  let storedResendCooldownUntil;
  let storedOtpHash;
  let sentEmailHtml;
  let createdUser;

  User.findOne = async () => null;
  User.create = async (data) => {
    createdUser = data;
    return { ...data, _id: 'pending-user' };
  };
  RegistrationRequest.findOne = async () => null;
  RegistrationRequest.findOneAndUpdate = async (filter, update) => {
    storedOtpExpiry = update.otpExpires;
    storedResendCooldownUntil = update.resendCooldownUntil;
    storedOtpHash = update.otpHash;
    return {
      email: 'test@kadunaelectric.com',
      userData: { firstName: 'Jane', lastName: 'Doe', phone: '08012345678' },
      otpHash: update.otpHash,
      otpExpires: update.otpExpires,
      attemptCount: 0,
      maxAttempts: 5,
      isUsed: false,
      isVerified: false,
      save: async () => ({})
    };
  };
  emailService.sendEmail = async (to, subject, html) => {
    sentEmailHtml = html;
    return true;
  };

  try {
    const req = { body: {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'test@kadunaelectric.com',
      phone: '08012345678'
    } };
    const res = {
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.payload = payload; return this; }
    };

    await register(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.payload.success, true);
    assert.equal(res.payload.otp, undefined);
    assert.match(res.payload.message, /We've sent a verification code/i);
    assert.equal(createdUser.isActive, false);
    assert.equal(createdUser.isEmailVerified, false);
    assert.equal(Object.hasOwn(createdUser, 'password'), false);
    const emailedOtp = sentEmailHtml.match(/verification code is: <strong>(\d{6})<\/strong>/i)?.[1];
    assert.ok(emailedOtp);
    assert.match(sentEmailHtml, /it expires in 3 minutes/i);
    assert.equal(storedOtpHash, crypto.createHash('sha256').update(emailedOtp).digest('hex'));
    assert.notEqual(storedOtpHash, emailedOtp);
    const expiryMinutes = (storedOtpExpiry.getTime() - Date.now()) / 60000;
    assert.ok(expiryMinutes > 2.9 && expiryMinutes <= 3);
    const cooldownSeconds = (storedResendCooldownUntil.getTime() - Date.now()) / 1000;
    assert.ok(cooldownSeconds > 59 && cooldownSeconds <= 60);
  } finally {
    User.findOne = originalFindOne;
    User.create = originalCreate;
    RegistrationRequest.findOne = originalRequestFindOne;
    RegistrationRequest.findOneAndUpdate = originalFindOneAndUpdate;
    emailService.sendEmail = originalSendEmail;
  }
});

test('verifyOtp returns a password setup token without activating the account', async () => {
  const originalFindOne = RegistrationRequest.findOne;
  const originalUserFindOne = User.findOne;
  const originalDeleteOne = RegistrationRequest.deleteOne;
  let pendingUser;

  RegistrationRequest.findOne = async () => ({
    email: 'test@kadunaelectric.com',
    otpHash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    otpExpires: new Date(Date.now() + 60 * 1000),
    attemptCount: 0,
    maxAttempts: 5,
    isUsed: false,
    isVerified: false,
    matchesOTP: (otp) => otp === '123456',
    save: async () => ({})
  });
  User.findOne = async () => pendingUser;
  pendingUser = {
    _id: 'pending-user',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'test@kadunaelectric.com',
    role: 'customer',
    isActive: false,
    isEmailVerified: false,
    save: async function() { return this; }
  };
  RegistrationRequest.deleteOne = async () => ({ deletedCount: 1 });

  try {
    const req = { body: { email: 'test@kadunaelectric.com', otp: '123456' } };
    const res = {
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.payload = payload; return this; }
    };

    await verifyOtp(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(Boolean(res.payload.verificationToken), true);
    assert.equal(res.payload.success, true);
    assert.equal(pendingUser.isEmailVerified, true);
    assert.equal(pendingUser.isActive, false);
  } finally {
    RegistrationRequest.findOne = originalFindOne;
    User.findOne = originalUserFindOne;
    RegistrationRequest.deleteOne = originalDeleteOne;
  }
});

test('setPassword activates the account only when passwords match', async () => {
  const originalFindOneUser = User.findOne;
  const originalFindOneRequest = RegistrationRequest.findOne;
  const originalDeleteOne = RegistrationRequest.deleteOne;
  const pendingUser = {
    _id: 'pending-user',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'test@kadunaelectric.com',
    role: 'customer',
    isActive: false,
    isEmailVerified: false,
    save: async function() { return this; }
  };
  User.findOne = async () => pendingUser;
  RegistrationRequest.findOne = async () => ({
    isVerified: true,
    verifiedAt: new Date(),
    userData: { firstName: 'Jane', lastName: 'Doe' }
  });
  RegistrationRequest.deleteOne = async () => ({ deletedCount: 1 });

  try {
    const verificationToken = jwt.sign(
      { email: pendingUser.email, purpose: 'registration-password-setup' },
      process.env.JWT_SECRET || 'kaduna-electric-dev-secret',
      { expiresIn: '15m' }
    );
    const req = { body: {
      email: pendingUser.email,
      password: 'StrongPass123!',
      confirmPassword: 'StrongPass123!',
      verificationToken
    } };
    const res = {
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.payload = payload; return this; }
    };

    await setPassword(req, res);

    assert.equal(res.statusCode, 201);
    assert.equal(pendingUser.password, 'StrongPass123!');
    assert.equal(pendingUser.isEmailVerified, true);
    assert.equal(pendingUser.isActive, true);
    assert.equal(Boolean(res.payload.token), true);
  } finally {
    User.findOne = originalFindOneUser;
    RegistrationRequest.findOne = originalFindOneRequest;
    RegistrationRequest.deleteOne = originalDeleteOne;
  }
});

test('setPassword rejects non-matching confirmation before account activation', async () => {
  const originalFindOneUser = User.findOne;
  const pendingUser = {
    isActive: false,
    isEmailVerified: false,
    save: async () => { throw new Error('must not save'); }
  };
  User.findOne = async () => pendingUser;

  try {
    const verificationToken = jwt.sign(
      { email: 'test@kadunaelectric.com', purpose: 'registration-password-setup' },
      process.env.JWT_SECRET || 'kaduna-electric-dev-secret',
      { expiresIn: '15m' }
    );
    const req = { body: {
      email: 'test@kadunaelectric.com',
      password: 'StrongPass123!',
      confirmPassword: 'DifferentPass123!',
      verificationToken
    } };
    const res = {
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.payload = payload; return this; }
    };

    await setPassword(req, res);

    assert.equal(res.statusCode, 400);
    assert.match(res.payload.message, /Passwords do not match/i);
    assert.equal(pendingUser.isActive, false);
    assert.equal(pendingUser.isEmailVerified, false);
  } finally {
    User.findOne = originalFindOneUser;
  }
});

test('verifyOtp marks expired codes used without clearing required fields', async () => {
  const originalFindOne = RegistrationRequest.findOne;
  const expiredRequest = {
    email: 'test@kadunaelectric.com',
    otpHash: 'hashed-otp',
    otpExpires: new Date(Date.now() - 1000),
    attemptCount: 0,
    maxAttempts: 5,
    isUsed: false,
    isExpired: () => true,
    save: async () => ({})
  };
  RegistrationRequest.findOne = async () => expiredRequest;

  try {
    const req = { body: { email: 'test@kadunaelectric.com', otp: '123456' } };
    const res = {
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.payload = payload; return this; }
    };

    await verifyOtp(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(expiredRequest.isUsed, true);
    assert.equal(expiredRequest.otpHash, 'hashed-otp');
    assert.ok(expiredRequest.otpExpires instanceof Date);
  } finally {
    RegistrationRequest.findOne = originalFindOne;
  }
});

test('fifth incorrect OTP attempt invalidates the code', async () => {
  const originalFindOne = RegistrationRequest.findOne;
  const failedRequest = {
    email: 'test@kadunaelectric.com',
    otpHash: 'hashed-otp',
    otpExpires: new Date(Date.now() + 60_000),
    attemptCount: 0,
    maxAttempts: 5,
    isUsed: false,
    isVerified: false,
    matchesOTP: () => false,
    save: async () => ({})
  };
  RegistrationRequest.findOne = async () => failedRequest;

  try {
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const req = { body: { email: 'test@kadunaelectric.com', otp: '000000' } };
      const res = {
        status(code) { this.statusCode = code; return this; },
        json(payload) { this.payload = payload; return this; }
      };
      await verifyOtp(req, res);
      assert.equal(res.statusCode, attempt === 5 ? 429 : 400);
    }

    assert.equal(failedRequest.attemptCount, 5);
    assert.equal(failedRequest.isUsed, true);
  } finally {
    RegistrationRequest.findOne = originalFindOne;
  }
});

test('resendOtp enforces the 60-second cooldown', async () => {
  const originalFindOneRequest = RegistrationRequest.findOne;
  const originalFindOneUser = User.findOne;
  const originalSendEmail = emailService.sendEmail;
  let emailAttempted = false;

  RegistrationRequest.findOne = async () => ({ resendCooldownUntil: new Date(Date.now() + 60_000) });
  User.findOne = async () => ({ isEmailVerified: false });
  emailService.sendEmail = async () => {
    emailAttempted = true;
    return true;
  };

  try {
    const req = { body: { email: 'pending@example.com' } };
    const res = {
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.payload = payload; return this; }
    };

    await resendOtp(req, res);

    assert.equal(res.statusCode, 429);
    assert.match(res.payload.message, /wait \d+ seconds/i);
    assert.equal(emailAttempted, false);
  } finally {
    RegistrationRequest.findOne = originalFindOneRequest;
    User.findOne = originalFindOneUser;
    emailService.sendEmail = originalSendEmail;
  }
});

test('unverified users cannot log in and are offered code resend', async () => {
  const originalFindOne = User.findOne;
  User.findOne = async () => ({
    email: 'pending@example.com',
    isActive: false,
    isEmailVerified: false,
    matchPassword: async () => { throw new Error('pending accounts have no password'); }
  });

  try {
    const req = { body: { email: 'pending@example.com', password: 'StrongPass123!' } };
    const res = {
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.payload = payload; return this; }
    };

    await login(req, res);

    assert.equal(res.statusCode, 403);
    assert.equal(res.payload.code, 'EMAIL_NOT_VERIFIED');
    assert.equal(res.payload.email, 'pending@example.com');
  } finally {
    User.findOne = originalFindOne;
  }
});

test('returns an error instead of exposing a dev OTP when email delivery is unavailable', async () => {
  process.env.RESEND_API_KEY = 'test-resend-key';
  process.env.RESEND_FROM_EMAIL = 'Kaduna Electric <verify@example.com>';

  const originalFindOneUser = User.findOne;
  const originalCreate = User.create;
  const originalRequestFindOne = RegistrationRequest.findOne;
  const originalFindOneAndUpdate = RegistrationRequest.findOneAndUpdate;
  const originalSendEmail = emailService.sendEmail;

  User.findOne = async () => null;
  User.create = async (data) => ({ ...data, _id: 'pending-user' });
  RegistrationRequest.findOne = async () => null;
  RegistrationRequest.findOneAndUpdate = async (filter, update) => ({
    ...update,
    save: async () => ({})
  });
  emailService.sendEmail = async () => false;

  try {
    const req = { body: {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'test@kadunaelectric.com',
      phone: '08012345678',
      password: 'StrongPass123!'
    } };
    const res = {
      status(code) { this.statusCode = code; return this; },
      json(payload) { this.payload = payload; return this; }
    };

    await register(req, res);

    assert.equal(res.statusCode, 502);
    assert.match(String(res.payload.message), /Please try again shortly or contact support/i);
    assert.equal(res.payload.pendingRegistration, true);
  } finally {
    User.findOne = originalFindOneUser;
    User.create = originalCreate;
    RegistrationRequest.findOne = originalRequestFindOne;
    RegistrationRequest.findOneAndUpdate = originalFindOneAndUpdate;
    emailService.sendEmail = originalSendEmail;
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
  }
});
