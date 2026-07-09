const Contact = require('../models/Contact');
const { paginate, buildSearchFilter } = require('../utils/helpers');

exports.getContacts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, sort = '-createdAt' } = req.query;
    const { skip, limit: pageLimit, page: pageNum } = paginate(page, limit);

    let filter = {};
    if (search) {
      filter = { ...filter, ...buildSearchFilter(search, ['firstName', 'lastName', 'email', 'phone', 'company']) };
    }

    const sortObj = {};
    if (sort.startsWith('-')) sortObj[sort.substring(1)] = -1;
    else sortObj[sort] = 1;

    const [contacts, total] = await Promise.all([
      Contact.find(filter)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name')
        .sort(sortObj)
        .skip(skip)
        .limit(pageLimit),
      Contact.countDocuments(filter),
    ]);

    res.json({
      contacts,
      pagination: { page: pageNum, limit: pageLimit, total, pages: Math.ceil(total / pageLimit) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createContact = async (req, res) => {
  try {
    const contact = await Contact.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ contact });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .populate('convertedFrom');
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json({ contact });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json({ contact });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact not found' });
    res.json({ message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.convertLeadToContact = async (req, res) => {
  try {
    const Lead = require('../models/Lead');
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const existingContact = await Contact.findOne({ email: lead.email });
    if (existingContact) {
      return res.status(400).json({ message: 'Contact with this email already exists' });
    }

    const contact = await Contact.create({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      source: lead.source,
      assignedTo: lead.assignedTo,
      createdBy: req.user._id,
      convertedFrom: lead._id,
    });

    lead.convertedToContact = contact._id;
    lead.isConverted = true;
    lead.status = 'converted';
    await lead.save();

    res.status(201).json({ contact, lead });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
