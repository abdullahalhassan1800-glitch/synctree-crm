const mongoose = require('mongoose');

const customFieldSchema = new mongoose.Schema({
  module: { type: String, enum: ['lead', 'contact', 'deal', 'ticket'], required: true },
  label: { type: String, required: true, trim: true },
  key: { type: String, required: true, trim: true },
  type: { type: String, enum: ['text', 'number', 'date', 'select', 'multiselect', 'boolean', 'email', 'phone', 'url'], default: 'text' },
  options: [{ type: String }],
  required: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

customFieldSchema.index({ module: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('CustomField', customFieldSchema);
