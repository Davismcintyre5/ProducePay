import mongoose from 'mongoose';

const backupSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    cloudinaryId: { type: String, required: true },
    cloudinaryUrl: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    type: { type: String, enum: ['auto', 'manual'], required: true },
    status: { type: String, enum: ['completed', 'failed'], default: 'completed' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true, versionKey: false }
);

backupSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  }
});

export default mongoose.model('Backup', backupSchema);