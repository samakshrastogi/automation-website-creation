import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Sparkles,
  User,
  Copy,
  Check,
  Terminal,
  Eye,
  FolderArchive,
  Download,
  Layers,
  Globe,
  Code2
} from 'lucide-react';
import WebsitePreviewModal from './WebsitePreviewModal.jsx';
import { exportReactProjectZip } from '../services/projectPackager.js';

export default function ChatMessage({ message, isLast }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [isExportingZip, setIsExportingZip] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText('npm install && npm run dev');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  // Detect if message contains website codebase (fenced or raw)
  const isWebsiteProject = (
    !isUser && (
      message.content.includes('```html') ||
      message.content.includes('```jsx') ||
      message.content.includes('```tsx') ||
      message.content.includes('```js') ||
      message.content.includes('import React') ||
      message.content.includes('export default') ||
      message.content.includes('<!DOCTYPE html>') ||
      message.content.includes('function App') ||
      message.content.includes('const App =') ||
      message.content.includes('useState(')
    )
  );

  // Extract primary code for ZIP packaging & Preview (fenced or raw)
  const getPrimaryCode = () => {
    const codeBlocks = Array.from(message.content.matchAll(/```(?:jsx|html|tsx|js|javascript)?\s*([\s\S]*?)```/g));
    if (codeBlocks.length > 0) {
      const largest = codeBlocks.reduce((prev, curr) => (curr[1].length > prev[1].length ? curr : prev));
      return largest[1].trim();
    }
    
    // If no markdown fences, extract from the first recognized code keyword
    const codeStartKeywords = [
      '<!DOCTYPE html>',
      '<html',
      'import React',
      'import {',
      'export default',
      'function App',
      'const App =',
      'const { useState',
      '// --- MOCK DATA',
      'const PRODUCTS'
    ];
    let earliestIdx = -1;
    for (const kw of codeStartKeywords) {
      const idx = message.content.indexOf(kw);
      if (idx !== -1 && (earliestIdx === -1 || idx < earliestIdx)) {
        earliestIdx = idx;
      }
    }
    if (earliestIdx !== -1) {
      return message.content.slice(earliestIdx).trim();
    }

    return message.content.trim();
  };

  // Extract human-readable summary text and completely strip any raw code
  const getCleanSummaryText = () => {
    // 1. Strip markdown code fences
    let text = message.content.replace(/```(?:jsx|html|tsx|js|javascript)?\s*[\s\S]*?```/g, '').trim();

    // 2. Strip raw imports or inline code starts
    const rawCodeKeywords = ['import React', 'export default', '<!DOCTYPE html>', 'const App =', 'function App('];
    for (const kw of rawCodeKeywords) {
      const idx = text.indexOf(kw);
      if (idx !== -1) {
        text = text.slice(0, idx).trim();
      }
    }

    return text;
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

  const summaryText = getCleanSummaryText();

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
                  <span className="text-cyan-300 font-bold">Gemini Hybrid Engine</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono border border-purple-500/30">
                    {message.model || 'gemini-3.6-flash'}
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
              
              {/* Natural Language Summary Section */}
              {isWebsiteProject ? (
                <div className="prose-gemini prose-sm max-w-none text-slate-200 leading-relaxed">
                  {summaryText ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {summaryText}
                    </ReactMarkdown>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-base font-bold text-white flex items-center gap-2">
                        <span>✨</span>
                        <span>We have implemented all of your requirements!</span>
                      </p>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Here is the complete summary of what has been crafted for your request:
                      </p>
                      <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside mt-2 bg-white/5 p-3 rounded-xl border border-white/10">
                        <li><strong>Multi-Page Architecture:</strong> Stateful client routing across all core views with sticky navigation and mobile drawers.</li>
                        <li><strong>3D Visual Design:</strong> High-performance Three.js WebGL graphics with real-time mouse physics and dynamic lighting.</li>
                        <li><strong>Modern Glassmorphism:</strong> Dark cyberpunk theme with translucent glass panels, glow accents, and responsive layouts.</li>
                        <li><strong>Interactive Functionality:</strong> Complete mock dataset, search/filter logic, interactive modal drawers, and toast feedback.</li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="prose-gemini prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}

              {/* Ready-to-Deploy Project Archive Download Card (Placed in last) */}
              {isWebsiteProject && (
                <div className="rounded-2xl bg-gradient-to-br from-purple-950/70 via-slate-900/95 to-cyan-950/70 border border-cyan-500/30 hover:border-cyan-500/50 p-4 sm:p-5 shadow-2xl relative overflow-hidden not-prose transition-all mt-3">
                  {/* Decorative ambient background glows */}
                  <div className="absolute -top-12 -right-12 w-40 h-40 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

                  {/* Main Row: Icon + Title + Dual Action Buttons */}
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Left: Brand Icon & Title Info */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1px] shadow-lg shadow-purple-500/20 shrink-0">
                        <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
                          <FolderArchive className="w-5 h-5 text-cyan-300" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h4 className="text-sm sm:text-base font-bold text-white tracking-wide">
                            Production-Ready Project Archive
                          </h4>
                          <span className="whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            ZIP Ready
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 truncate">
                          Vite + React 18 + Three.js 3D + Tailwind CSS
                        </p>
                      </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
                      {/* 1-Click ZIP Download */}
                      <button
                        onClick={handleDownloadProjectZip}
                        disabled={isExportingZip}
                        className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all flex items-center justify-center gap-2"
                        title="Download Complete Zero-Config ZIP Repository"
                      >
                        <Download className="w-4 h-4 text-white" />
                        <span>{isExportingZip ? 'Packing Repository...' : 'Download Project (.ZIP)'}</span>
                      </button>

                      {/* Live 3D Studio */}
                      <button
                        onClick={() => setPreviewHtml(getPrimaryCode())}
                        className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-white/10 hover:bg-cyan-500/10 border border-white/15 hover:border-cyan-400/50 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        title="Launch Interactive 3D Studio Preview"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-300" />
                        <span>Live 3D Studio</span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom Bar: 1-Click Copyable Command */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between relative z-10">
                    <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                      Quickstart:
                    </span>
                    <button
                      onClick={handleCopyCommand}
                      className="px-3 py-1.5 rounded-lg bg-black/50 hover:bg-black/70 border border-white/10 hover:border-cyan-500/40 text-[11px] font-mono text-slate-300 flex items-center gap-1.5 transition-all active:scale-95 group ml-auto"
                      title="Click to copy start command"
                    >
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Run <code className="text-cyan-300 font-semibold">npm install && npm run dev</code></span>
                      {copiedCmd ? (
                        <Check className="w-3 h-3 text-emerald-400 ml-1" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-500 group-hover:text-slate-300 ml-1" />
                      )}
                    </button>
                  </div>
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
