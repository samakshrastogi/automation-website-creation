import React, { useState, useEffect } from 'react';
import Background3D from './components/Background3D.jsx';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import PromptInput from './components/PromptInput.jsx';
import GitHubConnectModal from './components/GitHubConnectModal.jsx';
import VercelConnectModal from './components/VercelConnectModal.jsx';
import {
  sendChatMessage,
  requestPromptIdea,
  getChatThreads,
  getChatDetails,
  removeChatThread,
  getSystemHealth,
} from './services/api.js';
import { getStoredGitHubUser } from './services/githubService.js';
import { getStoredVercelUser } from './services/vercelService.js';

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
  const [vercelUser, setVercelUser] = useState(getStoredVercelUser());
  const [vercelModalOpen, setVercelModalOpen] = useState(false);

  // Initial load: Fetch chat history & system health & check for GitHub OAuth redirect
  useEffect(() => {
    loadChats();
    checkHealthStatus();
    handleGitHubOAuthRedirect();
  }, []);

  const handleGitHubOAuthRedirect = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      if (code) {
        // If opened inside popup window, notify opener window and close
        if (window.opener) {
          window.opener.postMessage({ type: 'GITHUB_OAUTH_CODE', code }, window.location.origin);
          window.close();
          return;
        }

        // Direct full-page redirect exchange
        const res = await fetch('/api/auth/github/oauth-exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        const data = await res.json();
        if (res.ok && data.user && data.token) {
          localStorage.setItem('nexusforge_github_token', data.token);
          localStorage.setItem('nexusforge_github_user', JSON.stringify(data.user));
          setGithubUser(data.user);
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (e) {
      console.warn('OAuth redirect check:', e);
    }
  };

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

  // Permanently delete chat thread
  const handleDeleteChat = async (chatId) => {
    if (!chatId) return;

    // 1. Optimistically purge from sidebar state immediately
    setChats((prev) => prev.filter((c) => c._id !== chatId));

    // 2. If user is currently inside the deleted conversation, reset to fresh state
    if (currentChatId === chatId) {
      handleNewChat();
    }

    try {
      // 3. Permanently delete from server (MongoDB + In-Memory)
      await removeChatThread(chatId);
    } catch (err) {
      console.error('Failed to permanently delete chat:', err);
      // Resync in case of error
      loadChats();
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
        vercelUser={vercelUser}
        onOpenVercel={() => setVercelModalOpen(true)}
        onGeneratePromptIdea={handleGeneratePromptIdea}
        selectedModel={selectedModel}
      />

      {/* Main Chat Interface */}
      <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
        {/* 3D Background Canvas (Auto-centered in remaining space) */}
        <Background3D isGenerating={isGenerating} />

        {/* Top Header */}
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
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

      {/* Vercel Account Connect Modal */}
      <VercelConnectModal
        isOpen={vercelModalOpen}
        onClose={() => setVercelModalOpen(false)}
        vercelUser={vercelUser}
        onUserUpdate={setVercelUser}
      />
    </div>
  );
}
