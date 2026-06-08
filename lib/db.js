import mongoose from 'mongoose';
import { initGridFS } from './gridfs';
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

// Global cache to prevent multiple connections in development
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;

  // if (!cached.promise) {
  //   cached.promise = mongoose.connect(MONGODB_URI); // ✅ No options needed in Mongoose 6+
  // }
if (!cached.promise) {
  console.log("Mongo URI exists:", !!MONGODB_URI);
console.log("URI:", MONGODB_URI.replace(/\/\/.*:.*@/, "//***:***@"));
  cached.promise = mongoose
    .connect(MONGODB_URI)
    .then((conn) => {
      console.log("✅ MongoDB Connected");
      return conn;
    })
    .catch((err) => {
      console.error("❌ MongoDB Connection Error:");
      console.error(err);
      throw err;
    });
}
  cached.conn = await cached.promise;
  // ✅ IMPORTANT: initialize GridFS AFTER connection is ready
  if (!global.gridfsInitialized) {
    initGridFS(mongoose.connection);
    global.gridfsInitialized = true;
  }
  return cached.conn;
}

export default dbConnect;
