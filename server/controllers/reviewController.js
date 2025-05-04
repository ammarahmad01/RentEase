import Review from '../models/Review.js';
import Item from '../models/Item.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';

// Helper function to update item rating
const updateItemRating = async (itemId) => {
  // Get all reviews for this item
  const reviews = await Review.find({ item: itemId, reviewType: 'item' });
  
  // Calculate average rating
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
  
  // Update item with new rating
  await Item.findByIdAndUpdate(itemId, {
    averageRating,
    totalReviews: reviews.length,
  });
};

// Helper function to update user rating
const updateUserRating = async (userId) => {
  // Get all reviews for this user
  const reviews = await Review.find({ reviewee: userId, reviewType: 'user' });
  
  // Calculate average rating
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
  
  // Update user with new rating
  await User.findByIdAndUpdate(userId, {
    averageRating,
    totalReviews: reviews.length,
  });
};

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment, reviewType } = req.body;

    // Check if booking exists and is completed
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed bookings' });
    }

    // Check if user is part of the booking
    if (
      booking.renter.toString() !== req.user._id.toString() && 
      booking.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(401).json({ message: 'Not authorized to review this booking' });
    }

    // Check if user already reviewed this booking with this review type
    const existingReview = await Review.findOne({
      booking: bookingId,
      reviewer: req.user._id,
      reviewType,
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this booking' });
    }

    // Determine who is the reviewer and who is being reviewed
    const isRenter = booking.renter.toString() === req.user._id.toString();
    const reviewer = req.user._id;
    const reviewee = isRenter ? booking.owner : booking.renter;

    // Create the review
    const review = await Review.create({
      booking: bookingId,
      item: booking.item,
      reviewer,
      reviewee,
      rating,
      comment,
      reviewType,
    });

    // Update the rating for the item or user
    if (reviewType === 'item') {
      await updateItemRating(booking.item);
    } else if (reviewType === 'user') {
      await updateUserRating(reviewee);
    }

    // Create notification for the reviewed party
    await Notification.create({
      recipient: reviewee,
      type: 'review_received',
      title: 'New Review',
      message: `You've received a new ${reviewType} review`,
      relatedItem: booking.item,
      relatedBooking: booking._id,
      relatedUser: reviewer,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get reviews for an item
// @route   GET /api/reviews/item/:itemId
// @access  Public
const getItemReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ 
      item: req.params.itemId,
      reviewType: 'item'
    })
      .populate('reviewer', 'name profileImage')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get reviews for a user
// @route   GET /api/reviews/user/:userId
// @access  Public
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ 
      reviewee: req.params.userId,
      reviewType: 'user'
    })
      .populate('reviewer', 'name profileImage')
      .populate('item', 'title images')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get reviews given by current user
// @route   GET /api/reviews/my-reviews
// @access  Private
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewer: req.user._id })
      .populate('reviewee', 'name profileImage')
      .populate('item', 'title images')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export { createReview, getItemReviews, getUserReviews, getMyReviews };