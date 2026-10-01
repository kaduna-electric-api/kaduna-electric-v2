const { Resend } = require('resend');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const getEmailSender = () => (
  process.env.RESEND_FROM_EMAIL?.trim() || process.env.SMTP_FROM?.trim() || ''
);

const isEmailConfigured = () => Boolean(process.env.RESEND_API_KEY?.trim() && getEmailSender());

const sendEmail = async (to, subject, html) => {
  if (!isEmailConfigured()) {
    console.error('Resend configuration is incomplete. Set RESEND_API_KEY and RESEND_FROM_EMAIL in the backend environment.');
    return false;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY.trim());
    const { data, error } = await resend.emails.send({
      from: getEmailSender(),
      to,
      subject,
      html
    });

    if (error) {
      console.error('Resend email send failed:', {
        name: error.name,
        statusCode: error.statusCode,
        message: error.message
      });
      return false;
    }

    return Boolean(data?.id);
  } catch (error) {
    console.error('Resend email send failed:', {
      name: error.name,
      statusCode: error.statusCode,
      message: error.message
    });
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

module.exports = { sendEmail, sendTokenEmail, sendComplaintResponseEmail, isEmailConfigured };
