import Message from '../models/Message.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Start or continue a conversation
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { recipientId, content, itemId, bookingId } = req.body;
    
    // Validate that recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check if conversation already exists
    let conversation = await Message.findOne({
      participants: { $all: [req.user._id, recipientId] },
      ...(itemId && { item: itemId }),
      ...(bookingId && { booking: bookingId }),
    });

    if (conversation) {
      // Add new message to existing conversation
      conversation.messages.push({
        sender: req.user._id,
        content,
        readBy: [req.user._id], // Sender has read it
      });
      
      // Update last activity timestamp
      conversation.lastUpdated = Date.now();
    } else {
      // Create new conversation
      conversation = new Message({
        participants: [req.user._id, recipientId],
        ...(itemId && { item: itemId }),
        ...(bookingId && { booking: bookingId }),
        messages: [
          {
            sender: req.user._id,
            content,
            readBy: [req.user._id], // Sender has read it
          }
        ],
      });
    }

    // Save conversation
    await conversation.save();

    // Create notification for recipient
    await Notification.create({
      recipient: recipientId,
      type: 'message_received',
      title: 'New Message',
      message: `You have a new message from ${req.user.name}`,
      relatedUser: req.user._id,
      ...(itemId && { relatedItem: itemId }),
      ...(bookingId && { relatedBooking: bookingId }),
    });

    // Return the complete conversation
    const populatedConversation = await Message.findById(conversation._id)
      .populate('participants', 'name profileImage')
      .populate('item', 'title images')
      .populate('booking', 'startDate endDate status');

    res.status(201).json(populatedConversation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all conversations for the current user
// @route   GET /api/messages
// @access  Private
const getConversations = async (req, res) => {
  try {
    // Find all conversations where the user is a participant
    const conversations = await Message.find({
      participants: { $in: [req.user._id] },
    })
      .populate('participants', 'name profileImage')
      .populate('item', 'title images')
      .populate('booking', 'startDate endDate status')
      .sort({ lastUpdated: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get conversation by ID
// @route   GET /api/messages/:id
// @access  Private
const getConversationById = async (req, res) => {
  try {
    const conversation = await Message.findById(req.params.id)
      .populate('participants', 'name profileImage')
      .populate('item', 'title images')
      .populate('booking', 'startDate endDate status');

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is a participant in the conversation
    if (!conversation.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Mark all messages as read by the current user
    conversation.messages.forEach(message => {
      if (!message.readBy.includes(req.user._id)) {
        message.readBy.push(req.user._id);
      }
    });

    await conversation.save();

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    // Find all conversations where the user is a participant
    const conversations = await Message.find({
      participants: { $in: [req.user._id] },
    });

    // Count unread messages across all conversations
    let unreadCount = 0;
    conversations.forEach(conversation => {
      conversation.messages.forEach(message => {
        if (
          message.sender.toString() !== req.user._id.toString() && 
          !message.readBy.some(id => id.toString() === req.user._id.toString())
        ) {
          unreadCount++;
        }
      });
    });

    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export { sendMessage, getConversations, getConversationById, getUnreadCount };