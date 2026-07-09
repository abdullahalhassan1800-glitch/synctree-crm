const User = require('../models/User');
const Role = require('../models/Role');
const LeadStage = require('../models/LeadStage');
const config = require('../config');
const { generateToken } = require('../utils/helpers');

const seedDefaultData = async () => {
  try {
    const roleCount = await Role.countDocuments();
    if (roleCount === 0) {
      const roles = [
        { name: 'super_admin', description: 'Full system access', isSystem: true, permissions: [] },
        { name: 'admin', description: 'Administrative access', isSystem: true, permissions: [] },
        { name: 'manager', description: 'Team manager', isSystem: true, permissions: [] },
        { name: 'sales_rep', description: 'Sales representative', isSystem: true, permissions: [] },
        { name: 'support', description: 'Customer support', isSystem: true, permissions: [] },
        { name: 'hr', description: 'Human resources', isSystem: true, permissions: [] },
      ];

      const modules = ['leads', 'contacts', 'deals', 'tickets', 'contracts', 'employees', 'attendance', 'leaves', 'workflows', 'reports', 'settings', 'whatsapp'];

      const allRoles = [];
      for (const roleData of roles) {
        const permissions = modules.map(m => ({
          module: m,
          canCreate: roleData.name === 'super_admin' || roleData.name === 'admin',
          canRead: true,
          canUpdate: roleData.name === 'super_admin' || roleData.name === 'admin',
          canDelete: roleData.name === 'super_admin',
        }));
        allRoles.push(await Role.create({ ...roleData, permissions }));
      }
      console.log('Default roles created');
    }

    const stageCount = await LeadStage.countDocuments();
    if (stageCount === 0) {
      const stages = [
        { name: 'New', order: 1, color: '#1890ff', probability: 10, isDefault: true },
        { name: 'Contacted', order: 2, color: '#722ed1', probability: 20 },
        { name: 'Qualified', order: 3, color: '#13c2c2', probability: 40 },
        { name: 'Proposal', order: 4, color: '#fa8c16', probability: 60 },
        { name: 'Negotiation', order: 5, color: '#f5222d', probability: 80 },
        { name: 'Closed Won', order: 6, color: '#52c41a', probability: 100 },
        { name: 'Closed Lost', order: 7, color: '#d9d9d9', probability: 0 },
      ];
      await LeadStage.insertMany(stages);
      console.log('Default lead stages created');
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const bcrypt = require('bcryptjs');
      const superAdminRole = await Role.findOne({ name: 'super_admin' });
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Super Admin',
        email: 'admin@synctree.com',
        password: hashedPassword,
        role: superAdminRole._id,
        roleName: 'super_admin',
        emailVerified: true,
      });
      console.log('Default admin user created (admin@synctree.com / admin123)');
    }
  } catch (error) {
    console.error('Seed error:', error.message);
  }
};

module.exports = seedDefaultData;
