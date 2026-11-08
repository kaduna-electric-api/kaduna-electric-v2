const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const notifications = await Notification.find({
      $or: [{ recipient: 'all' }, { recipient: userId }]
    })
      .sort({ createdAt: -1 })
      .limit(8);

    const unreadCount = await Notification.countDocuments({
      $or: [{ recipient: 'all' }, { recipient: userId }],
      isRead: false,
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const { title, message, type = 'info', recipient = 'all' } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const notification = await Notification.create({
      recipient: String(recipient || 'all'),
      title: String(title).trim(),
      message: String(message).trim(),
      type,
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const notification = await Notification.findOne({
      _id: req.params.id,
      $or: [{ recipient: 'all' }, { recipient: userId }],
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
