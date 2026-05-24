import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true
    },
    username: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1200
    },
    ipAddress: {
      type: String,
      trim: true
    },
    location: {
      city: { type: String, trim: true },
      region: { type: String, trim: true },
      country: { type: String, trim: true }
    },
    fingerprint: {
      type: String,
      trim: true,
      index: true
    },
    browserInfo: {
      type: String,
      trim: true
    },
    isSpam: {
      type: Boolean,
      default: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    isFingerprintShadowBanned: {
      type: Boolean,
      default: false
    },
    isIpBlocked: {
      type: Boolean,
      default: false
    },
    spamScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 1
    },
    toxicityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 1
    },
    moderationLevel: {
      type: String,
      enum: ['safe', 'suspicious', 'blocked'],
      default: 'safe',
      index: true
    },
    moderationReasons: {
      type: [String],
      default: []
    },
    approvedAt: {
      type: Date,
      default: null
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

commentSchema.index({ postId: 1, isDeleted: 1, moderationLevel: 1, createdAt: -1 });
commentSchema.index({ fingerprint: 1, createdAt: -1 });
commentSchema.index({ ipAddress: 1, createdAt: -1 });
commentSchema.index({ moderationLevel: 1, isSpam: 1, toxicityScore: -1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
