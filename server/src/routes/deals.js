const router = require('express').Router();
const dealController = require('../controllers/dealController');
const { auth } = require('../middleware/auth');

router.get('/', auth, dealController.getDeals);
router.post('/', auth, dealController.createDeal);
router.get('/:id', auth, dealController.getDeal);
router.put('/:id', auth, dealController.updateDeal);
router.delete('/:id', auth, dealController.deleteDeal);

module.exports = router;
