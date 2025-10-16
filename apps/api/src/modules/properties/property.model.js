import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AccommodationType',
      required: true,
    },
    location: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: String,
      country: {
        type: String,
        required: true,
      },
      zipCode: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    pricing: {
      basePrice: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: 'USD',
      },
      cleaningFee: Number,
      serviceFee: Number,
    },
    capacity: {
      guests: {
        type: Number,
        required: true,
      },
      bedrooms: Number,
      beds: Number,
      bathrooms: Number,
    },
    amenities: [
      {
        type: String,
      },
    ],
    images: [
      {
        url: String,
        caption: String,
        isMain: Boolean,
      },
    ],
    rules: {
      checkIn: String,
      checkOut: String,
      minimumStay: Number,
      maximumStay: Number,
      smokingAllowed: Boolean,
      petsAllowed: Boolean,
      eventsAllowed: Boolean,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'suspended'],
      default: 'draft',
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índices
propertySchema.index({ 'location.coordinates': '2dsphere' });
propertySchema.index({ host: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ 'pricing.basePrice': 1 });

const Property = mongoose.model('Property', propertySchema);

export default Property;
