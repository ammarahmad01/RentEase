import express from 'express';
import { 
  sendMessage, 
  getConversations, 
  getConversationById, 
  getUnreadCount 
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All message routes are protected
router.use(protect);

router.post('/', sendMessage);
router.get('/', getConversations);
router.get('/unread-count', getUnreadCount);
router.get('/:id', getConversationById);

export default router;