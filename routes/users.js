const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize(['admin']), userController.getAllUsers);
router.get('/partners', userController.getAllPartners);
router.get('/nearby', userController.getPartnersNearby);
router.get('/:id', userController.getUserById);
router.put('/profile', protect, userController.updateProfile);
router.patch('/:id/disable', protect, authorize(['admin']), userController.disableUser);

module.exports = router;
