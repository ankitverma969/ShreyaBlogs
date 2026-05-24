import mongoose from 'mongoose';

const analyticsEventSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      index: true,
      default: null
    },
    type: {
      type: String,
      enum: ['view', 'like', 'reaction', 'share', 'comment', 'bounce', 'read_complete'],
      required: true,
      index: true
    },
    reaction: {
      type: String,
      default: ''
    },
    ipAddress: {
      type: String,
      required: true,
      index: true
    },
    fingerprint: {
      type: String,
      required: true,
      index: true
    },
    localToken: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    },
    readingTimeSeconds: {
      type: Number,
      default: 0
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

analyticsEventSchema.index({ type: 1, createdAt: -1 });
analyticsEventSchema.index({ postId: 1, type: 1, fingerprint: 1, createdAt: -1 });

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);

export default AnalyticsEvent;
