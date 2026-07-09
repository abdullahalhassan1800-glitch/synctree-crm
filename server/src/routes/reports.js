const router = require('express').Router();
const { auth } = require('../middleware/auth');
const Lead = require('../models/Lead');
const Contact = require('../models/Contact');
const Deal = require('../models/Deal');
const Ticket = require('../models/Ticket');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const User = require('../models/User');
const LeadStage = require('../models/LeadStage');

router.get('/dashboard', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const now = new Date();
    const prevStart = new Date(now);
    const prevEnd = new Date(now);
    if (startDate && endDate) {
      const diff = new Date(endDate) - new Date(startDate);
      prevStart.setTime(new Date(startDate) - diff);
      prevEnd.setTime(new Date(startDate) - 86400000);
    } else {
      prevStart.setMonth(prevStart.getMonth() - 1);
      prevEnd.setDate(prevEnd.getDate() - 1);
    }
    const prevFilter = { createdAt: { $gte: prevStart, $lte: prevEnd } };

    const [
      totalLeads, leadsByStage, totalContacts, totalDeals, dealsByStatus,
      totalTickets, openTickets, totalUsers, totalEmployees,
      leadTrend, prevLeads, prevContacts, prevDeals, leadsConverted,
      sourceBreakdown,
    ] = await Promise.all([
      Lead.countDocuments(dateFilter),
      Lead.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$stageName', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Contact.countDocuments(dateFilter),
      Deal.countDocuments(dateFilter),
      Deal.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 }, value: { $sum: '$value' } } },
      ]),
      Ticket.countDocuments(dateFilter),
      Ticket.countDocuments({ ...dateFilter, status: { $in: ['open', 'in_progress'] } }),
      User.countDocuments({ isActive: true }),
      Employee.countDocuments({ status: 'active' }),
      Lead.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 90 },
      ]),
      Lead.countDocuments(prevFilter),
      Contact.countDocuments(prevFilter),
      Deal.countDocuments(prevFilter),
      Lead.countDocuments({ ...dateFilter, stageName: 'Closed Won' }),
      Lead.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const stages = await LeadStage.find().sort({ order: 1 });
    const stageMap = {};
    stages.forEach(s => { stageMap[s.name] = s.color; });

    const pipelineChart = leadsByStage.map(item => ({
      name: item._id,
      count: item.count,
      color: stageMap[item._id] || '#1890ff',
    }));

    const dealValue = dealsByStatus.reduce((acc, item) => {
      acc[item._id] = { count: item.count, value: item.value };
      return acc;
    }, {});

    const recentLeads = await Lead.find(dateFilter)
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 }).limit(5);

    const calcTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    res.json({
      stats: {
        totalLeads, totalContacts, totalDeals, totalTickets,
        openTickets, totalUsers, totalEmployees,
        wonDeals: dealValue.won?.count || 0,
        wonValue: dealValue.won?.value || 0,
        pipelineValue: dealValue.open?.value || 0,
        prevLeads, prevContacts, prevDeals,
        leadTrend: calcTrend(totalLeads, prevLeads),
        contactTrend: calcTrend(totalContacts, prevContacts),
        dealTrend: calcTrend(totalDeals, prevDeals),
        conversionRate: totalLeads > 0 ? Math.round((leadsConverted / totalLeads) * 100) : 0,
      },
      charts: {
        pipelineChart,
        dealsByStatus,
        leadTrend: leadTrend.map(d => ({ date: d._id, leads: d.count })),
        sourceChart: sourceBreakdown.map(s => ({ name: s._id, value: s.count })),
      },
      recentLeads,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
