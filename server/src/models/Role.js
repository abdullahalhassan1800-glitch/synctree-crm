const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  module: { type: String, required: true },
  canCreate: { type: Boolean, default: false },
  canRead: { type: Boolean, default: true },
  canUpdate: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
});

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  isSystem: { type: Boolean, default: false },
  permissions: [permissionSchema],
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
