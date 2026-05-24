import mongoose from 'mongoose';

const moderationIdentitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['ip', 'fingerprint'],
      required: true
    },
    value: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['blocked', 'shadow_banned'],
      required: true
    },
    reason: {
      type: String,
      default: 'Admin moderation action'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
);

moderationIdentitySchema.index({ type: 1, value: 1, status: 1 }, { unique: true });

const ModerationIdentity = mongoose.model('ModerationIdentity', moderationIdentitySchema);

export default ModerationIdentity;
