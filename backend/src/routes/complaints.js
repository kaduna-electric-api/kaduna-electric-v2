const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { createComplaint, getComplaints, getComplaintById, getAllComplaints, respondToComplaint } = require('../controllers/complaintController');
const { protect, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post('/', protect, validate([
  body('category').isIn(['Payment problem', 'Token problem', 'Meter problem', 'Account problem', 'Failed transaction', 'Other']),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('description').trim().notEmpty().withMessage('Description is required')
]), createComplaint);

router.get('/', protect, getComplaints);
router.get('/admin', protect, adminOnly, getAllComplaints);
router.get('/:id', protect, getComplaintById);
router.put('/:id/respond', protect, adminOnly, validate([
  body('adminResponse').trim().notEmpty()
]), respondToComplaint);

module.exports = router;
