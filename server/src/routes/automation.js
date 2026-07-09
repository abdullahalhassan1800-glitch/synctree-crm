const router = require('express').Router();
const { auth } = require('../middleware/auth');
const Workflow = require('../models/Workflow');
const EmailTemplate = require('../models/EmailTemplate');
const AutomationLog = require('../models/AutomationLog');
const { processTrigger } = require('../services/automationEngine');

// ---- Workflows ----
router.get('/', auth, async (req, res) => {
  try {
    const workflows = await Workflow.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ workflows });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const workflow = await Workflow.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ workflow });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id).populate('createdBy', 'name');
    if (!workflow) return res.status(404).json({ message: 'Workflow not found' });
    res.json({ workflow });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const workflow = await Workflow.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!workflow) return res.status(404).json({ message: 'Workflow not found' });
    res.json({ workflow });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const workflow = await Workflow.findByIdAndDelete(req.params.id);
    if (!workflow) return res.status(404).json({ message: 'Workflow not found' });
    await AutomationLog.deleteMany({ workflow: workflow._id });
    res.json({ message: 'Workflow deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/toggle', auth, async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) return res.status(404).json({ message: 'Workflow not found' });
    workflow.status = workflow.status === 'active' ? 'inactive' : 'active';
    await workflow.save();
    res.json({ workflow });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/test', auth, async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) return res.status(404).json({ message: 'Workflow not found' });
    const { module, event, recordId } = req.body;
    const logs = await processTrigger({
      event: event || workflow.trigger.event,
      module: module || workflow.module,
      recordId,
      user: req.user._id,
    });
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---- Email Templates ----
router.get('/templates', auth, async (req, res) => {
  try {
    const templates = await EmailTemplate.find()
      .populate('createdBy', 'name')
      .sort({ name: 1 });
    res.json({ templates });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/templates', auth, async (req, res) => {
  try {
    const template = await EmailTemplate.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ template });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/templates/:id', auth, async (req, res) => {
  try {
    const template = await EmailTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json({ template });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/templates/:id', auth, async (req, res) => {
  try {
    const template = await EmailTemplate.findByIdAndDelete(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json({ message: 'Template deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ---- Automation Logs ----
router.get('/logs', auth, async (req, res) => {
  try {
    const { workflow, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (workflow) filter.workflow = workflow;
    if (status) filter.status = status;

    const logs = await AutomationLog.find(filter)
      .populate('workflow', 'name')
      .sort({ executedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await AutomationLog.countDocuments(filter);

    res.json({
      logs,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
