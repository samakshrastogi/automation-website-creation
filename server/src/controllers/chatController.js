import { GoogleGenerativeAI } from '@google/generative-ai';
import { Chat } from '../models/Chat.js';
import mongoose from 'mongoose';

// In-memory store fallback when MongoDB is not connected
const inMemoryChats = new Map();

// Helper to check MongoDB connection
const isDbConnected = () => mongoose.connection.readyState === 1;

// Curated list of high-quality fallback prompts if offline
const fallbackPromptBank = [
  "Design a high-throughput event-driven microservices architecture using Apache Kafka, Go, and Redis with automatic backpressure handling.",
  "Write a modern Three.js holographic shader with iridescent lighting, chromatic aberration, and audio-reactive ripples.",
  "Explain quantum entanglement and quantum teleportation to a senior software engineer using distributed systems analogies.",
  "Create a comprehensive prompt engineering framework for multi-agent autonomous decision loops with reflection steps.",
  "Develop a complete React 19 custom hook for WebSockets with reconnection exponential backoff, message queuing, and state synchronization.",
  "Draft a sci-fi cybernetic narrative exploring what happens when an AI discovers encrypted memories left by its original human architect.",
  "Architect a zero-knowledge proof authentication scheme for privacy-preserving verifiable credentials in Web3.",
  "Compare the internal memory layout and garbage collection strategies of V8 (Node.js) vs Go runtime vs Rust zero-cost abstractions."
];

/**
 * Controller: Generate intelligent chat response using Google Gemini
 */
export const generateChat = async (req, res) => {
  try {
    const { message, chatId, model = 'gemini-1.5-flash', history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let aiResponseText = '';

    if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const selectedModel = genAI.getGenerativeModel({ model: model || 'gemini-1.5-flash' });

        // Format history for Google Generative AI
        const contents = history.map((msg) => ({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }));

        // Append current message
        contents.push({
          role: 'user',
          parts: [{ text: message }],
        });

        const result = await selectedModel.generateContent({
          contents,
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        });

        aiResponseText = result.response.text();
      } catch (geminiError) {
        console.error('Gemini API Error:', geminiError.message);
        aiResponseText = `⚠️ **Gemini API Notice:** Unable to reach Gemini API directly (${geminiError.message}).\n\n*Please verify your \`GEMINI_API_KEY\` in \`server/.env\`.* Here is a simulated response:\n\n### Analysis:\nI have processed your query: **"${message}"**.\n\n- **Status:** Integrated and operational\n- **Engine:** Google Gemini Hybrid Engine\n- **Recommendation:** Add your live API key in \`server/.env\` for unfiltered real-time Gemini generation.`;
      }
    } else {
      // Mock Gemini response when API key is not yet set
      aiResponseText = `✨ **Hello! I am your Gemini-powered Assistant.**\n\nI received your prompt: *"**${message}**"*\n\n> 💡 **Quick Setup Note:** To enable live responses directly from Google's servers, add your free Gemini API key to \`server/.env\` as \`GEMINI_API_KEY=your_key\`.\n\n### Key Highlights of this Architecture:\n1. **Glassmorphism UI**: High-blur frosted acrylic cards with glowing gradients.\n2. **3D Interactive Core**: Real-time canvas particle galaxy reacting to your mouse.\n3. **GSAP Animations**: Smooth staggered reveals and dynamic interactive feedback.\n4. **Monorepo Structure**: Node.js, Express, MongoDB & React Vite all in one repo.`;
    }

    // Persist to MongoDB or In-Memory fallback
    let currentChatId = chatId;
    let chatDoc = null;

    if (isDbConnected()) {
      if (currentChatId && mongoose.isValidObjectId(currentChatId)) {
        chatDoc = await Chat.findById(currentChatId);
      }

      if (!chatDoc) {
        // Create title from first 35 chars of user message
        const title = message.slice(0, 35) + (message.length > 35 ? '...' : '');
        chatDoc = new Chat({
          title,
          messages: [],
        });
      }

      chatDoc.messages.push({ role: 'user', content: message, model });
      chatDoc.messages.push({ role: 'model', content: aiResponseText, model });
      await chatDoc.save();
      currentChatId = chatDoc._id.toString();
    } else {
      // In-memory fallback
      if (!currentChatId || !inMemoryChats.has(currentChatId)) {
        currentChatId = 'chat_' + Date.now();
        const title = message.slice(0, 35) + (message.length > 35 ? '...' : '');
        inMemoryChats.set(currentChatId, {
          _id: currentChatId,
          title,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      const memChat = inMemoryChats.get(currentChatId);
      memChat.messages.push({ role: 'user', content: message, model, timestamp: new Date() });
      memChat.messages.push({ role: 'model', content: aiResponseText, model, timestamp: new Date() });
      memChat.updatedAt = new Date();
    }

    return res.status(200).json({
      success: true,
      chatId: currentChatId,
      response: aiResponseText,
      model,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat controller error:', error);
    return res.status(500).json({
      error: 'An internal server error occurred while processing your chat.',
      details: error.message,
    });
  }
};

/**
 * Controller: Generate a creative, high-impact prompt suggestion on click
 */
export const generatePromptIdea = async (req, res) => {
  try {
    const { category = 'any', tone = 'creative and technical' } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const promptReq = `Generate a single, fascinating, thought-provoking, and deeply engaging prompt or question that a user could ask an AI assistant like Gemini/ChatGPT. 
Focus on ${category} with a ${tone} vibe. 
Return ONLY the prompt text itself, no quotes, no conversational preamble. Keep it within 1 to 2 sentences.`;

        const result = await model.generateContent(promptReq);
        const generatedPrompt = result.response.text().trim().replace(/^["']|["']$/g, '');

        return res.status(200).json({
          success: true,
          prompt: generatedPrompt,
          source: 'gemini-live',
        });
      } catch (geminiError) {
        console.warn('Gemini prompt generation error, using fallback:', geminiError.message);
      }
    }

    // Pick random from curated fallback bank
    const randomPrompt = fallbackPromptBank[Math.floor(Math.random() * fallbackPromptBank.length)];
    return res.status(200).json({
      success: true,
      prompt: randomPrompt,
      source: 'curated-spark',
    });
  } catch (error) {
    console.error('Generate prompt controller error:', error);
    return res.status(500).json({ error: 'Failed to generate prompt idea.' });
  }
};

/**
 * Controller: Retrieve chat list
 */
export const getChats = async (req, res) => {
  try {
    if (isDbConnected()) {
      const chats = await Chat.find({}, 'title createdAt updatedAt').sort({ updatedAt: -1 });
      return res.status(200).json({ success: true, chats });
    } else {
      const chats = Array.from(inMemoryChats.values()).map((c) => ({
        _id: c._id,
        title: c.title,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }));
      return res.status(200).json({ success: true, chats });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch chats', details: error.message });
  }
};

/**
 * Controller: Get specific chat with messages
 */
export const getChatById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected() && mongoose.isValidObjectId(id)) {
      const chat = await Chat.findById(id);
      if (!chat) return res.status(404).json({ error: 'Chat not found' });
      return res.status(200).json({ success: true, chat });
    } else {
      const chat = inMemoryChats.get(id);
      if (!chat) return res.status(404).json({ error: 'Chat not found' });
      return res.status(200).json({ success: true, chat });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch chat details', details: error.message });
  }
};

/**
 * Controller: Delete a chat
 */
export const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected() && mongoose.isValidObjectId(id)) {
      await Chat.findByIdAndDelete(id);
    } else {
      inMemoryChats.delete(id);
    }

    return res.status(200).json({ success: true, message: 'Chat deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete chat', details: error.message });
  }
};
