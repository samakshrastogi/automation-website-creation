import React, { useState, useEffect } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  Github,
  Triangle,
  Sparkles,
  Search,
  Cloud,
  CheckCircle2,
  Bot
} from 'lucide-react';

export default function Sidebar({
  isOpen,
  onClose,
  chats = [],
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  githubUser,
  onOpenGitHub,
  vercelUser,
  onOpenVercel,
  onGeneratePromptIdea,
  selectedModel = 'gemini-3.6-flash',
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Keyboard shortcut Ctrl+N / Cmd+N for New Chat
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        onNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNewChat]);

  // Filter conversations
  const filteredChats = chats.filter((chat) =>
    (chat.title || 'Untitled Thread').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 lg:relative glass-panel border-r border-white/10 flex flex-col transition-all duration-300 ease-in-out shrink-0 overflow-hidden bg-slate-950/80 backdrop-blur-2xl ${
          isOpen
            ? 'w-72 translate-x-0 opacity-100'
            : 'w-0 -translate-x-full lg:translate-x-0 lg:w-0 border-r-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-72 flex flex-col h-full shrink-0">
          {/* Top Header */}
          <div className="p-3.5 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1px] shadow-sm">
                <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xs text-white tracking-wide">
                  NexusForge Studio
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  AI Workspaces
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all active:scale-95"
              title="Collapse Sidebar"
              aria-label="Collapse Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="p-3 shrink-0">
            <button
              onClick={() => {
                onNewChat();
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full group flex items-center justify-between py-2.5 px-3.5 rounded-xl font-medium text-xs text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-md shadow-purple-500/20 active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-semibold">New Conversation</span>
              </div>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono rounded bg-black/25 text-white/80 border border-white/15">
                Ctrl+N
              </kbd>
            </button>
          </div>

          {/* Chat History Section */}
          <div className="flex-1 overflow-y-auto px-3 space-y-1.5 py-1">
            {/* Header & Search */}
            <div className="px-1 py-1 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span>Recent Threads</span>
                  {chats.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] text-slate-300 font-mono">
                      {chats.length}
                    </span>
                  )}
                </span>
              </div>

              {/* Search Bar if > 2 chats */}
              {chats.length > 2 && (
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-2.5 py-1 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>
              )}
            </div>

            {/* Empty State */}
            {chats.length === 0 ? (
              <div className="glass-card rounded-2xl p-5 text-center my-6 border border-white/5 mx-1">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-3 text-purple-300">
                  <Bot className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">No Active Threads</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                  Start forging multi-page web applications with instant live code synthesis.
                </p>
                {onGeneratePromptIdea && (
                  <button
                    onClick={() => onGeneratePromptIdea('any')}
                    className="w-full py-1.5 px-3 rounded-lg text-[11px] font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Spark Prompt Idea</span>
                  </button>
                )}
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="text-center py-6 px-2 text-slate-500 text-xs">
                No threads matching "{searchQuery}"
              </div>
            ) : (
              /* Conversation Items */
              filteredChats.map((chat) => {
                const isActive = chat._id === currentChatId;
                return (
                  <div
                    key={chat._id}
                    onClick={() => {
                      onSelectChat(chat._id);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-purple-500/20 text-white border border-purple-500/40 shadow-sm backdrop-blur-md'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
                    }`}
                  >
                    {/* Active Accent Indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-cyan-400 shadow-[0_0_8px_#00f2fe]" />
                    )}

                    <div className="flex items-center gap-2.5 min-w-0 pr-2 pl-1">
                      <MessageSquare
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      />
                      <span className="truncate leading-tight">
                        {chat.title || 'Untitled Web Project'}
                      </span>
                    </div>

                    {/* Delete Action Icon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat._id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all shrink-0"
                      title="Permanently Delete Conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Unified Cloud & Integrations Dock (GitHub & Vercel) */}
          <div className="p-3 border-t border-white/10 shrink-0 space-y-2">
            <div className="flex items-center justify-between px-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <Cloud className="w-3 h-3 text-cyan-400" />
                <span>Cloud Integrations</span>
              </span>
            </div>

            {/* 2-Column Connected Pill Dock */}
            <div className="grid grid-cols-2 gap-1.5">
              {/* GitHub Dock Card */}
              <button
                onClick={onOpenGitHub}
                className={`flex items-center justify-between p-2 rounded-xl border transition-all text-[11px] font-medium min-w-0 ${
                  githubUser
                    ? 'glass-card border-emerald-500/30 text-emerald-300 hover:border-emerald-500/50 bg-emerald-950/15'
                    : 'glass-card border-white/10 text-slate-300 hover:text-white hover:border-cyan-500/30 hover:bg-white/5'
                }`}
                title={githubUser ? `Connected to GitHub as @${githubUser.login}` : 'Connect GitHub Account'}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {githubUser?.avatarUrl ? (
                    <img
                      src={githubUser.avatarUrl}
                      alt={githubUser.login}
                      className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                    />
                  ) : (
                    <Github className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span className="truncate font-mono">
                    {githubUser ? `@${githubUser.login}` : 'GitHub'}
                  </span>
                </div>

                {githubUser ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <span className="text-[9px] text-cyan-300 font-semibold px-1 py-0.2 rounded bg-cyan-500/10 border border-cyan-500/20">
                    Link
                  </span>
                )}
              </button>

              {/* Vercel Dock Card */}
              <button
                onClick={onOpenVercel}
                className={`flex items-center justify-between p-2 rounded-xl border transition-all text-[11px] font-medium min-w-0 ${
                  vercelUser
                    ? 'glass-card border-emerald-500/30 text-emerald-300 hover:border-emerald-500/50 bg-emerald-950/15'
                    : 'glass-card border-white/10 text-slate-300 hover:text-white hover:border-cyan-500/30 hover:bg-white/5'
                }`}
                title={vercelUser ? `Connected to Vercel as @${vercelUser.username}` : 'Connect Vercel Account'}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Triangle className={`w-3.5 h-3.5 shrink-0 ${vercelUser ? 'fill-emerald-400 text-emerald-400' : 'fill-slate-400 text-slate-400'}`} />
                  <span className="truncate font-mono">
                    {vercelUser ? `@${vercelUser.username}` : 'Vercel'}
                  </span>
                </div>

                {vercelUser ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <span className="text-[9px] text-cyan-300 font-semibold px-1 py-0.2 rounded bg-cyan-500/10 border border-cyan-500/20">
                    Link
                  </span>
                )}
              </button>
            </div>

            {/* Bottom Engine Live Beacon */}
            <div className="pt-1 flex items-center justify-between px-1 text-[10px] text-slate-500 border-t border-white/5">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981] animate-pulse" />
                <span className="font-mono text-slate-400">
                  {selectedModel.includes('3.7') ? 'Turbo (v3.7)' : 'Fast (v3.6)'}
                </span>
              </div>
              <span className="text-[9px] text-slate-500">Edge Studio</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
