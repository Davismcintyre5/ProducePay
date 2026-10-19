import mongoose from 'mongoose';

const STATUSES = ['PENDING', 'PAID', 'FAILED', 'CANCELLED'];
const METHODS = ['MPESA', 'CASH', 'BANK'];

const snapshotSchema = new mongoose.Schema(
  {
    code: String,
    name: String,
    phone: String,
    email: String,
    weightKg: Number,
    ratePerKg: Number
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    receiptNo: { type: String, required: true, unique: true, index: true },
    delivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Delivery',
      required: true,
      unique: true
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: true,
      index: true
    },
    farmerSnapshot: { type: snapshotSchema, required: true },
    amountKes: { type: Number, required: true, min: 0 },
    status: { type: String, enum: STATUSES, default: 'PENDING', index: true },
    method: { type: String, enum: METHODS },
    reference: { type: String, sparse: true, index: true },
    paidAt: { type: Date },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    failureReason: { type: String }
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

paymentSchema.index({ farmer: 1, status: 1 });
paymentSchema.index({ status: 1, paidAt: -1 });

paymentSchema.methods.markPaid = function ({ method, reference, paidBy }) {
  if (this.status === 'PAID') return this;
  if (!METHODS.includes(method)) throw new Error('Invalid payment method');
  this.status = 'PAID';
  this.method = method;
  this.reference = reference;
  this.paidBy = paidBy;
  this.paidAt = new Date();
  return this;
};

export default mongoose.model('Payment', paymentSchema);