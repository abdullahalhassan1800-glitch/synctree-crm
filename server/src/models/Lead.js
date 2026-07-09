const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, default: '', trim: true },
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  company: { type: String, default: '' },
  position: { type: String, default: '' },
  source: { type: String, default: 'manual' },
  status: { type: String, default: 'new' },
  stage: { type: mongoose.Schema.Types.ObjectId, ref: 'LeadStage' },
  stageName: { type: String, default: 'new' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  score: { type: Number, default: 0 },
  tags: [{ type: String }],
  customFields: { type: Map, of: String, default: {} },
  notes: { type: String, default: '' },
  convertedToContact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  convertedToDeal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  isConverted: { type: Boolean, default: false },
  lastActivityAt: { type: Date },
  expectedCloseDate: { type: Date },
  budget: { type: Number },
}, { timestamps: true });

leadSchema.index({ email: 1 });
leadSchema.index({ phone: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ stageName: 1 });
leadSchema.index({ status: 1 });

module.exports = mongoose.model('Lead', leadSchema);
