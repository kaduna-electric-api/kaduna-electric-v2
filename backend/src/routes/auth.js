const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  register,
  verifyOtp,
  resendOtp,
  setPassword,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  setupAdmin
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, validate([
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required')
]), register);

router.post('/verify-otp', authLimiter, validate([
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits')
]), verifyOtp);

router.post('/resend-otp', authLimiter, validate([
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
]), resendOtp);

router.post('/set-password', authLimiter, validate([
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').notEmpty().withMessage('Confirm password is required'),
  body('verificationToken').notEmpty().withMessage('Email verification is required')
]), setPassword);

router.post('/login', authLimiter, validate([
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
]), login);

router.get('/me', protect, getMe);
router.put('/profile', protect, validate([
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('phone').optional().trim()
]), updateProfile);

router.post('/forgot-password', authLimiter, validate([
  body('email').isEmail().normalizeEmail()
]), forgotPassword);

router.post('/reset-password/:token', authLimiter, validate([
  body('password').isLength({ min: 6 })
]), resetPassword);

router.post('/setup-admin', validate([
  body('email').isEmail(),
  body('secretKey').notEmpty()
]), setupAdmin);

module.exports = router;
