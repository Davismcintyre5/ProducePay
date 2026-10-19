import mongoose from 'mongoose';

const ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PAYOUT'];
const ENTITIES = ['User', 'Farmer', 'Delivery', 'Payment', 'Settings'];

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    action: { type: String, enum: ACTIONS, required: true },
    entity: { type: String, enum: ENTITIES, required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    before: { type: mongoose.Schema.Types.Mixed },
    after: { type: mongoose.Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
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

auditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });

auditLogSchema.statics.record = async function (payload) {
  try {
    return await this.create(payload);
  } catch {
    return null;
  }
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

const block = function (next) {
  next(new Error('AuditLog is append-only'));
};

AuditLog.schema.pre('updateOne', block);
AuditLog.schema.pre('updateMany', block);
AuditLog.schema.pre('findOneAndUpdate', block);
AuditLog.schema.pre('deleteOne', block);
AuditLog.schema.pre('deleteMany', block);
AuditLog.schema.pre('findOneAndDelete', block);

export default AuditLog;