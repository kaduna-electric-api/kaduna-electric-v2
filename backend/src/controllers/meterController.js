const Meter = require('../models/Meter');

exports.addMeter = async (req, res) => {
  try {
    const { meterNumber, meterType, address, nickname } = req.body;
    const meter = await Meter.create({
      user: req.user.id,
      meterNumber,
      meterType: meterType || 'prepaid',
      address,
      nickname
    });
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
    res.json(meters);
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
    // In production, this would call Kaduna Electric API
    // For demo, we validate format (11-13 digits)
    const isValid = /^\d{11,13}$/.test(meterNumber);
    res.json({ valid: isValid, meterNumber });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
