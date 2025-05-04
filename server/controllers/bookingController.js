import Booking from '../models/Booking.js';
import Item from '../models/Item.js';
import Notification from '../models/Notification.js';

// Helper function to check date conflicts
const hasDateConflict = (bookedDates, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return bookedDates.some(
    booking => {
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);
      
      // Check for overlap
      return (start < bookingEnd && end > bookingStart);
    }
  );
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { itemId, startDate, endDate, notes } = req.body;

    // Find the item
    const item = await Item.findById(itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if the item is available
    if (!item.isAvailable) {
      return res.status(400).json({ message: 'Item is not available for rent' });
    }

    // Check if there's a date conflict
    if (hasDateConflict(item.bookedDates, startDate, endDate)) {
      return res.status(400).json({ message: 'Item is not available for the selected dates' });
    }

    // Calculate rental duration in days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calculate total price
    let totalPrice = 0;
    if (diffDays <= 7 && item.pricePerDay) {
      totalPrice = diffDays * item.pricePerDay;
    } else if (diffDays <= 30 && item.pricePerWeek) {
      const weeks = Math.ceil(diffDays / 7);
      totalPrice = weeks * item.pricePerWeek;
    } else if (item.pricePerMonth) {
      const months = Math.ceil(diffDays / 30);
      totalPrice = months * item.pricePerMonth;
    } else {
      // Default to daily rate if other rates not specified
      totalPrice = diffDays * item.pricePerDay;
    }

    // Create the booking
    const booking = await Booking.create({
      item: itemId,
      renter: req.user._id,
      owner: item.owner,
      startDate,
      endDate,
      totalDays: diffDays,
      totalPrice,
      depositAmount: item.deposit || 0,
      notes,
    });

    // Create notification for the owner
    await Notification.create({
      recipient: item.owner,
      type: 'new_booking_request',
      title: 'New Booking Request',
      message: `You have a new booking request for ${item.title}`,
      relatedItem: itemId,
      relatedBooking: booking._id,
      relatedUser: req.user._id,
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all bookings for the current user (as renter)
// @route   GET /api/bookings/my-rentals
// @access  Private
const getMyRentals = async (req, res) => {
  try {
    const bookings = await Booking.find({ renter: req.user._id })
      .populate('item', 'title images pricePerDay category')
      .populate('owner', 'name email profileImage')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all bookings for the current user's items (as owner)
// @route   GET /api/bookings/my-listings
// @access  Private
const getMyListingsBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ owner: req.user._id })
      .populate('item', 'title images pricePerDay category')
      .populate('renter', 'name email profileImage')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('item', 'title description images pricePerDay category condition')
      .populate('renter', 'name email phone profileImage')
      .populate('owner', 'name email phone profileImage');

    // Check if booking exists
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user has permission to view this booking
    if (
      booking.renter._id.toString() !== req.user._id.toString() && 
      booking.owner._id.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Allow renter to update status to 'in-progress' after payment
    const isRenter = booking.renter.toString() === req.user._id.toString();
    const isOwner = booking.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.isAdmin;

    if (status === 'in-progress' && isRenter) {
      // Allow renter to update to 'in-progress' after payment
    } else if (!isOwner && !isAdmin) {
      // Otherwise, only owner or admin can update status
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Update booking status
    booking.status = status;

    // Handle additional logic based on status
    if (status === 'approved') {
      // Add to item's booked dates
      const item = await Item.findById(booking.item);
      item.bookedDates.push({
        startDate: booking.startDate,
        endDate: booking.endDate,
        bookingId: booking._id
      });
      await item.save();

      // Create notification for the renter
      await Notification.create({
        recipient: booking.renter,
        type: 'booking_approved',
        title: 'Booking Approved',
        message: `Your booking request for ${item.title} has been approved`,
        relatedItem: booking.item,
        relatedBooking: booking._id,
        relatedUser: booking.owner,
      });
    } else if (status === 'rejected' || status === 'cancelled') {
      // Create notification
      await Notification.create({
        recipient: status === 'rejected' ? booking.renter : booking.owner,
        type: status === 'rejected' ? 'booking_rejected' : 'booking_cancelled',
        title: status === 'rejected' ? 'Booking Rejected' : 'Booking Cancelled',
        message: status === 'rejected' 
          ? `Your booking request has been rejected` 
          : `A booking for your item has been cancelled`,
        relatedItem: booking.item,
        relatedBooking: booking._id,
        relatedUser: status === 'rejected' ? booking.owner : booking.renter,
      });

      // Remove from item's booked dates if it was previously approved
      if (booking.status === 'approved') {
        const item = await Item.findById(booking.item);
        item.bookedDates = item.bookedDates.filter(
          date => date.bookingId.toString() !== booking._id.toString()
        );
        await item.save();
      }
    } else if (status === 'completed') {
      // Create notification for the renter
      await Notification.create({
        recipient: booking.renter,
        type: 'booking_completed',
        title: 'Booking Completed',
        message: `Your rental has been marked as completed`,
        relatedItem: booking.item,
        relatedBooking: booking._id,
        relatedUser: booking.owner,
      });
    } else if (status === 'approved') {
      // Create notification for the owner
      const item = await Item.findById(booking.item);
      await Notification.create({
        recipient: booking.owner,
        type: 'booking_payment_completed',
        title: 'Payment Received',
        message: `Payment has been received for ${item.title}. The booking is now approved.`,
        relatedItem: booking.item,
        relatedBooking: booking._id,
        relatedUser: booking.renter,
      });
    }

    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Report an issue with a booking
// @route   PUT /api/bookings/:id/issue
// @access  Private
const reportBookingIssue = async (req, res) => {
  try {
    const { issueDescription } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is either the renter or owner
    if (
      booking.renter.toString() !== req.user._id.toString() && 
      booking.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Update booking with issue details
    booking.issueReported = true;
    booking.issueDescription = issueDescription;

    const updatedBooking = await booking.save();

    // Create notification for the other party
    const recipientId = booking.renter.toString() === req.user._id.toString() 
      ? booking.owner 
      : booking.renter;

    await Notification.create({
      recipient: recipientId,
      type: 'other',
      title: 'Issue Reported',
      message: `An issue has been reported with your booking`,
      relatedItem: booking.item,
      relatedBooking: booking._id,
      relatedUser: req.user._id,
    });

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// @desc    Update booking payment status
// @route   PUT /api/bookings/:id
// @access  Private
const updateBookingPaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentId } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is the renter of the booking
    if (booking.renter.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Update payment status and paymentId
    booking.paymentStatus = paymentStatus;
    if (paymentId) {
      booking.paymentId = paymentId;
    }

    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export { 
  createBooking, 
  getMyRentals, 
  getMyListingsBookings, 
  getBookingById, 
  updateBookingStatus, 
  updateBookingPaymentStatus,
  reportBookingIssue 
};