import express from 'express';
import { 
  processPayment, 
  getPaymentDetails, 
  processRefund 
} from '../controllers/paymentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All payment routes are protected
router.use(protect);

router.post('/process', processPayment);
router.get('/:bookingId', getPaymentDetails);
router.post('/refund', processRefund);

export default router;