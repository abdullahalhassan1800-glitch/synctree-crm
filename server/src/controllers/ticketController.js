const Ticket = require('../models/Ticket');
const { paginate, buildSearchFilter } = require('../utils/helpers');

exports.getTickets = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, priority, sort = '-createdAt' } = req.query;
    const { skip, limit: pageLimit, page: pageNum } = paginate(page, limit);
    let filter = {};
    if (search) filter = { ...filter, ...buildSearchFilter(search, ['subject', 'description']) };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const sortObj = {};
    if (sort.startsWith('-')) sortObj[sort.substring(1)] = -1;
    else sortObj[sort] = 1;

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .populate('contact', 'firstName lastName email')
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name')
        .sort(sortObj).skip(skip).limit(pageLimit),
      Ticket.countDocuments(filter),
    ]);
    res.json({ tickets, pagination: { page: pageNum, limit: pageLimit, total, pages: Math.ceil(total / pageLimit) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTicket = async (req, res) => {
  try {
    const count = await Ticket.countDocuments();
    const ticketId = `TCK-${String(count + 1).padStart(5, '0')}`;
    const ticket = await Ticket.create({ ...req.body, ticketId, createdBy: req.user._id });
    res.status(201).json({ ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('contact', 'firstName lastName email phone')
      .populate('lead', 'firstName lastName')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json({ ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.status === 'resolved') updates.resolvedAt = new Date();
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json({ ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json({ message: 'Ticket deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
