const jwt = require('jsonwebtoken');
const config = require('../config');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.roleName },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const paginate = (page = 1, limit = 20) => {
  const p = Math.max(1, parseInt(page));
  const l = Math.min(100, Math.max(1, parseInt(limit)));
  return { skip: (p - 1) * l, limit: l, page: p };
};

const buildFilter = (query, allowedFields = []) => {
  const filter = {};
  for (const [key, value] of Object.entries(query)) {
    if (allowedFields.includes(key) && value !== undefined && value !== null && value !== '') {
      if (typeof value === 'string' && value.includes(',')) {
        filter[key] = { $in: value.split(',') };
      } else {
        filter[key] = value;
      }
    }
  }
  return filter;
};

const buildSearchFilter = (searchTerm, fields = []) => {
  if (!searchTerm) return {};
  const regex = new RegExp(searchTerm, 'i');
  return {
    $or: fields.map(field => ({ [field]: regex })),
  };
};

module.exports = { generateToken, generateOTP, paginate, buildFilter, buildSearchFilter };
