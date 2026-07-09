const router = require('express').Router();
const leadController = require('../controllers/leadController');
const contactController = require('../controllers/contactController');
const { auth } = require('../middleware/auth');

router.get('/stages', auth, leadController.getStages);
router.put('/stages', auth, leadController.updateStages);

router.get('/', auth, leadController.getLeads);
router.post('/', auth, leadController.createLead);
router.get('/export', auth, leadController.exportLeads);
router.post('/bulk-import', auth, leadController.bulkImport);
router.post('/bulk-update', auth, leadController.bulkUpdate);
router.post('/bulk-delete', auth, leadController.bulkDelete);
router.get('/pipeline', auth, leadController.getPipelineData);
router.get('/:id', auth, leadController.getLead);
router.put('/:id', auth, leadController.updateLead);
router.delete('/:id', auth, leadController.deleteLead);

router.post('/:id/activities', auth, leadController.addActivity);
router.put('/:id/assign', auth, leadController.assignLead);
router.put('/:id/stage', auth, leadController.updateLeadStage);
router.post('/:id/convert', auth, contactController.convertLeadToContact);

module.exports = router;
