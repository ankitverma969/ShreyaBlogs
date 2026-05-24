import mongoose from 'mongoose';

const publicInteractionSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['like', 'reaction', 'view', 'share', 'comment'],
      required: true,
      index: true
    },
    reaction: {
      type: String,
      enum: ['loved', 'emotional', 'beautiful', 'painful', 'powerful', null],
      default: null
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
    userAgent: {
      type: String,
      default: ''
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 24 * 30
    }
  },
  {
    versionKey: false
  }
);

publicInteractionSchema.index({ postId: 1, type: 1, fingerprint: 1, createdAt: -1 });
publicInteractionSchema.index(
  { postId: 1, type: 1, fingerprint: 1 },
  {
    unique: true,
    partialFilterExpression: { type: { $in: ['like', 'reaction'] } }
  }
);

const PublicInteraction = mongoose.model('PublicInteraction', publicInteractionSchema);

export default PublicInteraction;
