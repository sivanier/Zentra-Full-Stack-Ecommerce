import mongoose from 'mongoose';

export function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

export async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI is not set. Zentra API is using local JSON fallback data.');
    return false;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB connected: ${connection.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`MongoDB unavailable: ${error.message}`);
    console.warn('Zentra API will keep running with local JSON fallback data.');
    return false;
  }
}
