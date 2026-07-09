const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  type: { type: String, enum: ['call', 'email', 'meeting', 'note', 'chat', 'other'], required: true },
  subject: { type: String, default: '' },
  description: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: { type: Map, of: String, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('Interaction', interactionSchema);
