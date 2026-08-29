import express from 'express';
import {
  generateChat,
  generatePromptIdea,
  getChats,
  getChatById,
  deleteChat,
} from '../controllers/chatController.js';

const router = express.Router();

// Chat completion and message handling
router.post('/chat', generateChat);

// Instant Prompt Generation button endpoint
router.post('/generate-prompt', generatePromptIdea);

// Chat threads & history
router.get('/chats', getChats);
router.get('/chats/:id', getChatById);
router.delete('/chats/:id', deleteChat);

export default router;
