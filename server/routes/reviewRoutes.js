import express from 'express';
import { 
  createReview, 
  getItemReviews, 
  getUserReviews, 
  getMyReviews 
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/item/:itemId', getItemReviews);
router.get('/user/:userId', getUserReviews);

// Protected routes
router.use(protect);
router.post('/', createReview);
router.get('/my-reviews', getMyReviews);

export default router;