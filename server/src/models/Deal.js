const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  value: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  stage: { type: mongoose.Schema.Types.ObjectId, ref: 'LeadStage' },
  stageName: { type: String, default: 'new' },
  probability: { type: Number, default: 0 },
  expectedCloseDate: { type: Date },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String, default: '' },
  tags: [{ type: String }],
  products: [{
    name: String,
    quantity: Number,
    price: Number,
  }],
  status: { type: String, enum: ['open', 'won', 'lost'], default: 'open' },
  lostReason: { type: String, default: '' },
  closedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Deal', dealSchema);
