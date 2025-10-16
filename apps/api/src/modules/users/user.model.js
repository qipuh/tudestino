import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['guest', 'host', 'admin'],
      default: 'guest',
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    profile: {
      bio: String,
      location: String,
      languages: [String],
      dateOfBirth: Date,
    },
    verification: {
      identity: {
        status: {
          type: String,
          enum: ['pending', 'verified', 'rejected'],
          default: 'pending',
        },
        documentType: String,
        documentUrl: String,
        verifiedAt: Date,
      },
      email: {
        isVerified: Boolean,
        verifiedAt: Date,
      },
      phone: {
        isVerified: Boolean,
        verifiedAt: Date,
      },
    },
    hostProfile: {
      rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      reviewCount: {
        type: Number,
        default: 0,
      },
      responseRate: Number,
      responseTime: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Índices
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);

export default User;
