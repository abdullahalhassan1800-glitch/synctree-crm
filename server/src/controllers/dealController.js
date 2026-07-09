const Deal = require('../models/Deal');
const { paginate, buildSearchFilter } = require('../utils/helpers');

exports.getDeals = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, stage, status, sort = '-createdAt' } = req.query;
    const { skip, limit: pageLimit, page: pageNum } = paginate(page, limit);
    let filter = {};
    if (search) filter = { ...filter, ...buildSearchFilter(search, ['title']) };
    if (stage) filter.stage = stage;
    if (status) filter.status = status;
    if (req.user.roleName === 'sales_rep') filter.assignedTo = req.user._id;

    const sortObj = {};
    if (sort.startsWith('-')) sortObj[sort.substring(1)] = -1;
    else sortObj[sort] = 1;

    const [deals, total] = await Promise.all([
      Deal.find(filter)
        .populate('contact', 'firstName lastName company')
        .populate('assignedTo', 'name email')
        .sort(sortObj).skip(skip).limit(pageLimit),
      Deal.countDocuments(filter),
    ]);
    res.json({ deals, pagination: { page: pageNum, limit: pageLimit, total, pages: Math.ceil(total / pageLimit) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createDeal = async (req, res) => {
  try {
    const deal = await Deal.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ deal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('contact', 'firstName lastName email phone company')
      .populate('lead', 'firstName lastName')
      .populate('assignedTo', 'name email');
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    res.json({ deal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateDeal = async (req, res) => {
  try {
    const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    res.json({ deal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    res.json({ message: 'Deal deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
