import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    // The booking this review is for
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Booking',
    },
    // The item being reviewed
    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Item',
    },
    // The user who wrote the review (renter)
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    // The user being reviewed (owner)
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    // Rating 1-5
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    // Written review
    comment: {
      type: String,
      required: true,
    },
    // Type of review (item review or user review)
    reviewType: {
      type: String,
      enum: ['item', 'user'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model('Review', reviewSchema);

export default Review;