import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      required: true,
    },
    pricePerDay: {
      type: Number,
      required: true,
      min: 0,
    },
    pricePerWeek: {
      type: Number,
      min: 0,
    },
    pricePerMonth: {
      type: Number,
      min: 0,
    },
    location: {
      city: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      address: {
        type: String,
      },
      state: {
        type: String,
      },
      zipCode: {
        type: String,
      },
      coordinates: {
        type: {
          lat: { type: Number },
          lng: { type: Number },
        },
        default: undefined, // Make coordinates optional
      },
    },
    deposit: {
      type: Number,
      min: 0,
      default: 0,
    },
    condition: {
      type: String,
      required: true,
      enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
    },
    bookedDates: [
      {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    availabilityCalendar: {
      type: [Date],
    },
    specifications: {
      type: Map,
      of: String,
    },
    rentalTerms: {
      type: String,
    },
    tags: {
      type: [String],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create text index for search
itemSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Item = mongoose.model('Item', itemSchema);

export default Item;