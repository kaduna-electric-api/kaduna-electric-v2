const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const RegistrationRequest = require('../models/RegistrationRequest');
const emailService = require('../services/emailService');

const generateToken = (id, extra = {}) => {
  return jwt.sign({ id, ...extra }, process.env.JWT_SECRET || 'kaduna-electric-dev-secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const hashOTP = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex');

const generateRegistrationOTP = () => {
  return String(crypto.randomInt(100000, 1000000));
};

const buildOtpEmailHtml = (otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #1a365d;">Kaduna Electric - Account Verification</h2>
    <p>Your verification code is: <strong>${otp}</strong> &mdash; it expires in 3 minutes.</p>
  </div>
`;

const getEmailDeliveryErrorMessage = () => emailService.isEmailConfigured()
  ? 'We could not send your verification email. Please try again shortly or contact support.'
  : 'Email verification is temporarily unavailable. Please try again later.';

const createPendingRegistration = async ({ email, firstName = '', lastName = '', phone = '' }) => {
  const normalizedEmail = normalizeEmail(email);
  const otp = generateRegistrationOTP();
  const otpHash = hashOTP(otp);
  const otpExpires = new Date(Date.now() + 3 * 60 * 1000);
  const resendCooldownUntil = new Date(Date.now() + 60 * 1000);

  const request = await RegistrationRequest.findOneAndUpdate(
    { email: normalizedEmail },
    {
      email: normalizedEmail,
      userData: {
        firstName: String(firstName || '').trim(),
        lastName: String(lastName || '').trim(),
        phone: String(phone || '').trim(),
        email: normalizedEmail
      },
      otpHash,
      otpExpires,
      attemptCount: 0,
      maxAttempts: 5,
      isUsed: false,
      isVerified: false,
      verifiedAt: null,
      resendCooldownUntil
    },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
  );

  return { otp, request };
};

const sendRegistrationOtp = async ({ email, firstName, lastName, phone }) => {
  const { otp, request } = await createPendingRegistration({ email, firstName, lastName, phone });
  const emailSent = await emailService.sendEmail(email, 'Kaduna Electric Registration Verification', buildOtpEmailHtml(otp));

  if (!emailSent && request?.save) {
    request.resendCooldownUntil = new Date();
    await request.save();
  }

  return emailSent;
};

const sendOtpForRegistration = async (req, res) => {
  const { firstName, lastName, email, phone } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !firstName || !lastName || !phone) {
    return res.status(400).json({ message: 'First name, last name, email and phone are required' });
  }

  let user = await User.findOne({ email: normalizedEmail });
  if (user?.isEmailVerified && user.isActive) {
    return res.status(400).json({ message: 'This email already has an account' });
  }

  const existingRequest = await RegistrationRequest.findOne({ email: normalizedEmail });
  if (existingRequest && new Date(existingRequest.resendCooldownUntil) > new Date()) {
    const remainingSeconds = Math.ceil((new Date(existingRequest.resendCooldownUntil) - new Date()) / 1000);
    return res.status(429).json({
      pendingRegistration: true,
      resendAfterSeconds: remainingSeconds,
      message: `Please wait ${remainingSeconds} seconds before requesting a new code.`
    });
  }

  if (!user) {
    user = await User.create({
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      email: normalizedEmail,
      phone: String(phone || '').trim(),
      isEmailVerified: false,
      isActive: false
    });
  }

  const profile = existingRequest?.userData || user;
  const emailSent = await sendRegistrationOtp({
    email: normalizedEmail,
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone || ''
  });
  if (!emailSent) {
    return res.status(502).json({
      success: false,
      pendingRegistration: true,
      message: getEmailDeliveryErrorMessage()
    });
  }

  return res.status(200).json({
    success: true,
    message: "We've sent a verification code to your email.",
    email: normalizedEmail
  });
};

exports.generateRegistrationOTP = generateRegistrationOTP;

exports.register = async (req, res) => {
  try {
    return await sendOtpForRegistration(req, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || '').trim();

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    const verificationRequest = await RegistrationRequest.findOne({ email });
    if (!verificationRequest) {
      return res.status(400).json({ message: 'No active verification request was found for this email' });
    }

    if (verificationRequest.isVerified) {
      const verificationToken = jwt.sign(
        { email, purpose: 'registration-password-setup' },
        process.env.JWT_SECRET || 'kaduna-electric-dev-secret',
        { expiresIn: '15m' }
      );
      return res.status(200).json({
        success: true,
        message: 'Email already verified. Please create your password.',
        verificationToken,
        email
      });
    }

    if (verificationRequest.isUsed) {
      return res.status(400).json({ message: 'This verification code has already been used' });
    }

    const isExpired = typeof verificationRequest.isExpired === 'function'
      ? verificationRequest.isExpired()
      : Boolean(verificationRequest.otpExpires && new Date(verificationRequest.otpExpires).getTime() < Date.now());

    if (isExpired) {
      verificationRequest.isUsed = true;
      await verificationRequest.save();
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    const otpMatches = typeof verificationRequest.matchesOTP === 'function'
      ? verificationRequest.matchesOTP(otp)
      : false;

    if (!otpMatches) {
      verificationRequest.attemptCount += 1;
      const maxAttemptsReached = verificationRequest.attemptCount >= verificationRequest.maxAttempts;
      if (maxAttemptsReached) verificationRequest.isUsed = true;
      await verificationRequest.save();
      return res.status(maxAttemptsReached ? 429 : 400).json({
        message: maxAttemptsReached
          ? 'Too many failed attempts. This code is invalidated; request a new one.'
          : 'Invalid verification code'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Pending account was not found. Please sign up again.' });
    }

    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    await user.save();
    verificationRequest.isVerified = true;
    verificationRequest.verifiedAt = user.emailVerifiedAt;
    verificationRequest.isUsed = true;
    await verificationRequest.save();

    const verificationToken = jwt.sign(
      { email, purpose: 'registration-password-setup' },
      process.env.JWT_SECRET || 'kaduna-electric-dev-secret',
      { expiresIn: '15m' }
    );

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully. Please create your password.',
      verificationToken,
      email
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const request = await RegistrationRequest.findOne({ email });
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'No unverified account was found for this email.' });
    }

    if (user.isEmailVerified && !user.isActive && request?.isVerified) {
      const verificationToken = jwt.sign(
        { email, purpose: 'registration-password-setup' },
        process.env.JWT_SECRET || 'kaduna-electric-dev-secret',
        { expiresIn: '15m' }
      );
      return res.status(200).json({
        success: true,
        passwordSetupRequired: true,
        verificationToken,
        email,
        message: 'Email already verified. Please create your password.'
      });
    }

    if (user.isEmailVerified || !request) {
      return res.status(400).json({ message: 'No unverified account was found for this email.' });
    }

    if (request && new Date(request.resendCooldownUntil) > new Date()) {
      const remainingSeconds = Math.ceil((new Date(request.resendCooldownUntil) - new Date()) / 1000);
      return res.status(429).json({
        message: `Please wait ${remainingSeconds} seconds before requesting a new code.`
      });
    }

    const profile = request?.userData || user;
    const emailSent = await sendRegistrationOtp({
      email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone || ''
    });
    if (!emailSent) {
      return res.status(502).json({
        message: getEmailDeliveryErrorMessage()
      });
    }

    return res.status(200).json({ success: true, message: 'A new verification code has been sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.setPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const confirmPassword = String(req.body.confirmPassword || '');
    const verificationToken = String(req.body.verificationToken || '');

    if (!email || !password || !confirmPassword || !verificationToken) {
      return res.status(400).json({ message: 'Email, password, confirmation and verification are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    let claims;
    try {
      claims = jwt.verify(verificationToken, process.env.JWT_SECRET || 'kaduna-electric-dev-secret');
    } catch (error) {
      return res.status(401).json({ message: 'Email verification session expired. Please verify your email again.' });
    }
    if (claims.purpose !== 'registration-password-setup' || normalizeEmail(claims.email) !== email) {
      return res.status(401).json({ message: 'Email verification is invalid. Please verify your email again.' });
    }

    const registrationRequest = await RegistrationRequest.findOne({ email });
    if (!registrationRequest?.isVerified) {
      return res.status(400).json({ message: 'Please verify your email before creating a password.' });
    }

    const user = await User.findOne({ email });
    if (!user || user.isActive) {
      return res.status(409).json({ message: 'Account setup is no longer available for this email.' });
    }

    user.password = password;
    user.isEmailVerified = true;
    user.emailVerifiedAt = registrationRequest.verifiedAt || new Date();
    user.isActive = true;
    await user.save();
    await RegistrationRequest.deleteOne({ email });

    return res.status(201).json({
      success: true,
      message: 'Password created. Your account is ready.',
      token: generateToken(user._id),
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isEmailVerified) {
      return res.status(403).json({
        code: 'EMAIL_NOT_VERIFIED',
        email: user.email,
        message: 'Please verify your email before signing in. You can resend your verification code.'
      });
    }
    if (!user.isActive) {
      return res.status(403).json({
        code: 'PASSWORD_SETUP_REQUIRED',
        email: user.email,
        message: 'Your email is verified. Finish creating your password to activate your account.'
      });
    }
    if (!(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }
    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, phone, address },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await emailService.sendEmail(
      user.email,
      'Password Reset - Kaduna Electric',
      `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 30 minutes.</p>`
    );
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.json({ message: 'Password reset successful', token: generateToken(user._id) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.setupAdmin = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { secretKey } = req.body;
    if (secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ message: 'Invalid admin secret key' });
    }
    const primaryAdmin = normalizeEmail(process.env.PRIMARY_ADMIN_EMAIL);
    if (primaryAdmin && primaryAdmin !== email) {
      return res.status(403).json({ message: 'Admin can only be assigned to the primary admin email' });
    }

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin && normalizeEmail(existingAdmin.email) !== email) {
      return res.status(403).json({ message: 'An admin already exists' });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { role: 'admin' },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Admin role assigned successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
