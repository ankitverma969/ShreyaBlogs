import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema(
  {
    loved: { type: Number, default: 0 },
    emotional: { type: Number, default: 0 },
    beautiful: { type: Number, default: 0 },
    painful: { type: Number, default: 0 },
    powerful: { type: Number, default: 0 }
  },
  { _id: false }
);

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true },
    type: {
      type: String,
      enum: ['image', 'video', 'audio'],
      default: 'image'
    },
    alt: { type: String, trim: true }
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    content: {
      type: String,
      required: true
    },
    language: {
      type: String,
      enum: ['english', 'hindi', 'mixed'],
      default: 'hindi',
      index: true
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
      index: true
    },
    tags: {
      type: [String],
      default: []
    },
    coverImage: {
      type: String,
      default: ''
    },
    media: {
      type: [mediaSchema],
      default: []
    },
    likes: {
      type: Number,
      default: 0,
      min: 0
    },
    views: {
      type: Number,
      default: 0,
      min: 0
    },
    shares: {
      type: Number,
      default: 0,
      min: 0
    },
    authorName: {
      type: String,
      default: 'Shreya Tiwari',
      trim: true
    },
    readingTime: {
      type: Number,
      default: 1,
      min: 1
    },
    reactions: {
      type: reactionSchema,
      default: () => ({})
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    homepageSection: {
      type: String,
      enum: ['default', 'hero', 'featured', 'latest'],
      default: 'default',
      index: true
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'unpublished'],
      default: 'draft',
      index: true
    },
    publishedAt: {
      type: Date,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    versionKey: false
  }
);

postSchema.index({ title: 'text', content: 'text', tags: 'text', category: 'text' }, { default_language: 'none', language_override: 'ignore_language_override' });
postSchema.index({ status: 1, publishedAt: -1, createdAt: -1 });
postSchema.index({ status: 1, category: 1, publishedAt: -1 });
postSchema.index({ status: 1, language: 1, publishedAt: -1 });
postSchema.index({ status: 1, tags: 1, publishedAt: -1 });
postSchema.index({ status: 1, views: -1, likes: -1, shares: -1, createdAt: -1 });

postSchema.pre('save', function setUpdatedAt(next) {
  this.updatedAt = new Date();
  const wordCount = this.content ? this.content.trim().split(/\s+/).filter(Boolean).length : 0;
  this.readingTime = Math.max(1, Math.ceil(wordCount / 180));
  next();
});

const Post = mongoose.model('Post', postSchema);

export default Post;
