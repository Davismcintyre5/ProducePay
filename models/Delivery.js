import mongoose from 'mongoose';

const snapshotSchema = new mongoose.Schema(
  {
    code: String,
    name: String,
    phone: String,
    location: String
  },
  { _id: false }
);

const deliverySchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: true,
      index: true
    },
    farmerSnapshot: { type: snapshotSchema, required: true },
    weightKg: { type: Number, required: true, min: 0.1 },
    ratePerKg: { type: Number, required: true, min: 0 },
    totalKes: { type: Number, required: true, min: 0 },
    collectedAt: { type: Date, required: true, index: true },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    clientRequestId: { type: String, sparse: true, unique: true },
    notes: { type: String },
    deletedAt: { type: Date }
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

deliverySchema.index({ farmer: 1, collectedAt: -1 });

export default mongoose.model('Delivery', deliverySchema);