const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  employeeId: { type: String, unique: true },
  department: { type: String, default: '' },
  designation: { type: String, default: '' },
  doj: { type: Date },
  dol: { type: Date },
  salary: { type: Number, default: 0 },
  bankAccount: { type: String, default: '' },
  panCard: { type: String, default: '' },
  aadhaar: { type: String, default: '' },
  emergencyContact: { type: String, default: '' },
  documents: [{ name: String, url: String }],
  status: { type: String, enum: ['active', 'inactive', 'terminated'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
