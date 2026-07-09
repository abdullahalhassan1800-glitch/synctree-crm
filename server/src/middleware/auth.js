const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id).populate('role');
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (allowedRoles.includes(req.user.roleName)) {
      return next();
    }
    if (req.user.roleName === 'super_admin') {
      return next();
    }
    return res.status(403).json({ message: 'Insufficient permissions' });
  };
};

const checkPermission = (module, action) => {
  return (req, res, next) => {
    if (req.user.roleName === 'super_admin') {
      return next();
    }
    const role = req.user.role;
    if (!role) {
      return res.status(403).json({ message: 'No role assigned' });
    }
    const permission = role.permissions.find(p => p.module === module);
    if (!permission || !permission[action]) {
      return res.status(403).json({ message: `Insufficient permissions for ${action} on ${module}` });
    }
    next();
  };
};

module.exports = { auth, authorize, checkPermission };
