import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import chatRoutes from './routes/chatRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allows client requests from Vite dev server
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api', chatRoutes);

// System Health Endpoint
app.get('/api/health', (req, res) => {
  const hasGeminiKey = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY.trim() !== '' &&
    process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
  );

  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown';

  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      server: 'online',
      mongodb: dbState,
      geminiConfigured: hasGeminiKey,
    },
    message: hasGeminiKey
      ? 'Gemini API is active.'
      : 'Running in demo mode. Add GEMINI_API_KEY in server/.env for live Google Gemini responses.',
  });
});

// Start Server & Connect Database
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`
🚀 ===================================================
   🤖 Gemini & ChatGPT Hybrid Server Running!
   🌐 Local URL: http://localhost:${PORT}
   📡 API Endpoint: http://localhost:${PORT}/api/chat
   ✨ Prompt Generator: http://localhost:${PORT}/api/generate-prompt
   🩺 Health Check: http://localhost:${PORT}/api/health
===================================================
    `);
  });
};

startServer();
