import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, User, Copy, Check, Terminal, Play, Eye } from 'lucide-react';
import WebsitePreviewModal from './WebsitePreviewModal.jsx';

export default function ChatMessage({ message, isLast }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
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
                    {message.model || 'Gemini 3.6'}
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
              {/* If web code is detected, render quick-action launch banner */}
              {(message.content.includes('```html') ||
                message.content.includes('```jsx') ||
                message.content.includes('```tsx') ||
                message.content.includes('export default function') ||
                message.content.includes('<!DOCTYPE html>')) && (
                <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-cyan-900/40 border border-purple-500/30 flex items-center justify-between gap-3 shadow-lg not-prose">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-cyan-300 border border-purple-500/30">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Multi-Page Website Codebase Ready</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Full App
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400">Interactive client routing, 3D Canvas & Glassmorphism</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const codeBlocks = Array.from(message.content.matchAll(/```(?:jsx|html|tsx|js|javascript)?\s*([\s\S]*?)```/g));
                      let extractedCode = message.content;
                      if (codeBlocks.length > 0) {
                        const largest = codeBlocks.reduce((prev, curr) => (curr[1].length > prev[1].length ? curr : prev));
                        extractedCode = largest[1].trim();
                      }
                      setPreviewHtml(extractedCode);
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-md shadow-purple-500/20 flex items-center gap-2 active:scale-95 transition-all shrink-0"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Launch Live Preview</span>
                  </button>
                </div>
              )}

              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, className, children, ...rest }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const lang = match ? match[1].toLowerCase() : '';
                    const rawCode = String(children).replace(/\n$/, '');
                    const isInline = !className && !rawCode.includes('\n');
                    const isHtmlOrWeb =
                      lang === 'html' ||
                      lang === 'jsx' ||
                      lang === 'tsx' ||
                      lang === 'js' ||
                      lang === 'javascript' ||
                      rawCode.includes('<!DOCTYPE') ||
                      rawCode.includes('<html') ||
                      (rawCode.includes('<div') && (rawCode.includes('class') || rawCode.includes('className'))) ||
                      (rawCode.includes('export default') && (rawCode.includes('return') || rawCode.includes('<')));

                    // Detect filename if present in first line comment
                    const firstLine = rawCode.split('\n')[0];
                    let detectedFileName = '';
                    if (firstLine.includes('//') || firstLine.includes('/*')) {
                      const fileMatch = firstLine.match(/(?:filename:|file:|\/\/\s*)([\w.-]+\.(?:jsx|tsx|html|js|css|json))/i);
                      if (fileMatch) detectedFileName = fileMatch[1];
                    }

                    const handleDownloadBlock = () => {
                      const ext = lang === 'html' ? 'html' : lang === 'css' ? 'css' : 'jsx';
                      const filename = detectedFileName || `website-app.${ext}`;
                      const blob = new Blob([rawCode], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = filename;
                      a.click();
                      URL.revokeObjectURL(url);
                    };

                    return !isInline ? (
                      <div className="relative my-3 rounded-2xl overflow-hidden border border-white/10 bg-black/50 shadow-inner not-prose">
                        <div className="flex items-center justify-between px-3.5 py-2 bg-white/5 border-b border-white/10 text-[11px] text-slate-400 font-mono">
                          <span className="flex items-center gap-2">
                            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="font-semibold text-slate-300">
                              {detectedFileName || match ? match[1].toUpperCase() : 'CODE'}
                            </span>
                            {isHtmlOrWeb && (
                              <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[9px] font-sans">
                                Multi-Page Ready
                              </span>
                            )}
                          </span>
                          <div className="flex items-center gap-2">
                            {isHtmlOrWeb && (
                              <button
                                onClick={() => setPreviewHtml(rawCode)}
                                className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-400 hover:to-purple-500 transition-all text-[11px] font-medium flex items-center gap-1 shadow-sm active:scale-95"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Preview</span>
                              </button>
                            )}
                            <button
                              onClick={handleDownloadBlock}
                              className="px-2 py-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors text-[11px] flex items-center gap-1"
                              title="Download File"
                            >
                              Download
                            </button>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(rawCode);
                              }}
                              className="px-2 py-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors text-[11px] flex items-center gap-1"
                              title="Copy code"
                            >
                              <Copy className="w-3 h-3" />
                              Copy
                            </button>
                          </div>
                        </div>
                        <pre className="p-4 text-xs overflow-x-auto text-slate-200 font-mono leading-relaxed max-h-[500px]">
                          <code className={className}>
                            {children}
                          </code>
                        </pre>
                      </div>
                    ) : (
                      <code className="bg-purple-500/20 text-purple-200 px-1.5 py-0.5 rounded text-xs font-mono">
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

      {/* Sandboxed Live Website Preview Modal */}
      <WebsitePreviewModal
        isOpen={Boolean(previewHtml)}
        onClose={() => setPreviewHtml(null)}
        htmlCode={previewHtml}
        title="Automated Website Preview"
      />
    </>
  );
}
