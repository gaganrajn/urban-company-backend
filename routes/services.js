const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);
router.post('/', protect, authorize(['admin']), serviceController.createService);
router.put('/:id', protect, authorize(['admin']), serviceController.updateService);
router.delete('/:id', protect, authorize(['admin']), serviceController.deleteService);

module.exports = router;
