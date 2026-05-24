import mongoose from 'mongoose';

const moderationLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      index: true
    },
    targetType: {
      type: String,
      enum: ['comment', 'ip', 'fingerprint', 'post'],
      required: true
    },
    targetValue: {
      type: String,
      required: true
    },
    reason: {
      type: String,
      default: ''
    },
    severity: {
      type: String,
      enum: ['safe', 'suspicious', 'blocked'],
      default: 'safe',
      index: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    versionKey: false
  }
);

const ModerationLog = mongoose.model('ModerationLog', moderationLogSchema);

export default ModerationLog;
