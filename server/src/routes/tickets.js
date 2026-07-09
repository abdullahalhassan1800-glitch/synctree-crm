const router = require('express').Router();
const ticketController = require('../controllers/ticketController');
const { auth } = require('../middleware/auth');

router.get('/', auth, ticketController.getTickets);
router.post('/', auth, ticketController.createTicket);
router.get('/:id', auth, ticketController.getTicket);
router.put('/:id', auth, ticketController.updateTicket);
router.delete('/:id', auth, ticketController.deleteTicket);

module.exports = router;
