const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

exports.getAttendance = async (req, res) => {
  try {
    const { startDate, endDate, employee, page = 1, limit = 50, status } = req.query;
    const filter = {};
    if (employee) filter.employee = employee;
    if (status) filter.status = status;
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const records = await Attendance.find(filter)
      .populate({ path: 'employee', populate: { path: 'user', select: 'name email' } })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Attendance.countDocuments(filter);
    res.json({ records, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkIn = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.status(404).json({ message: 'Employee record not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await Attendance.findOne({ employee: employee._id, date: today });
    if (existing && existing.checkIn) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    let lateMinutes = 0;
    const officeStart = new Date(today);
    officeStart.setHours(9, 30, 0, 0);
    if (new Date() > officeStart) {
      lateMinutes = Math.round((new Date() - officeStart) / 60000);
    }

    const record = existing
      ? await Attendance.findByIdAndUpdate(existing._id, { checkIn: new Date(), status: lateMinutes > 15 ? 'late' : 'present' }, { new: true })
      : await Attendance.create({
          employee: employee._id,
          date: today,
          checkIn: new Date(),
          status: lateMinutes > 15 ? 'late' : 'present',
        });

    const populated = await Attendance.findById(record._id).populate({ path: 'employee', populate: { path: 'user', select: 'name' } });
    res.json({ record: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) return res.status(404).json({ message: 'Employee record not found' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const record = await Attendance.findOne({ employee: employee._id, date: today });
    if (!record) return res.status(400).json({ message: 'Not checked in today' });
    if (record.checkOut) return res.status(400).json({ message: 'Already checked out today' });

    record.checkOut = new Date();
    await record.save();
    const populated = await Attendance.findById(record._id).populate({ path: 'employee', populate: { path: 'user', select: 'name' } });
    res.json({ record: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
