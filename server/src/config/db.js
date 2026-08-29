import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gemini_chatgpt_db';
  
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000, // Short timeout for graceful fallback
    });
    console.log(`✨ [MongoDB] Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ [MongoDB] Connection failed (${error.message}). Running in lightweight memory/offline mode.`);
    return false;
  }
};
