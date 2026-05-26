import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import AnalyticsEvent from '../models/AnalyticsEvent.js';
import Comment from '../models/Comment.js';
import ModerationIdentity from '../models/ModerationIdentity.js';
import ModerationLog from '../models/ModerationLog.js';
import Post from '../models/Post.js';
import PublicInteraction from '../models/PublicInteraction.js';

dotenv.config();

async function wipeContent() {
  await connectDB();

  await Promise.all([
    Post.deleteMany({}),
    Comment.deleteMany({}),
    PublicInteraction.deleteMany({}),
    AnalyticsEvent.deleteMany({}),
    ModerationIdentity.deleteMany({}),
    ModerationLog.deleteMany({})
  ]);

  console.log('MongoDB reset complete. All content wiped except Admin.');
  await mongoose.disconnect();
}

wipeContent().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
