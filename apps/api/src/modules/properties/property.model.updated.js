import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Tipo de alojamiento actualizado
    accommodationType: {
      type: String,
      enum: [
        'apartment', 'hotel', 'motel', 'hostel', 'room',
        'house', 'villa', 'cabin', 'resort', 'bed_and_breakfast', 'guesthouse'
      ],
      required: true,
    },

    // Para establecimientos multi-unidad (hotel, motel, hostal)
    multipleUnits: {
      type: Boolean,
      default: false,
    },
    hotelName: {
      type: String,
      trim: true,
    },
    hotelCategory: {
      type: Number, // 1-5 estrellas
      min: 1,
      max: 5,
    },

    // Política de cancelación
    cancellationPolicy: {
      type: String,
      enum: ['standard', 'flexible', 'moderate', 'strict', 'non_refundable', 'long_stay'],
      default: 'standard',
    },

    // Ubicación
    address: {
      street: {
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
      latitude: Number,
      longitude: Number,
    },

    // Servicios del establecimiento
    propertyAmenities: [{
      type: String,
    }],

    // Desayuno
    breakfastIncluded: {
      type: Boolean,
      default: false,
    },

    // Parking
    parkingType: {
      type: String,
      enum: ['no', 'free', 'paid'],
      default: 'no',
    },
    parkingDetails: {
      price: Number,
      pricePer: {
        type: String,
        enum: ['day', 'stay'],
      },
      location: {
        type: String,
        enum: ['onsite', 'offsite'],
      },
      type: {
        type: String,
        enum: ['private', 'public'],
      },
    },

    // Normas
    checkInTime: {
      type: String,
      default: '14:00',
    },
    checkOutTime: {
      type: String,
      default: '12:00',
    },
    childrenAllowed: {
      type: Boolean,
      default: true,
    },
    petsAllowed: {
      type: String,
      enum: ['no', 'yes_free', 'yes_paid'],
      default: 'no',
    },
    petFee: Number,
    petFeePer: {
      type: String,
      enum: ['day', 'stay'],
    },
    additionalRules: String,

    // Estado
    status: {
      type: String,
      enum: ['draft', 'published', 'suspended'],
      default: 'published',
    },

    // Rating
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

    // Campos legacy (mantener compatibilidad)
    title: String,
    description: String,
    type: mongoose.Schema.Types.ObjectId,
  },
  {
    timestamps: true,
  }
);

// Schema para habitaciones
const roomSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    roomType: {
      type: String,
      enum: [
        'single', 'double', 'triple', 'quadruple', 'suite', 'junior_suite',
        'family', 'shared_dormitory', 'studio', 'deluxe', 'executive', 'penthouse'
      ],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    guestCapacity: {
      type: Number,
      required: true,
      min: 1,
    },
    beds: [{
      type: {
        type: String,
        enum: ['single', 'double', 'queen', 'king', 'sofa_bed', 'bunk_bed'],
        required: true,
      },
      count: {
        type: Number,
        required: true,
        min: 1,
      },
    }],
    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },
    amenities: [{
      type: String,
    }],
    images: [{
      type: String, // URLs de las imágenes
    }],
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índices
propertySchema.index({ host: 1 });
propertySchema.index({ accommodationType: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ 'address.city': 1 });
propertySchema.index({ 'address.country': 1 });

roomSchema.index({ property: 1 });
roomSchema.index({ roomType: 1 });
roomSchema.index({ pricePerNight: 1 });

const Property = mongoose.model('Property', propertySchema);
const Room = mongoose.model('Room', roomSchema);

export { Property, Room };
export default Property;
