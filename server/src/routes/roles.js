const router = require('express').Router();
const roleController = require('../controllers/roleController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, roleController.getRoles);
router.post('/', auth, authorize('admin'), roleController.createRole);
router.put('/:id', auth, authorize('admin'), roleController.updateRole);
router.delete('/:id', auth, authorize('admin'), roleController.deleteRole);
router.get('/users', auth, roleController.getUsers);
router.put('/users/:id', auth, authorize('admin'), roleController.updateUser);

module.exports = router;
