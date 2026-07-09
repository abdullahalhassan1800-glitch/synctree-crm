const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  deal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  value: { type: Number, default: 0 },
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, enum: ['draft', 'active', 'expired', 'terminated'], default: 'draft' },
  terms: { type: String, default: '' },
  attachments: [{ type: String }],
  signedBy: { type: String, default: '' },
  signedAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Contract', contractSchema);
