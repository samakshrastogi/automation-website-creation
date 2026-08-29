import React, { useState, useEffect, useRef } from 'react';
import Background3D from './components/Background3D.jsx';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import PromptInput from './components/PromptInput.jsx';
import FeaturesModal from './components/FeaturesModal.jsx';
import {
  sendChatMessage,
  requestPromptIdea,
  getChatThreads,
  getChatDetails,
  removeChatThread,
  getSystemHealth,
} from './services/api.js';
import gsap from 'gsap';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chats, setChats] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');
  const [health, setHealth] = useState(null);
  const [featuresOpen, setFeaturesOpen] = useState(false);

  // Initial load: Fetch chat history & system health
  useEffect(() => {
    loadChats();
    checkHealthStatus();
  }, []);

  const loadChats = async () => {
    try {
      const data = await getChatThreads();
      if (data && data.chats) {
        setChats(data.chats);
      }
    } catch (err) {
      console.warn('Unable to load chats initially:', err);
    }
  };

  const checkHealthStatus = async () => {
    try {
      const data = await getSystemHealth();
      if (data) {
        setHealth(data);
      }
    } catch (err) {
      console.warn('Health check unreachable:', err);
    }
  };

  // Switch or load specific chat
  const handleSelectChat = async (chatId) => {
    if (chatId === currentChatId) return;
    try {
      const data = await getChatDetails(chatId);
      if (data && data.chat) {
        setCurrentChatId(chatId);
        setMessages(data.chat.messages || []);
      }
    } catch (err) {
      console.error('Failed to switch chat:', err);
    }
  };

  // Start new chat
  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setInputPrompt('');
  };

  // Delete chat
  const handleDeleteChat = async (chatId) => {
    try {
      await removeChatThread(chatId);
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      if (currentChatId === chatId) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  // Send Message to Gemini API
  const handleSendMessage = async () => {
    const userPrompt = inputPrompt.trim();
    if (!userPrompt || isGenerating) return;

    // 1. Append user message immediately
    const userMessage = {
      role: 'user',
      content: userPrompt,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputPrompt('');
    setIsGenerating(true);

    try {
      // 2. Call backend
      const result = await sendChatMessage({
        message: userPrompt,
        chatId: currentChatId,
        model: selectedModel,
        history: messages,
      });

      // 3. Append model response
      if (result && result.response) {
        const modelMessage = {
          role: 'model',
          content: result.response,
          model: result.model || selectedModel,
          timestamp: result.timestamp || new Date().toISOString(),
        };
        setMessages([...newMessages, modelMessage]);

        if (result.chatId) {
          setCurrentChatId(result.chatId);
        }
        // Refresh sidebar chat list
        loadChats();
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'model',
        content: `⚠️ **Error Processing Request:** ${error.message || 'Unable to connect to server.'}\n\nPlease verify that the backend server is running on \`http://localhost:5000\`.`,
        timestamp: new Date().toISOString(),
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Dynamic Prompt Ideation generator (When clicking "Generate Prompt" or category spark)
  const handleGeneratePromptIdea = async (category = 'any') => {
    setIsGeneratingPrompt(true);
    try {
      const data = await requestPromptIdea(category);
      if (data && data.prompt) {
        // Animate prompt typing into input
        setInputPrompt('');
        let currentText = '';
        const targetText = data.prompt;
        
        let i = 0;
        const interval = setInterval(() => {
          if (i < targetText.length) {
            currentText += targetText[i];
            setInputPrompt(currentText);
            i++;
          } else {
            clearInterval(interval);
          }
        }, 12);

        return data.prompt;
      }
    } catch (err) {
      console.error('Prompt ideation error:', err);
      // Fallback prompt
      const fallback = "Architect a resilient real-time AI dashboard with React 19, Three.js 3D shaders, and MongoDB.";
      setInputPrompt(fallback);
      return fallback;
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex bg-gemini-darker text-slate-100 aurora-bg">
      {/* 3D Background Canvas */}
      <Background3D isGenerating={isGenerating} />

      {/* Sidebar for History */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
      />

      {/* Main Chat Interface */}
      <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          health={health}
          onOpenFeatures={() => setFeaturesOpen(true)}
        />

        {/* Scrollable Chat View */}
        <ChatWindow
          messages={messages}
          isGenerating={isGenerating}
          onSelectPromptPreset={(presetText) => setInputPrompt(presetText)}
          onGeneratePromptIdea={handleGeneratePromptIdea}
        />

        {/* Floating Glass Prompt Input Capsule */}
        <PromptInput
          inputPrompt={inputPrompt}
          setInputPrompt={setInputPrompt}
          onSubmit={handleSendMessage}
          isGenerating={isGenerating}
          onGeneratePromptIdea={handleGeneratePromptIdea}
          isGeneratingPrompt={isGeneratingPrompt}
        />
      </div>

      {/* Features & Architecture Modal */}
      <FeaturesModal
        isOpen={featuresOpen}
        onClose={() => setFeaturesOpen(false)}
      />
    </div>
  );
}
