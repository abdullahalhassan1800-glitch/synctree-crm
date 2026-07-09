const router = require('express').Router();
const { auth, authorize } = require('../middleware/auth');
const CustomField = require('../models/CustomField');

const smtpConfig = {
  host: process.env.SMTP_HOST || '',
  port: parseInt(process.env.SMTP_PORT || '587'),
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
  fromEmail: process.env.SMTP_FROM || '',
  fromName: process.env.SMTP_FROM_NAME || '',
  secure: process.env.SMTP_SECURE === 'true',
};

router.get('/custom-fields/:module', auth, async (req, res) => {
  try {
    const fields = await CustomField.find({ module: req.params.module, isActive: true }).sort({ order: 1 });
    res.json({ fields });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/custom-fields', auth, authorize('admin'), async (req, res) => {
  try {
    const field = await CustomField.create(req.body);
    res.status(201).json({ field });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/custom-fields/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const field = await CustomField.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!field) return res.status(404).json({ message: 'Field not found' });
    res.json({ field });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/custom-fields/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const field = await CustomField.findByIdAndDelete(req.params.id);
    if (!field) return res.status(404).json({ message: 'Field not found' });
    res.json({ message: 'Field deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/smtp', auth, authorize('admin'), (req, res) => {
  res.json({
    smtp: {
      host: smtpConfig.host,
      port: smtpConfig.port,
      user: smtpConfig.user,
      fromEmail: smtpConfig.fromEmail,
      fromName: smtpConfig.fromName,
      secure: smtpConfig.secure,
    },
  });
});

router.put('/smtp', auth, authorize('admin'), (req, res) => {
  try {
    const { host, port, user, pass, fromEmail, fromName, secure } = req.body;
    smtpConfig.host = host || smtpConfig.host;
    smtpConfig.port = port || smtpConfig.port;
    smtpConfig.user = user || smtpConfig.user;
    if (pass) smtpConfig.pass = pass;
    smtpConfig.fromEmail = fromEmail || smtpConfig.fromEmail;
    smtpConfig.fromName = fromName || smtpConfig.fromName;
    smtpConfig.secure = secure !== undefined ? secure : smtpConfig.secure;
    res.json({ message: 'SMTP settings updated', smtp: { host: smtpConfig.host, port: smtpConfig.port, user: smtpConfig.user, fromEmail: smtpConfig.fromEmail, fromName: smtpConfig.fromName, secure: smtpConfig.secure } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
