const mongoose = require('mongoose');

const leadActivitySchema = new mongoose.Schema({
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  type: { type: String, enum: ['call', 'email', 'meeting', 'note', 'task', 'system', 'whatsapp'], required: true },
  subject: { type: String, default: '' },
  description: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: { type: Map, of: String, default: {} },
  dueDate: { type: Date },
  completedAt: { type: Date },
  isCompleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('LeadActivity', leadActivitySchema);
