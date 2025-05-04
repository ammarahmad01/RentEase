import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';

// Note: In a real application, this would integrate with a payment processor like Stripe
// This is a simplified implementation for demonstration purposes

// @desc    Process payment for a booking
// @route   POST /api/payments/process
// @access  Private
const processPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod } = req.body;
    
    // Find the booking
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is the renter
    if (booking.renter.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Check if booking is in an appropriate state for payment
    if (booking.status !== 'approved') {
      return res.status(400).json({ message: 'Booking must be approved before payment' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Payment has already been processed' });
    }

    // Mock payment processing
    // In a real application, this would use a payment provider's API
    const paymentId = `pay_${Date.now()}${Math.random().toString(36).substring(2, 7)}`;
    
    // Update booking with payment info
    booking.paymentStatus = 'paid';
    booking.paymentId = paymentId;
    booking.status = 'in-progress'; // Update status to in-progress once paid
    
    const updatedBooking = await booking.save();

    // Create notification for the owner
    await Notification.create({
      recipient: booking.owner,
      type: 'payment_received',
      title: 'Payment Received',
      message: `Payment has been received for your rental item`,
      relatedItem: booking.item,
      relatedBooking: booking._id,
      relatedUser: req.user._id,
    });

    res.json({
      success: true,
      booking: updatedBooking,
      paymentId,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get payment details for a booking
// @route   GET /api/payments/:bookingId
// @access  Private
const getPaymentDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('item', 'title images pricePerDay deposit')
      .populate('renter', 'name email')
      .populate('owner', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is associated with the booking
    if (
      booking.renter._id.toString() !== req.user._id.toString() && 
      booking.owner._id.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Construct payment details
    const paymentDetails = {
      booking: {
        _id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        paymentId: booking.paymentId,
      },
      item: {
        _id: booking.item._id,
        title: booking.item.title,
        image: booking.item.images[0],
      },
      rental: {
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalDays: booking.totalDays,
      },
      costs: {
        rentalFee: booking.totalPrice,
        deposit: booking.depositAmount,
        total: booking.totalPrice + booking.depositAmount,
      },
      parties: {
        renter: {
          name: booking.renter.name,
          email: booking.renter.email,
        },
        owner: {
          name: booking.owner.name,
          email: booking.owner.email,
        },
      },
    };

    res.json(paymentDetails);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Process a refund for a booking
// @route   POST /api/payments/refund
// @access  Private (Admin or Owner)
const processRefund = async (req, res) => {
  try {
    const { bookingId, amount, reason } = req.body;
    
    // Find the booking
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is the owner or admin
    if (booking.owner.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Check if booking has been paid
    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'No payment has been processed for this booking' });
    }

    // Mock refund processing
    // In a real application, this would use a payment provider's API
    
    // Update booking with refund info
    booking.paymentStatus = amount === booking.totalPrice ? 'refunded' : 'partially_refunded';
    
    const updatedBooking = await booking.save();

    // Create notification for the renter
    await Notification.create({
      recipient: booking.renter,
      type: 'payment_refunded',
      title: 'Refund Processed',
      message: `A refund has been processed for your booking`,
      relatedItem: booking.item,
      relatedBooking: booking._id,
      relatedUser: req.user._id,
    });

    res.json({
      success: true,
      booking: updatedBooking,
      refundAmount: amount,
      reason,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export { processPayment, getPaymentDetails, processRefund };