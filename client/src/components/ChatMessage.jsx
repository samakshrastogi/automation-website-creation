import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Sparkles,
  User,
  Copy,
  Check,
  Terminal,
  Play,
  Eye,
  FolderArchive,
  Download,
  Box,
  Layers,
  ChevronDown,
  ChevronUp,
  FileCode,
  Cpu,
  Globe
} from 'lucide-react';
import WebsitePreviewModal from './WebsitePreviewModal.jsx';
import { exportReactProjectZip } from '../services/projectPackager.js';

export default function ChatMessage({ message, isLast }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [showRawCode, setShowRawCode] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Detect if message contains website codebase
  const isWebsiteProject = (
    !isUser && (
      message.content.includes('```html') ||
      message.content.includes('```jsx') ||
      message.content.includes('```tsx') ||
      message.content.includes('export default function') ||
      message.content.includes('<!DOCTYPE html>')
    )
  );

  // Extract primary code
  const getPrimaryCode = () => {
    const codeBlocks = Array.from(message.content.matchAll(/```(?:jsx|html|tsx|js|javascript)?\s*([\s\S]*?)```/g));
    if (codeBlocks.length > 0) {
      const largest = codeBlocks.reduce((prev, curr) => (curr[1].length > prev[1].length ? curr : prev));
      return largest[1].trim();
    }
    return message.content;
  };

  // Direct 1-Click ZIP Exporter from chat
  const handleDownloadProjectZip = async () => {
    try {
      setIsExportingZip(true);
      const code = getPrimaryCode();
      await exportReactProjectZip(code, 'custom-web-application');
    } catch (err) {
      console.error('Failed to export ZIP:', err);
    } finally {
      setIsExportingZip(false);
    }
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
          className={`relative group max-w-[88%] md:max-w-[82%] rounded-2xl p-4 md:p-6 text-sm transition-all ${
            isUser
              ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-500/30 text-white shadow-lg backdrop-blur-md'
              : 'glass-panel border border-white/10 text-slate-200 shadow-xl backdrop-blur-xl'
          }`}
        >
          {/* Header inside Bubble */}
          <div className="flex items-center justify-between gap-4 mb-3 pb-2 border-b border-white/5 text-[11px] text-slate-400">
            <span className="font-semibold flex items-center gap-1.5">
              {isUser ? (
                <span className="text-purple-300">You</span>
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
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            </div>
          </div>

          {/* Text / Markdown Body */}
          {isUser ? (
            <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
          ) : (
            <div className="space-y-4">
              
              {/* Ready-to-Deploy Project Archive Hero Card */}
              {isWebsiteProject && (
                <div className="rounded-2xl bg-gradient-to-br from-purple-950/60 via-slate-900/90 to-cyan-950/60 border border-cyan-500/30 p-4 md:p-5 shadow-2xl relative overflow-hidden not-prose">
                  {/* Decorative background glow */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-[1px] shadow-lg shrink-0">
                        <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                          <FolderArchive className="w-5 h-5 text-cyan-300" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white tracking-wide">
                            Production-Ready Project Archive
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            ZIP Ready
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Vite + React 18 + Three.js 3D + Tailwind CSS + Lucide
                        </p>
                      </div>
                    </div>

                    {/* Dual Action Buttons */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      {/* 1-Click ZIP Download */}
                      <button
                        onClick={handleDownloadProjectZip}
                        disabled={isExportingZip}
                        className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                        title="Download Complete Project ZIP"
                      >
                        <Download className="w-4 h-4 text-white" />
                        <span>{isExportingZip ? 'Packing Repository...' : 'Download Project (.ZIP)'}</span>
                      </button>

                      {/* Live 3D Preview */}
                      <button
                        onClick={() => setPreviewHtml(getPrimaryCode())}
                        className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                        title="Launch Interactive 3D Studio"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-300" />
                        <span className="hidden sm:inline">Live 3D Studio</span>
                      </button>
                    </div>
                  </div>

                  {/* Included Repository Files Preview */}
                  <div className="pt-3 border-t border-white/10">
                    <div className="text-[11px] font-mono text-slate-400 mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                        <Layers className="w-3.5 h-3.5 text-cyan-400" />
                        Included File & Folder Structure:
                      </span>
                      <span className="text-[10px] text-slate-500">Zero-Config Vite Setup</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                      <span className="px-2 py-1 rounded-lg bg-black/40 border border-white/10 text-cyan-300 flex items-center gap-1">
                        📄 package.json
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-black/40 border border-white/10 text-purple-300 flex items-center gap-1">
                        📄 vite.config.js
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-black/40 border border-white/10 text-emerald-300 flex items-center gap-1">
                        📄 tailwind.config.js
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-black/40 border border-white/10 text-amber-300 flex items-center gap-1">
                        📄 index.html
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-black/40 border border-white/10 text-indigo-300 flex items-center gap-1">
                        📄 src/main.jsx
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-black/40 border border-white/10 text-cyan-300 flex items-center gap-1">
                        📄 src/App.jsx
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-black/40 border border-white/10 text-pink-300 flex items-center gap-1">
                        📄 src/components/Canvas3D.jsx
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-black/40 border border-white/10 text-slate-400 flex items-center gap-1">
                        📄 README.md
                      </span>
                    </div>
                  </div>

                  {/* Collapsible Source Code Inspector Toggle */}
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                    <button
                      onClick={() => setShowRawCode(!showRawCode)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors font-mono"
                    >
                      {showRawCode ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />}
                      <span>{showRawCode ? 'Hide Source Code Stream' : 'Inspect Source Code Stream'}</span>
                    </button>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Run `npm install && npm run dev`
                    </span>
                  </div>
                </div>
              )}

              {/* Message Markdown Content (Collapsible if website project, otherwise regular) */}
              {(!isWebsiteProject || showRawCode) && (
                <div className="prose-gemini prose-sm max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, className, children, ...rest }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const lang = match ? match[1].toLowerCase() : '';
                        const rawCode = String(children).replace(/\n$/, '');
                        const isInline = !className && !rawCode.includes('\n');

                        return !isInline ? (
                          <div className="relative my-3 rounded-2xl overflow-hidden border border-white/10 bg-black/60 shadow-inner not-prose">
                            <div className="flex items-center justify-between px-3.5 py-2 bg-white/5 border-b border-white/10 text-[11px] text-slate-400 font-mono">
                              <span className="flex items-center gap-2">
                                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                                <span className="font-semibold text-slate-300">
                                  {match ? match[1].toUpperCase() : 'CODE'}
                                </span>
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setPreviewHtml(rawCode)}
                                  className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-400 hover:to-purple-500 transition-all text-[11px] font-medium flex items-center gap-1 shadow-sm active:scale-95"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Preview</span>
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
                            <pre className="p-4 text-xs overflow-x-auto text-slate-200 font-mono leading-relaxed max-h-[400px]">
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
