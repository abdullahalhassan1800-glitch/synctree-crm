const mongoose = require('mongoose');

const automationLogSchema = new mongoose.Schema({
  workflow: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true },
  trigger: {
    event: String,
    module: String,
    recordId: { type: mongoose.Schema.Types.ObjectId },
  },
  conditionsMet: { type: Boolean, default: true },
  actionsExecuted: [{
    type: String,
    status: { type: String, enum: ['success', 'failed', 'skipped'], default: 'success' },
    message: String,
    executedAt: Date,
  }],
  status: { type: String, enum: ['success', 'partial', 'failed'], default: 'success' },
  executedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  executedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('AutomationLog', automationLogSchema);
