const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, bookingController.createBooking);
router.get('/', protect, authorize(['admin']), bookingController.getAllBookings);
router.get('/user/my-bookings', protect, bookingController.getUserBookings);
router.get('/partner/available', protect, authorize(['partner']), bookingController.getPartnerBookings);
router.get('/:id', protect, bookingController.getBookingById);
router.patch('/:id/accept', protect, authorize(['partner']), bookingController.acceptBooking);
router.patch('/:id/status', protect, bookingController.updateBookingStatus);
router.patch('/:id/rate', protect, bookingController.rateBooking);

module.exports = router;
