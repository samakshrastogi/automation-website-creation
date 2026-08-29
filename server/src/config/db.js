import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const dbName = process.env.DB_NAME || 'website_creation';
  
  try {
    const conn = await mongoose.connect(mongoUri, {
      dbName: dbName,
      serverSelectionTimeoutMS: 3000, // Short timeout for graceful fallback
    });
    console.log(`✨ [MongoDB] Connected successfully: ${conn.connection.host} (Database: ${conn.connection.name})`);
    return true;
  } catch (error) {
    console.warn(`⚠️ [MongoDB] Connection failed (${error.message}). Running in lightweight memory/offline mode with database [${dbName}].`);
    return false;
  }
};
