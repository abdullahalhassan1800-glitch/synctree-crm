const router = require('express').Router();
const contactController = require('../controllers/contactController');
const { auth } = require('../middleware/auth');

router.get('/', auth, contactController.getContacts);
router.post('/', auth, contactController.createContact);
router.get('/:id', auth, contactController.getContact);
router.put('/:id', auth, contactController.updateContact);
router.delete('/:id', auth, contactController.deleteContact);

module.exports = router;
