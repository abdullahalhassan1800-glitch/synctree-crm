const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, default: '' },
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  company: { type: String, default: '' },
  position: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  country: { type: String, default: '' },
  zip: { type: String, default: '' },
  website: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  source: { type: String, default: 'manual' },
  segments: [{ type: String }],
  tags: [{ type: String }],
  notes: { type: String, default: '' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  convertedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  customFields: { type: Map, of: String, default: {} },
}, { timestamps: true });

contactSchema.index({ email: 1 });
contactSchema.index({ phone: 1 });
contactSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Contact', contactSchema);
