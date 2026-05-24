import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Admin from '../models/Admin.js';

dotenv.config();

async function seedAdmin() {
  await connectDB();

  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required to seed the admin');
  }

  if (ADMIN_PASSWORD.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters');
  }

  const existingAdmin = await Admin.findOne();

  if (existingAdmin) {
    existingAdmin.email = ADMIN_EMAIL.toLowerCase();
    existingAdmin.password = ADMIN_PASSWORD;
    await existingAdmin.save();
    console.log('Single admin updated');
  } else {
    await Admin.create({
      email: ADMIN_EMAIL.toLowerCase(),
      password: ADMIN_PASSWORD
    });
    console.log('Single admin created');
  }

  process.exit(0);
}

seedAdmin().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
