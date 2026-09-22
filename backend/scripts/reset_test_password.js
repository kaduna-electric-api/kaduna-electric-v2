const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const connectDB = require('../src/config/db');
const User = require('../src/models/User');

const run = async () => {
  try {
    await connectDB();
    const email = process.argv[2];
    const newPass = process.argv[3] || 'password123';
    if (!email) {
      console.error('Usage: node reset_test_password.js user@example.com [newPassword]');
      process.exit(1);
    }
    const user = await User.findOne({ email });
    if (!user) {
      console.error('User not found');
      process.exit(1);
    }
    user.password = newPass;
    await user.save();
    console.log(`Password for ${email} reset to '${newPass}'`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
