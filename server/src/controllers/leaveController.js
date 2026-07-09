const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

exports.getLeaves = async (req, res) => {
  try {
    const { status, type, employee, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (employee) filter.employee = employee;

    const leaves = await Leave.find(filter)
      .populate({ path: 'employee', populate: { path: 'user', select: 'name email' } })
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Leave.countDocuments(filter);
    res.json({ leaves, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createLeave = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.status(404).json({ message: 'Employee record not found' });

    const { startDate, endDate, type, reason } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const leave = await Leave.create({
      employee: employee._id,
      type, startDate: start, endDate: end, reason, totalDays,
    });
    const populated = await Leave.findById(leave._id)
      .populate({ path: 'employee', populate: { path: 'user', select: 'name' } });
    res.status(201).json({ leave: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveLeave = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }
    const leave = await Leave.findByIdAndUpdate(req.params.id, {
      status,
      approvedBy: req.user._id,
      approvedAt: new Date(),
      rejectionReason: status === 'rejected' ? (rejectionReason || '') : '',
    }, { new: true })
      .populate({ path: 'employee', populate: { path: 'user', select: 'name' } })
      .populate('approvedBy', 'name');
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    res.json({ leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
