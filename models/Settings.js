import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    _id: { type: String, default: 'global' },

    organisation: {
      orgName: { type: String, default: 'MOIBEN Maize Produce Collection & Marketing', trim: true },
      shortName: { type: String, default: 'MOIBEN MMP', trim: true },
      phone: { type: String, default: '', trim: true },
      email: { type: String, default: '', lowercase: true, trim: true },
      physicalAddress: { type: String, default: '', trim: true },
      postalAddress: { type: String, default: '', trim: true }
    },

    business: {
      ratePerKg: { type: Number, default: 50, min: 0 },
      currency: { type: String, default: 'KES', trim: true },
      weightUnit: { type: String, default: 'kg', trim: true },
      minDeliveryWeightKg: { type: Number, default: 0.1, min: 0 },
      maxDeliveryWeightKg: { type: Number, default: 100000, min: 0 }
    },

    notifications: {
      emailEnabled: { type: Boolean, default: true },
      smsEnabled: { type: Boolean, default: true },
      notifyFarmerOnDelivery: { type: Boolean, default: true },
      notifyFarmerOnPayment: { type: Boolean, default: true },
      notifyManagersOnWeeklyReport: { type: Boolean, default: true },
      weeklyReportDay: { type: Number, default: 1, min: 0, max: 6 },
      weeklyReportHour: { type: Number, default: 8, min: 0, max: 23 }
    },

    receipts: {
      prefix: { type: String, default: 'R', trim: true },
      footerNote: { type: String, default: 'Thank you for your delivery.', trim: true }
    },

    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      }
    }
  }
);

settingsSchema.statics.getGlobal = async function () {
  let settings = await this.findById('global');
  if (!settings) {
    settings = await this.create({ _id: 'global' });
  }
  return settings;
};

export default mongoose.model('Settings', settingsSchema);