const Employee = require('../models/Employee');
const User = require('../models/User');
const { paginate, buildSearchFilter } = require('../utils/helpers');

exports.getEmployees = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, department, status, sort = '-createdAt' } = req.query;
    const { skip, limit: pageLimit, page: pageNum } = paginate(page, limit);
    let filter = {};
    if (search) filter = { ...filter, ...buildSearchFilter(search, ['employeeId', 'department', 'designation']) };
    if (department) filter.department = department;
    if (status) filter.status = status;

    const sortObj = {};
    if (sort.startsWith('-')) sortObj[sort.substring(1)] = -1;
    else sortObj[sort] = 1;

    const [employees, total] = await Promise.all([
      Employee.find(filter)
        .populate('user', 'name email phone roleName isActive avatar')
        .sort(sortObj).skip(skip).limit(pageLimit),
      Employee.countDocuments(filter),
    ]);
    res.json({ employees, pagination: { page: pageNum, limit: pageLimit, total, pages: Math.ceil(total / pageLimit) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const { userId, employeeId, department, designation, doj, salary, ...rest } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const existing = await Employee.findOne({ user: userId });
    if (existing) return res.status(400).json({ message: 'Employee record already exists for this user' });

    const employee = await Employee.create({
      user: userId,
      employeeId: employeeId || `EMP${Date.now().toString().slice(-6)}`,
      department: department || user.department,
      designation: designation || user.designation,
      doj, salary, ...rest,
    });

    const populated = await Employee.findById(employee._id).populate('user', 'name email phone');
    res.status(201).json({ employee: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('user', 'name email phone roleName isActive avatar');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json({ employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('user', 'name email phone');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json({ employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
