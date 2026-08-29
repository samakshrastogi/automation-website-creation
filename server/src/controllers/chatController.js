import { GoogleGenerativeAI } from '@google/generative-ai';
import { Chat } from '../models/Chat.js';
import mongoose from 'mongoose';

// In-memory store fallback when MongoDB is not connected
const inMemoryChats = new Map();

// Helper to check MongoDB connection
const isDbConnected = () => mongoose.connection.readyState === 1;

// Curated list of high-quality website creation & web architecture prompts
const fallbackPromptBank = [
  "Create a complete, responsive dark glassmorphism SaaS landing page with hero CTA, animated feature cards, pricing tiers, and FAQ accordion using Tailwind CSS.",
  "Build an interactive modern e-commerce product showcase website for futuristic sneakers with 3D product card hover effects, cart drawer, and customer reviews.",
  "Design a sleek creative developer portfolio website with interactive project filters, glowing skill badges, animated stats counter, and contact section.",
  "Create a full-featured real-time financial analytics dashboard UI with glassmorphic cards, revenue charts, recent transactions table, and dark/light mode toggle.",
  "Generate a cybernetic AI Studio landing page with glowing gradient orbs, animated particle background, feature grid, and interactive prompt demo capsule.",
  "Build a luxury restaurant booking website with a parallax culinary hero, chef specialities menu carousel, and reservation modal in clean Tailwind CSS."
];

const SYSTEM_INSTRUCTION = `You are an elite Full-Stack Web Architect and UI/UX Designer specialized in Automated Website Creation.
When users ask you to create, design, or build a website, landing page, dashboard, or web component:
1. Provide complete, production-grade, self-contained, and fully functional code (HTML5 with Tailwind CSS CDN script, or React/Tailwind).
2. Use modern aesthetic principles: Dark glassmorphism, polished typography, subtle glowing borders, responsive mobile-first layouts, and smooth CSS/JS transitions.
3. When outputting complete websites, wrap the complete HTML within standard markdown code blocks (\`\`\`html ... \`\`\`) including the Tailwind CSS CDN (<script src="https://cdn.tailwindcss.com"></script>) and FontAwesome/Lucide icons so it can be previewed live in the browser.
4. Explain the key UI/UX design choices, component architecture, and responsive breakpoints.`;

const CANDIDATE_MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-flash-latest',
];

/**
 * Helper to generate content with automatic model fallback
 */
async function generateWithGeminiFallback(genAI, primaryModelName, contents, generationConfig) {
  // Put primary model first, then unique candidates
  const modelsToTry = Array.from(new Set([primaryModelName || 'gemini-3.6-flash', ...CANDIDATE_MODELS]));
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION,
      });
      const result = await model.generateContent({
        contents,
        generationConfig: generationConfig || {
          temperature: 0.7,
          topP: 0.95,
          maxOutputTokens: 4096,
        },
      });
      return {
        text: result.response.text(),
        modelUsed: modelName,
      };
    } catch (err) {
      lastError = err;
      console.warn(`[Gemini Fallback] Model '${modelName}' failed (${err.message}). Trying next candidate...`);
    }
  }

  throw lastError || new Error('All Gemini candidate models failed.');
}

/**
 * Controller: Generate intelligent chat response using Google Gemini
 */
export const generateChat = async (req, res) => {
  try {
    const { message, chatId, model = 'gemini-3.6-flash', history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let aiResponseText = '';
    let resolvedModel = model || 'gemini-3.6-flash';

    if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);

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

        const geminiResult = await generateWithGeminiFallback(genAI, model, contents);
        aiResponseText = geminiResult.text;
        resolvedModel = geminiResult.modelUsed;
      } catch (geminiError) {
        console.error('Gemini API Error:', geminiError.message);
        aiResponseText = `⚠️ **Gemini API Notice:** Unable to reach Gemini API directly (${geminiError.message}).\n\n*Please verify your \`GEMINI_API_KEY\` in \`server/.env\`.*`;
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
        const promptReq = `Generate a single, fascinating, thought-provoking, and deeply engaging prompt or question that a user could ask an AI assistant like Gemini/ChatGPT. 
Focus on ${category} with a ${tone} vibe. 
Return ONLY the prompt text itself, no quotes, no conversational preamble. Keep it within 1 to 2 sentences.`;

        const geminiResult = await generateWithGeminiFallback(genAI, 'gemini-3.6-flash', [{ role: 'user', parts: [{ text: promptReq }] }]);
        const generatedPrompt = geminiResult.text.trim().replace(/^["']|["']$/g, '');

        return res.status(200).json({
          success: true,
          prompt: generatedPrompt,
          model: geminiResult.modelUsed,
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
