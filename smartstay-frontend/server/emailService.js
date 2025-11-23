require('dotenv').config();
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function renderTemplate(filename, data) {
  const filePath = path.join(__dirname, 'templates', filename);
  return ejs.renderFile(filePath, data);
}

async function sendMail(to, subject, html) {
  const info = await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html,
  });
  console.log('Message sent:', info.messageId);
  return info;
}

/* Exports for the three templates */

async function sendBookingEmail(to, booking) {
  const html = await renderTemplate('bookingReceipt.ejs', { booking, LOGO_URL: process.env.LOGO_URL });
  return sendMail(to, `Booking Receipt — ${booking.BookingNo || booking.BookingID}`, html);
}

async function sendPaymentInvoiceEmail(to, invoice) {
  const html = await renderTemplate('paymentInvoice.ejs', { invoice, LOGO_URL: process.env.LOGO_URL });
  return sendMail(to, `Payment Invoice — ${invoice.invoiceNo || invoice.bookingId}`, html);
}

async function sendCheckinEmail(to, booking) {
  const html = await renderTemplate('checkinConfirmation.ejs', { booking, LOGO_URL: process.env.LOGO_URL });
  return sendMail(to, `Check-in Confirmation — ${booking.RoomNumber}`, html);
}

module.exports = {
  sendBookingEmail,
  sendPaymentInvoiceEmail,
  sendCheckinEmail,
};
