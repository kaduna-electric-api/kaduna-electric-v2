const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { addMeter, getMeters, deleteMeter, validateMeter } = require('../controllers/meterController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post('/', protect, validate([
  body('meterNumber').trim().notEmpty().withMessage('Meter number is required'),
  body('meterType').optional().isIn(['prepaid', 'postpaid'])
]), addMeter);

router.get('/', protect, getMeters);
router.delete('/:id', protect, deleteMeter);
router.post('/validate', protect, validate([
  body('meterNumber').trim().notEmpty()
]), validateMeter);

module.exports = router;
