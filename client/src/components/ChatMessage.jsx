import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, User, Copy, Check, Terminal } from 'lucide-react';

export default function ChatMessage({ message, isLast }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`chat-message-row flex gap-3.5 md:gap-5 w-full max-w-4xl mx-auto py-4 px-2 md:px-4 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div className="shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1px] shadow-spark-glow">
          <div className="w-full h-full bg-gemini-darker rounded-[11px] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-cyan-300" />
          </div>
        </div>
      )}

      {/* Message Content Bubble */}
      <div
        className={`relative group max-w-[85%] md:max-w-[78%] rounded-2xl p-4 md:p-5 text-sm transition-all ${
          isUser
            ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-500/30 text-white shadow-lg backdrop-blur-md'
            : 'glass-panel border border-white/10 text-slate-200 shadow-xl backdrop-blur-xl'
        }`}
      >
        {/* Header inside Bubble */}
        <div className="flex items-center justify-between gap-4 mb-2 pb-1 border-b border-white/5 text-[11px] text-slate-400">
          <span className="font-semibold flex items-center gap-1.5">
            {isUser ? (
              <>
                <span className="text-purple-300">You</span>
              </>
            ) : (
              <>
                <span className="text-cyan-300">Gemini Hybrid Engine</span>
                <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px]">
                  {message.model || 'Gemini 1.5'}
                </span>
              </>
            )}
          </span>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500">
              {new Date(message.timestamp || Date.now()).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <button
              onClick={handleCopy}
              className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
              title="Copy message"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Text / Markdown Body */}
        {isUser ? (
          <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
        ) : (
          <div className="prose-gemini prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline ? (
                    <div className="relative my-3 rounded-xl overflow-hidden border border-white/10 bg-black/50 shadow-inner">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-white/10 text-[11px] text-slate-400 font-mono">
                        <span className="flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                          {match ? match[1] : 'code'}
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                          }}
                          className="hover:text-white transition-colors text-[10px] flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </button>
                      </div>
                      <pre className="p-3 text-xs overflow-x-auto text-slate-200 font-mono">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  ) : (
                    <code className="bg-purple-500/20 text-purple-200 px-1.5 py-0.5 rounded text-xs" {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px] shadow-sm">
          <div className="w-full h-full bg-gemini-darker rounded-[11px] flex items-center justify-center">
            <User className="w-4 h-4 text-cyan-300" />
          </div>
        </div>
      )}
    </div>
  );
}
