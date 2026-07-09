const Lead = require('../models/Lead');
const LeadActivity = require('../models/LeadActivity');
const LeadStage = require('../models/LeadStage');
const { paginate, buildFilter, buildSearchFilter } = require('../utils/helpers');

exports.getStages = async (req, res) => {
  try {
    const stages = await LeadStage.find().sort({ order: 1 });
    res.json({ stages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStages = async (req, res) => {
  try {
    const { stages } = req.body;
    await LeadStage.deleteMany({});
    const newStages = await LeadStage.insertMany(stages);
    res.json({ stages: newStages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLeads = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, stage, source, assignedTo, status, sort = '-createdAt', startDate, endDate, minScore, maxScore, tags } = req.query;
    const { skip, limit: pageLimit, page: pageNum } = paginate(page, limit);

    let filter = {};
    if (req.user.roleName === 'sales_rep') {
      filter.assignedTo = req.user._id;
    }
    const allowedFields = ['stage', 'source', 'assignedTo', 'status', 'stageName'];
    filter = { ...filter, ...buildFilter(req.query, allowedFields) };

    if (search) {
      filter = { ...filter, ...buildSearchFilter(search, ['firstName', 'lastName', 'email', 'phone', 'company']) };
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (minScore || maxScore) {
      filter.score = {};
      if (minScore) filter.score.$gte = parseInt(minScore);
      if (maxScore) filter.score.$lte = parseInt(maxScore);
    }
    if (tags) {
      filter.tags = { $in: tags.split(',') };
    }

    const sortObj = {};
    if (sort.startsWith('-')) {
      sortObj[sort.substring(1)] = -1;
    } else {
      sortObj[sort] = 1;
    }

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name')
        .sort(sortObj)
        .skip(skip)
        .limit(pageLimit),
      Lead.countDocuments(filter),
    ]);

    const stages = await LeadStage.find().sort({ order: 1 });

    res.json({
      leads,
      stages,
      pagination: {
        page: pageNum,
        limit: pageLimit,
        total,
        pages: Math.ceil(total / pageLimit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createLead = async (req, res) => {
  try {
    const leadData = { ...req.body, createdBy: req.user._id };
    if (!leadData.stage) {
      const defaultStage = await LeadStage.findOne({ isDefault: true }).sort({ order: 1 });
      if (defaultStage) {
        leadData.stage = defaultStage._id;
        leadData.stageName = defaultStage.name;
      }
    }
    const lead = await Lead.create(leadData);
    await LeadActivity.create({
      lead: lead._id,
      type: 'system',
      subject: 'Lead Created',
      description: `Lead created by ${req.user.name}`,
      createdBy: req.user._id,
    });
    const { processTrigger } = require('../services/automationEngine');
    processTrigger({ event: 'created', module: 'lead', recordId: lead._id, user: req.user._id });
    res.status(201).json({ lead });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email phone')
      .populate('createdBy', 'name')
      .populate('convertedToContact')
      .populate('convertedToDeal');
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    const activities = await LeadActivity.find({ lead: lead._id })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ lead, activities });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    if (req.body.stageName) {
      await LeadActivity.create({
        lead: lead._id,
        type: 'system',
        subject: 'Stage Changed',
        description: `Stage changed to ${req.body.stageName}`,
        createdBy: req.user._id,
      });
    }
    if (req.body.stageName) {
      const { processTrigger } = require('../services/automationEngine');
      processTrigger({ event: 'stage_changed', module: 'lead', recordId: lead._id, user: req.user._id });
    }
    res.json({ lead });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    await LeadActivity.deleteMany({ lead: lead._id });
    res.json({ message: 'Lead deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addActivity = async (req, res) => {
  try {
    const activity = await LeadActivity.create({
      ...req.body,
      lead: req.params.id,
      createdBy: req.user._id,
    });
    await Lead.findByIdAndUpdate(req.params.id, { lastActivityAt: new Date() });
    const populated = await LeadActivity.findById(activity._id).populate('createdBy', 'name');
    res.status(201).json({ activity: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.assignLead = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const lead = await Lead.findByIdAndUpdate(req.params.id, { assignedTo }, { new: true })
      .populate('assignedTo', 'name email');
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    await LeadActivity.create({
      lead: lead._id,
      type: 'system',
      subject: 'Lead Assigned',
      description: `Assigned to ${lead.assignedTo?.name || 'Unknown'}`,
      createdBy: req.user._id,
    });
    res.json({ lead });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateLeadStage = async (req, res) => {
  try {
    const { stageId, stageName } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { stage: stageId, stageName },
      { new: true }
    );
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    await LeadActivity.create({
      lead: lead._id,
      type: 'system',
      subject: 'Stage Changed',
      description: `Stage changed to ${stageName}`,
      createdBy: req.user._id,
    });
    res.json({ lead });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.exportLeads = async (req, res) => {
  try {
    const { format = 'csv', stage, source, assignedTo, status, search, startDate, endDate } = req.query;
    let filter = {};
    if (req.user.roleName === 'sales_rep') {
      filter.assignedTo = req.user._id;
    }
    const allowedFields = ['stage', 'source', 'assignedTo', 'status', 'stageName'];
    filter = { ...filter, ...buildFilter(req.query, allowedFields) };
    if (search) filter = { ...filter, ...buildSearchFilter(search, ['firstName', 'lastName', 'email', 'phone', 'company']) };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      const headers = 'First Name,Last Name,Email,Phone,Company,Source,Stage,Score,Assigned To,Created At\n';
      const rows = leads.map(l =>
        `"${l.firstName}","${l.lastName || ''}","${l.email || ''}","${l.phone || ''}","${l.company || ''}","${l.source}","${l.stageName}","${l.score}","${l.assignedTo?.name || ''}","${l.createdAt.toISOString()}"`
      ).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=leads-${Date.now()}.csv`);
      return res.send(headers + rows);
    }

    res.json({ leads });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.bulkImport = async (req, res) => {
  try {
    const { leads: leadData, overwriteDuplicates } = req.body;
    if (!Array.isArray(leadData) || leadData.length === 0) {
      return res.status(400).json({ message: 'No leads provided' });
    }

    const defaultStage = await LeadStage.findOne({ isDefault: true }).sort({ order: 1 });
    const results = { created: 0, updated: 0, skipped: 0, errors: [] };

    for (const item of leadData) {
      try {
        if (!item.firstName) {
          results.skipped++;
          continue;
        }
        const leadPayload = {
          ...item,
          stage: defaultStage?._id,
          stageName: defaultStage?.name || 'New',
          createdBy: req.user._id,
        };
        if (item.email && overwriteDuplicates) {
          const existing = await Lead.findOne({ email: item.email });
          if (existing) {
            await Lead.findByIdAndUpdate(existing._id, leadPayload);
            results.updated++;
            continue;
          }
        }
        if (item.email) {
          const existing = await Lead.findOne({ email: item.email });
          if (existing) {
            results.skipped++;
            continue;
          }
        }
        await Lead.create(leadPayload);
        results.created++;
      } catch (err) {
        results.errors.push({ firstName: item.firstName, error: err.message });
      }
    }

    res.status(201).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.bulkUpdate = async (req, res) => {
  try {
    const { ids, updates } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No lead IDs provided' });
    }
    const result = await Lead.updateMany({ _id: { $in: ids } }, updates);
    res.json({ modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No lead IDs provided' });
    }
    const result = await Lead.deleteMany({ _id: { $in: ids } });
    await LeadActivity.deleteMany({ lead: { $in: ids } });
    res.json({ deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPipelineData = async (req, res) => {
  try {
    const stages = await LeadStage.find().sort({ order: 1 });
    const pipelineData = await Promise.all(
      stages.map(async (stage) => {
        const filter = { stage: stage._id };
        if (req.user.roleName === 'sales_rep') {
          filter.assignedTo = req.user._id;
        }
        const leads = await Lead.find(filter)
          .populate('assignedTo', 'name email')
          .sort({ createdAt: -1 });
        return {
          stage,
          leads,
        };
      })
    );
    res.json({ pipelineData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
