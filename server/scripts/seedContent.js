import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Post from '../models/Post.js';
import { slugify } from '../utils/slugify.js';

dotenv.config();

const now = new Date();

const starterWritings = [
  {
    title: 'अधूरी मोहब्बत',
    category: 'Shayari',
    language: 'hindi',
    tags: ['मोहब्बत', 'यादें', 'बारिश', 'दर्द'],
    coverImage: '/uploads/seed-cover-hindi.svg',
    content:
      'कुछ बातें अधूरी ही अच्छी लगती हैं,\nजैसे तुम,\nजैसे तुम्हारी यादें,\nजैसे वो रातें\nजहाँ हम थे,\nमगर हमारे बीच कुछ कहा नहीं गया।\n\nअब भी जब बारिश होती है,\nदिल चुपके से तुम्हारा नाम लिख देता है,\nऔर फिर खुद ही मिटा देता है।',
    isFeatured: true,
    homepageSection: 'hero'
  },
  {
    title: 'When the Night Learns My Name',
    category: 'Poetry',
    language: 'english',
    tags: ['night', 'memory', 'softness'],
    coverImage: '/uploads/seed-cover-night.svg',
    content:
      'The night does not arrive loudly.\n\nIt sits beside my window, folds its dark shawl, and asks what I have survived today.\n\nI tell it your name only once.\n\nThe stars become quiet, as if even light knows when to listen.',
    isFeatured: false,
    homepageSection: 'hero'
  },
  {
    title: 'Chai After the Rain',
    category: 'Shayari',
    language: 'mixed',
    tags: ['rain', 'chai', 'yaad'],
    coverImage: '/uploads/seed-cover-rain.svg',
    content:
      'Baarish ke baad ki chai mein ek ajeeb si garmahat thi.\n\nGaliyon mein mitti muskura rahi thi,\naur mere dil ne chupke se tumhara naam phir se likh diya.',
    isFeatured: false,
    homepageSection: 'featured'
  },
  {
    title: 'The Window That Stayed Open',
    category: 'Story',
    language: 'english',
    tags: ['home', 'healing', 'morning'],
    coverImage: '/uploads/seed-cover-window.svg',
    content:
      'Every morning, the old window opened before anyone touched it.\n\nPeople said the hinges were loose. Meera knew better.\n\nSomewhere between the curtain and the first gold line of sunlight, her mother still came home to wake the house gently.',
    isFeatured: false,
    homepageSection: 'latest'
  }
];

async function seedContent() {
  await connectDB();

  await Post.deleteMany({});

  await Post.insertMany(
    starterWritings.map((writing) => ({
      ...writing,
      slug: slugify(writing.title),
      authorName: 'Shreya Tiwari',
      likes: 0,
      views: 0,
      shares: 0,
      reactions: {},
      status: 'published',
      publishedAt: now,
      createdAt: now,
      updatedAt: now
    }))
  );

  console.log('Seeded exactly 4 real multilingual starter writings with zero engagement counts.');
  await mongoose.disconnect();
}

seedContent().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
