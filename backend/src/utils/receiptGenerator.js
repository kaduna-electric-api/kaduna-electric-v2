const PDFDocument = require('pdfkit');

const generateReceipt = (doc, transaction, user) => {
  const pageWidth = doc.page.width;

  // Header
  doc.fontSize(24).fillColor('#1a365d').text('KADUNA ELECTRIC', 50, 50, { align: 'center' });
  doc.fontSize(14).fillColor('#4a5568').text('Electricity Token Receipt', 50, 80, { align: 'center' });
  doc.moveTo(50, 110).lineTo(pageWidth - 50, 110).stroke('#e2e8f0');

  // Receipt Info
  doc.fontSize(10).fillColor('#718096');
  doc.text(`Transaction ID: ${transaction.transactionRef}`, 50, 130);
  doc.text(`Date: ${new Date(transaction.createdAt).toLocaleString('en-NG')}`, 50, 145);
  doc.text(`Payment Method: ${transaction.paymentMethod.toUpperCase()}`, 50, 160);

  // Customer Info
  doc.fontSize(12).fillColor('#1a365d').text('Customer Information', 50, 190);
  doc.fontSize(10).fillColor('#4a5568');
  doc.text(`Name: ${user.getFullName()}`, 50, 210);
  doc.text(`Email: ${user.email}`, 50, 225);
  doc.text(`Phone: ${user.phone || 'N/A'}`, 50, 240);

  // Token Details Box
  doc.rect(50, 270, pageWidth - 100, 140).fill('#f7fafc').stroke('#e2e8f0');
  doc.fillColor('#1a365d').fontSize(12).text('Token Details', 70, 285);
  doc.fontSize(10).fillColor('#4a5568');
  doc.text(`Meter Number: ${transaction.meterNumber}`, 70, 305);
  doc.text(`Amount Paid: ₦${transaction.amount.toLocaleString()}`, 70, 320);
  doc.text(`Units: ${transaction.units} kWh`, 70, 335);
  doc.fontSize(14).fillColor('#2b6cb0').text(`Token: ${transaction.token}`, 70, 360);

  // Footer
  doc.fontSize(9).fillColor('#a0aec0').text(
    'This is an official receipt from Kaduna Electric. Keep it safe for your records.',
    50, 450, { align: 'center', width: pageWidth - 100 }
  );
  doc.text('For support, contact support@kadunaelectric.com', 50, 465, { align: 'center' });

  doc.end();
};

module.exports = { generateReceipt };
