import React, { useState, useEffect } from 'react';
import Background3D from './components/Background3D.jsx';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import PromptInput from './components/PromptInput.jsx';
import GitHubConnectModal from './components/GitHubConnectModal.jsx';
import {
  sendChatMessage,
  requestPromptIdea,
  getChatThreads,
  getChatDetails,
  removeChatThread,
  getSystemHealth,
} from './services/api.js';
import { getStoredGitHubUser } from './services/githubService.js';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [chats, setChats] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const [selectedModel, setSelectedModel] = useState('gemini-3.6-flash');
  const [health, setHealth] = useState(null);
  const [githubUser, setGithubUser] = useState(getStoredGitHubUser());
  const [githubModalOpen, setGithubModalOpen] = useState(false);

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
        setCurrentChatId(data.chat._id);
        setMessages(data.chat.messages || []);
      }
    } catch (err) {
      console.error('Failed to load chat conversation:', err);
    }
  };

  // Create clean new chat
  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setInputPrompt('');
  };

  // Delete chat thread
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

  // Send message or prompt to backend
  const handleSendMessage = async () => {
    if (!inputPrompt.trim() || isGenerating) return;

    const userText = inputPrompt.trim();
    setInputPrompt('');
    setIsGenerating(true);

    // Optimistically add user's message
    const tempUserMsg = {
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const data = await sendChatMessage({
        chatId: currentChatId,
        message: userText,
        model: selectedModel,
      });

      if (data && data.assistantMessage) {
        setMessages((prev) => [...prev, data.assistantMessage]);
        if (data.chatId) {
          setCurrentChatId(data.chatId);
          loadChats(); // Refresh sidebar list
        }
      }
    } catch (err) {
      console.error('Failed to generate response:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ Failed to connect to server. Please ensure the backend server is running.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate dynamic prompt idea via Gemini
  const handleGeneratePromptIdea = async (category = 'any') => {
    try {
      setIsGeneratingPrompt(true);
      const data = await requestPromptIdea(category);
      if (data && data.prompt) {
        setInputPrompt(data.prompt);
        return data.prompt;
      }
    } catch (err) {
      console.error('Failed to generate prompt idea:', err);
    } finally {
      setIsGeneratingPrompt(false);
    }
    return null;
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
        githubUser={githubUser}
        onOpenGitHub={() => setGithubModalOpen(true)}
      />

      {/* Main Chat Interface */}
      <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          githubUser={githubUser}
          onOpenGitHub={() => setGithubModalOpen(true)}
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

      {/* GitHub Account Connect Modal */}
      <GitHubConnectModal
        isOpen={githubModalOpen}
        onClose={() => setGithubModalOpen(false)}
        githubUser={githubUser}
        onUserUpdate={setGithubUser}
      />
    </div>
  );
}
