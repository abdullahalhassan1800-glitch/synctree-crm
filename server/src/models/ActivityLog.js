const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  module: { type: String, required: true },
  recordId: { type: mongoose.Schema.Types.ObjectId },
  description: { type: String, default: '' },
  ip: { type: String, default: '' },
  metadata: { type: Map, of: String, default: {} },
}, { timestamps: true });

activityLogSchema.index({ module: 1, recordId: 1 });
activityLogSchema.index({ user: 1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
