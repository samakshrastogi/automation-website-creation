import React from 'react';
import { Plus, MessageSquare, Trash2, X, Sparkles } from 'lucide-react';

export default function Sidebar({
  isOpen,
  onClose,
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container (Collapsible on Desktop & Drawer on Mobile) */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 lg:relative glass-panel border-r border-white/10 flex flex-col transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
          isOpen
            ? 'w-72 translate-x-0 opacity-100'
            : 'w-0 -translate-x-full lg:translate-x-0 lg:w-0 border-r-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-72 flex flex-col h-full shrink-0">
          {/* Top Header */}
          <div className="p-4 flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f2fe]" />
              <span className="font-semibold text-sm text-slate-200 uppercase tracking-wider">
                Workspaces & Chats
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="p-4 shrink-0">
            <button
              onClick={() => {
                onNewChat();
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-lg shadow-purple-500/20 active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Conversation</span>
            </button>
          </div>

          {/* Chat History List */}
          <div className="flex-1 overflow-y-auto px-3 space-y-1.5 py-2">
            <p className="px-3 text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-2">
              Recent Conversations
            </p>

            {chats.length === 0 ? (
              <div className="text-center py-10 px-4">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                <p className="text-xs text-slate-400 font-medium">No previous chats</p>
                <p className="text-[11px] text-slate-500 mt-1">Start a conversation or click Generate Prompt</p>
              </div>
            ) : (
              chats.map((chat) => {
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
                        ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30 shadow-sm'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <MessageSquare
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-400'
                        }`}
                      />
                      <span className="truncate">{chat.title || 'Untitled Thread'}</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat._id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Delete Chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
