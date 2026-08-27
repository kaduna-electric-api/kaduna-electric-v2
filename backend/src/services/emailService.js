const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Kaduna Electric <noreply@kadunaelectric.com>',
      to,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error('Email send failed:', error.message);
    return false;
  }
};

const sendTokenEmail = async (to, token, amount, units, meterNumber, transactionRef) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a365d;">⚡ Kaduna Electric - Token Purchase</h2>
      <p>Your electricity token has been generated successfully.</p>
      <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Token:</strong> <span style="font-size: 18px; letter-spacing: 2px; color: #2b6cb0;">${token}</span></p>
        <p><strong>Meter Number:</strong> ${meterNumber}</p>
        <p><strong>Amount:</strong> ₦${amount.toLocaleString()}</p>
        <p><strong>Units:</strong> ${units} kWh</p>
        <p><strong>Transaction ID:</strong> ${transactionRef}</p>
      </div>
      <p style="color: #718096; font-size: 12px;">Thank you for using Kaduna Electric.</p>
    </div>
  `;
  return await sendEmail(to, 'Your Electricity Token', html);
};

const sendComplaintResponseEmail = async (to, reference, response) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1a365d;">Kaduna Electric - Complaint Update</h2>
      <p>Your complaint <strong>${reference}</strong> has been updated.</p>
      <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Admin Response:</strong></p>
        <p>${response}</p>
      </div>
      <p>Status: <strong style="color: #38a169;">Resolved</strong></p>
    </div>
  `;
  return await sendEmail(to, 'Complaint Response - Kaduna Electric', html);
};

module.exports = { sendEmail, sendTokenEmail, sendComplaintResponseEmail };
