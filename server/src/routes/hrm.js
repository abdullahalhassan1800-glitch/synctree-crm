const router = require('express').Router();
const { auth, authorize } = require('../middleware/auth');
const employeeController = require('../controllers/employeeController');
const attendanceController = require('../controllers/attendanceController');
const leaveController = require('../controllers/leaveController');

// Employees
router.get('/employees', auth, employeeController.getEmployees);
router.post('/employees', auth, authorize('admin', 'hr'), employeeController.createEmployee);
router.get('/employees/:id', auth, employeeController.getEmployee);
router.put('/employees/:id', auth, authorize('admin', 'hr'), employeeController.updateEmployee);
router.delete('/employees/:id', auth, authorize('admin'), employeeController.deleteEmployee);

// Attendance
router.get('/attendance', auth, attendanceController.getAttendance);
router.post('/attendance/checkin', auth, attendanceController.checkIn);
router.post('/attendance/checkout', auth, attendanceController.checkOut);

// Leaves
router.get('/leaves', auth, leaveController.getLeaves);
router.post('/leaves', auth, leaveController.createLeave);
router.put('/leaves/:id/approve', auth, authorize('admin', 'manager', 'hr'), leaveController.approveLeave);

module.exports = router;
