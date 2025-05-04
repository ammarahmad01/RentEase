import express from 'express';
import { 
  createBooking, 
  getMyRentals, 
  getMyListingsBookings, 
  getBookingById, 
  updateBookingStatus, 
  updateBookingPaymentStatus, // New import for updating payment status
  reportBookingIssue 
} from '../controllers/bookingController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All booking routes are protected
router.use(protect);

router.post('/', createBooking);
router.get('/my-rentals', getMyRentals);
router.get('/my-listings', getMyListingsBookings);
router.get('/:id', getBookingById);
router.put('/:id', updateBookingPaymentStatus); // New route for updating payment status
router.put('/:id/status', updateBookingStatus);
router.put('/:id/issue', reportBookingIssue);

export default router;