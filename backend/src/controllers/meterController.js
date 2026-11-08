const Meter = require('../models/Meter');
const ApprovedMeter = require('../models/ApprovedMeter');
const { normalizeMeterNumber, isValidMeterNumber } = require('../utils/meterNumber');

const isApprovedMeterNumber = async (meterNumber) => {
  const normalized = normalizeMeterNumber(meterNumber);
  if (!normalized) return false;

  const approvedMeter = await ApprovedMeter.findOne({
    meterNumber: normalized,
    isActive: true
  });

  return !!approvedMeter;
};

exports.isApprovedMeterNumber = isApprovedMeterNumber;

exports.addMeter = async (req, res) => {
  try {
    const { meterNumber, meterType, address, nickname } = req.body;
    const normalizedMeterNumber = normalizeMeterNumber(meterNumber);

    if (!normalizedMeterNumber) {
      return res.status(400).json({ message: 'Meter number is required' });
    }
    if (!isValidMeterNumber(normalizedMeterNumber)) {
      return res.status(400).json({ message: 'Enter a valid 11 to 13 digit meter number' });
    }

    const isApproved = await isApprovedMeterNumber(normalizedMeterNumber);
    if (!isApproved) {
      return res.status(400).json({
        message: 'This meter number has not been approved by an administrator. Please contact support.'
      });
    }

    const existingMeter = await Meter.findOne({ user: req.user.id, meterNumber: normalizedMeterNumber });
    if (existingMeter?.isActive) {
      return res.status(400).json({ message: 'Meter already added to your account' });
    }

    const meter = existingMeter
      ? await Meter.findOneAndUpdate(
        { _id: existingMeter._id, user: req.user.id },
        {
          $set: {
            isActive: true,
            meterType: meterType || 'prepaid',
            address,
            nickname
          }
        },
        { new: true, runValidators: true }
      )
      : await Meter.create({
        user: req.user.id,
        meterNumber: normalizedMeterNumber,
        meterType: meterType || 'prepaid',
        address,
        nickname
      });
    if (!meter) {
      return res.status(409).json({ message: 'Meter could not be reactivated. Please try again.' });
    }
    res.status(201).json(meter);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Meter already added to your account' });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getMeters = async (req, res) => {
  try {
    const meters = await Meter.find({ user: req.user.id, isActive: true });
    const approvedMeterNumbers = await ApprovedMeter.distinct('meterNumber', {
      meterNumber: { $in: meters.map((meter) => meter.meterNumber) },
      isActive: true
    });
    const approvedNumberSet = new Set(approvedMeterNumbers);
    res.json(meters.filter((meter) => approvedNumberSet.has(meter.meterNumber)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMeter = async (req, res) => {
  try {
    const meter = await Meter.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isActive: false },
      { new: true }
    );
    if (!meter) {
      return res.status(404).json({ message: 'Meter not found' });
    }
    res.json({ message: 'Meter removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.validateMeter = async (req, res) => {
  try {
    const { meterNumber } = req.body;
    const normalizedMeterNumber = normalizeMeterNumber(meterNumber);
    const isValid = isValidMeterNumber(normalizedMeterNumber) && await isApprovedMeterNumber(normalizedMeterNumber);
    res.json({ valid: isValid, meterNumber: normalizedMeterNumber, source: 'company-approved-registry' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
