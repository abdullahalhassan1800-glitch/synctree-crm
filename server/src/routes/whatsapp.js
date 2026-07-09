const router = require('express').Router();
const { auth } = require('../middleware/auth');
const whatsappController = require('../controllers/whatsappController');

router.get('/', auth, whatsappController.getMessages);
router.post('/send', auth, whatsappController.sendMessage);

module.exports = router;
