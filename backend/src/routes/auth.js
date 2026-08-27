const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe, updateProfile, forgotPassword, resetPassword, setupAdmin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, validate([
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
]), register);

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
