const test = require('node:test');
const assert = require('node:assert/strict');
const Notification = require('../src/models/Notification');

test('notification schema stores the required alert fields', () => {
  const notification = new Notification({
    recipient: '507f1f77bcf86cd799439011',
    title: 'Meter verification',
    message: 'Your meter is pending approval from the utility office.',
    type: 'warning'
  });

  assert.equal(notification.title, 'Meter verification');
  assert.equal(notification.message, 'Your meter is pending approval from the utility office.');
  assert.equal(notification.type, 'warning');
  assert.equal(notification.isRead, false);
});
