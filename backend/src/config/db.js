import mongoose from 'mongoose';
import { env } from './env.js';

//db connection
export async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGODB_URI, { autoIndex: true });
  console.log('Mongodb connected successfully');
}
