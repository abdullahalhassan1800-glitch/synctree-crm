const Role = require('../models/Role');
const User = require('../models/User');

exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ name: 1 });
    res.json({ roles });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    const existing = await Role.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Role already exists' });
    }
    const role = await Role.create({ name, description, permissions });
    res.status(201).json({ role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.json({ role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    if (role.isSystem) {
      return res.status(400).json({ message: 'Cannot delete system role' });
    }
    const usersCount = await User.countDocuments({ role: role._id });
    if (usersCount > 0) {
      return res.status(400).json({ message: `Role is assigned to ${usersCount} users` });
    }
    await Role.findByIdAndDelete(req.params.id);
    res.json({ message: 'Role deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().populate('role').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, roleName, isActive, department, designation } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;
    if (department) updates.department = department;
    if (designation) updates.designation = designation;
    if (isActive !== undefined) updates.isActive = isActive;
    if (roleName) {
      const role = await Role.findOne({ name: roleName });
      if (role) {
        updates.role = role._id;
        updates.roleName = roleName;
      }
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).populate('role');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
