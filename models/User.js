import mongoose from 'mongoose';

const ROLES = ['ADMIN', 'MANAGER', 'CLERK'];

const otpSchema = new mongoose.Schema(
  {
    hash: { type: String },
    expiresAt: { type: Date },
    attempts: { type: Number, default: 0 }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    fullName: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    role: { type: String, enum: ROLES, required: true },
    active: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    passwordChangedAt: { type: Date },
    otp: { type: otpSchema, default: undefined }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.passwordHash;
        delete ret.otp;
        return ret;
      }
    }
  }
);

userSchema.index({ role: 1, active: 1 });

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: String(email).toLowerCase().trim() });
};

userSchema.statics.findByUsername = function (username) {
  return this.findOne({ username: String(username).toLowerCase().trim() });
};

userSchema.statics.findActiveByRole = function (role) {
  return this.find({ role, active: true });
};

export default mongoose.model('User', userSchema);