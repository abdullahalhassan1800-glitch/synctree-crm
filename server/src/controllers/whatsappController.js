const WhatsAppMessage = require('../models/WhatsAppMessage');
const { paginate } = require('../utils/helpers');

exports.getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20, lead, contact, direction, status } = req.query;
    const { skip, limit: pageLimit, page: pageNum } = paginate(page, limit);
    const filter = {};
    if (lead) filter.lead = lead;
    if (contact) filter.contact = contact;
    if (direction) filter.direction = direction;
    if (status) filter.status = status;

    const messages = await WhatsAppMessage.find(filter)
      .populate('lead', 'firstName lastName phone')
      .populate('contact', 'firstName lastName phone')
      .populate('sentBy', 'name')
      .sort({ createdAt: -1 }).skip(skip).limit(pageLimit);
    const total = await WhatsAppMessage.countDocuments(filter);
    res.json({ messages, pagination: { page: pageNum, limit: pageLimit, total, pages: Math.ceil(total / pageLimit) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { lead, contact, body, templateName, mediaUrl } = req.body;
    if (!body && !templateName) {
      return res.status(400).json({ message: 'Message body or template is required' });
    }
    const message = await WhatsAppMessage.create({
      lead, contact,
      direction: 'out',
      body: body || '',
      templateName: templateName || '',
      mediaUrl: mediaUrl || '',
      status: 'sent',
      sentBy: req.user._id,
    });
    const populated = await WhatsAppMessage.findById(message._id)
      .populate('lead', 'firstName lastName phone')
      .populate('contact', 'firstName lastName phone');
    res.status(201).json({ message: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
