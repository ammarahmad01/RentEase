import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    // Conversation participants
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Related item (if applicable)
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
    },
    // Related booking (if applicable)
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    // Message content
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        readBy: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Last updated timestamp (for sorting conversations)
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;