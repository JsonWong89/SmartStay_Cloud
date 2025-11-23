require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { sendBookingEmail, sendPaymentInvoiceEmail, sendCheckinEmail } = require('./emailService');

const app = express();
app.use(bodyParser.json());
app.use(require('cors')());

// expose local assets (logo) so templates can load it (optional)
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Health
app.get('/', (req, res) => res.send('Email backend running'));

// Send booking receipt
app.post('/api/email/booking-receipt', async (req, res) => {
  try {
    const { to, booking } = req.body;
    await sendBookingEmail(to, booking);
    res.json({ ok: true, message: 'Booking receipt sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Send payment invoice
app.post('/api/email/payment-invoice', async (req, res) => {
  try {
    const { to, invoice } = req.body;
    await sendPaymentInvoiceEmail(to, invoice);
    res.json({ ok: true, message: 'Payment invoice sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Send check-in confirmation
app.post('/api/email/checkin-confirm', async (req, res) => {
  try {
    const { to, booking } = req.body;
    await sendCheckinEmail(to, booking);
    res.json({ ok:true, message: 'Check-in confirmation sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok:false, error: err.message });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
