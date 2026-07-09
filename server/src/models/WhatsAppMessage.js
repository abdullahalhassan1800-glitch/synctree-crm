const mongoose = require('mongoose');

const whatsappMessageSchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  direction: { type: String, enum: ['in', 'out'], required: true },
  templateName: { type: String, default: '' },
  body: { type: String, required: true },
  mediaUrl: { type: String, default: '' },
  status: { type: String, enum: ['sent', 'delivered', 'read', 'failed'], default: 'sent' },
  wamId: { type: String },
  sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: { type: Map, of: String, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('WhatsAppMessage', whatsappMessageSchema);
