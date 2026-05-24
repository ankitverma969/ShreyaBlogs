import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Post from '../models/Post.js';
import PublicInteraction from '../models/PublicInteraction.js';

dotenv.config();

async function repairIndexes() {
  await connectDB();

  try {
    await PublicInteraction.collection.dropIndex('postId_1_type_1_fingerprint_1');
    console.log('Dropped legacy public interaction unique index.');
  } catch (error) {
    if (error.codeName !== 'IndexNotFound') throw error;
  }

  await PublicInteraction.syncIndexes();
  await Post.syncIndexes();
  console.log('Public interaction indexes synchronized.');
  console.log('Post indexes synchronized for Unicode search and language filtering.');
  await mongoose.disconnect();
}

repairIndexes().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
