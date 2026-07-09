const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, unique: true },
  subject: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: { type: String, default: '' },
  slaDeadline: { type: Date },
  resolvedAt: { type: Date },
  attachments: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
