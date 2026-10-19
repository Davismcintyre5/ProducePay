import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 }
  },
  {
    versionKey: false,
    timestamps: false
  }
);

counterSchema.statics.next = async function (key) {
  const doc = await this.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return doc.seq;
};

counterSchema.statics.peek = async function (key) {
  const doc = await this.findById(key);
  return doc ? doc.seq : 0;
};

export default mongoose.model('Counter', counterSchema);