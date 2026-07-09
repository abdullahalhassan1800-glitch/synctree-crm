const mongoose = require('mongoose');

const leadStageSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  order: { type: Number, required: true },
  color: { type: String, default: '#1890ff' },
  probability: { type: Number, default: 0 },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('LeadStage', leadStageSchema);
