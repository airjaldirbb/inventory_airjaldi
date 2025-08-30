import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import 'dotenv/config.js';

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);

  const hashedPassword = await bcrypt.hash('admin123', 10);
  await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin'
  });

  console.log('User seeded successfully');
  mongoose.disconnect();
}

seed();
