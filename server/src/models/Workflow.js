const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  module: { type: String, enum: ['lead', 'contact', 'deal', 'ticket'], required: true },
  trigger: {
    event: { type: String, required: true },
    conditions: [{
      field: String,
      operator: { type: String, enum: ['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty'] },
      value: String,
    }],
  },
  actions: [{
    type: { type: String, enum: ['send_email', 'send_sms', 'create_task', 'update_field', 'assign_user', 'webhook', 'whatsapp'] },
    config: { type: Map, of: String, default: {} },
  }],
  status: { type: String, enum: ['active', 'inactive', 'draft'], default: 'draft' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Workflow', workflowSchema);
