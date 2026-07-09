const Workflow = require('../models/Workflow');
const AutomationLog = require('../models/AutomationLog');
const Lead = require('../models/Lead');
const Contact = require('../models/Contact');
const Deal = require('../models/Deal');

const evaluateCondition = (fieldValue, operator, compareValue) => {
  switch (operator) {
    case 'equals': return String(fieldValue) === String(compareValue);
    case 'not_equals': return String(fieldValue) !== String(compareValue);
    case 'contains': return String(fieldValue).toLowerCase().includes(String(compareValue).toLowerCase());
    case 'greater_than': return Number(fieldValue) > Number(compareValue);
    case 'less_than': return Number(fieldValue) < Number(compareValue);
    case 'is_empty': return !fieldValue || fieldValue === '';
    case 'is_not_empty': return fieldValue && fieldValue !== '';
    default: return true;
  }
};

const getRecordByModule = async (module, recordId) => {
  switch (module) {
    case 'lead': return Lead.findById(recordId);
    case 'contact': return Contact.findById(recordId);
    case 'deal': return Deal.findById(recordId);
    case 'ticket': return require('../models/Ticket').findById(recordId);
    default: return null;
  }
};

const executeAction = async (action, record, workflow, io) => {
  const config = {};
  action.config.forEach((value, key) => { config[key] = value; });
  const result = { type: action.type, status: 'success', message: '', executedAt: new Date() };

  try {
    switch (action.type) {
      case 'update_field': {
        if (!record) break;
        const updates = {};
        if (config.field) updates[config.field] = config.value;
        await record.constructor.findByIdAndUpdate(record._id, updates);
        result.message = `Updated ${config.field} = ${config.value}`;
        break;
      }
      case 'assign_user': {
        if (!record || !config.userId) break;
        await record.constructor.findByIdAndUpdate(record._id, { assignedTo: config.userId });
        result.message = `Assigned to user ${config.userId}`;
        break;
      }
      case 'create_task': {
        const LeadActivity = require('../models/LeadActivity');
        if (record && config.subject) {
          await LeadActivity.create({
            lead: record._id,
            type: 'task',
            subject: config.subject,
            description: config.description || '',
            dueDate: config.dueDate || undefined,
          });
          result.message = `Task created: ${config.subject}`;
        }
        break;
      }
      case 'send_email': {
        result.message = `Email queued: ${config.subject || 'No subject'}`;
        break;
      }
      case 'webhook': {
        if (config.url) {
          const axios = require('axios');
          await axios.post(config.url, { workflow: workflow.name, record, timestamp: new Date() });
          result.message = `Webhook sent to ${config.url}`;
        }
        break;
      }
      case 'whatsapp': {
        const WhatsAppMessage = require('../models/WhatsAppMessage');
        if (record && config.body) {
          await WhatsAppMessage.create({
            lead: record._id,
            direction: 'out',
            body: config.body,
            templateName: config.templateName || '',
            sentBy: workflow.createdBy,
          });
          result.message = `WhatsApp message queued`;
        }
        break;
      }
      default:
        result.status = 'skipped';
        result.message = `Unknown action type: ${action.type}`;
    }
  } catch (error) {
    result.status = 'failed';
    result.message = error.message;
  }

  return result;
};

exports.processTrigger = async ({ event, module, recordId, user }) => {
  try {
    const workflows = await Workflow.find({
      module,
      status: 'active',
      'trigger.event': event,
    });

    if (workflows.length === 0) return [];

    const records = await getRecordByModule(module, recordId);
    if (!records) return [];

    const { getIO } = require('../socket');
    const io = getIO();
    const logs = [];

    for (const workflow of workflows) {
      const conditionsMet = (workflow.trigger.conditions || []).length === 0 ||
        (workflow.trigger.conditions || []).every(c => {
          const fieldValue = records[c.field];
          return evaluateCondition(fieldValue, c.operator, c.value);
        });

      if (!conditionsMet) continue;

      const actionResults = [];
      for (const action of workflow.actions) {
        const result = await executeAction(action, records, workflow, io);
        actionResults.push(result);
      }

      const logStatus = actionResults.every(r => r.status === 'success') ? 'success'
        : actionResults.some(r => r.status === 'success') ? 'partial' : 'failed';

      const log = await AutomationLog.create({
        workflow: workflow._id,
        trigger: { event, module, recordId },
        conditionsMet: true,
        actionsExecuted: actionResults,
        status: logStatus,
        executedBy: user,
      });

      logs.push(log);
    }

    return logs;
  } catch (error) {
    console.error('Workflow execution error:', error);
    return [];
  }
};
