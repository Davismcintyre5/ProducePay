import mongoose from 'mongoose';

const farmerSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      unique: true
    },
    idNumber: {
      type: String,
      trim: true,
      sparse: true,
      unique: true
    },
    location: { type: String, required: true, trim: true },
    farmSizeAcres: { type: Number, min: 0 },
    active: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    notes: { type: String }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        return ret;
      }
    }
  }
);

farmerSchema.index({ location: 1, active: 1 });
farmerSchema.index({ name: 'text', location: 'text' });

farmerSchema.statics.searchActive = function (q, { skip = 0, limit = 20 } = {}) {
  const filter = { active: true };
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { code: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } },
      { location: { $regex: q, $options: 'i' } }
    ];
  }
  return this.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
};

export default mongoose.model('Farmer', farmerSchema);