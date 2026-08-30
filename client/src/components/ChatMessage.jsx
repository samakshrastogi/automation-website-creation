import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  Code2,
  ExternalLink,
  RefreshCw,
  User,
  Bot,
  Eye,
  FolderArchive,
  Layers,
  FileCode,
  Github,
  Triangle
} from 'lucide-react';
import WebsitePreviewModal from './WebsitePreviewModal.jsx';
import PushToGitHubModal from './PushToGitHubModal.jsx';
import DeployToVercelModal from './DeployToVercelModal.jsx';
import { exportReactProjectZip } from '../services/projectPackager.js';

export default function ChatMessage({ message, isLast }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(null);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [pushGithubOpen, setPushGithubOpen] = useState(false);
  const [deployVercelOpen, setDeployVercelOpen] = useState(false);

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
    let text = message.content;

    // 1. Strip closed markdown code blocks
    text = text.replace(/```(?:jsx|html|tsx|js|javascript|css)?[\s\S]*?```/gi, '');

    // 2. Strip unclosed markdown code blocks (e.g. ```jsx to end of content)
    text = text.replace(/```[\s\S]*$/g, '');

    // 3. Strip from first occurrence of code start keywords
    const rawCodeKeywords = [
      'import React',
      'import {',
      'import "',
      "import '",
      'export default',
      '<!DOCTYPE html>',
      '<html',
      'function App',
      'const App =',
      'const { useState',
      '// --- MOCK DATA',
      'const PRODUCTS'
    ];
    let earliestIdx = -1;
    for (const kw of rawCodeKeywords) {
      const idx = text.indexOf(kw);
      if (idx !== -1 && (earliestIdx === -1 || idx < earliestIdx)) {
        earliestIdx = idx;
      }
    }
    if (earliestIdx !== -1) {
      text = text.slice(0, earliestIdx);
    }

    // 4. Clean stray backticks, symbols, and language words (jsx, tsx, html, js, javascript, css)
    text = text.replace(/`+/g, '');
    text = text.replace(/\b(jsx|tsx|html|javascript|js|css|json)\b/gi, '');
    text = text.trim();

    // 5. If remaining text is too short or doesn't have real sentence words, ignore it
    if (text.length < 10 || /^[^a-zA-Z0-9]+$/.test(text)) {
      return '';
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
        className={`chat-message-row flex gap-3 md:gap-4 w-full max-w-4xl mx-auto py-3 px-2 md:px-4 ${
          isUser ? 'justify-end' : 'justify-start'
        }`}
      >
        {/* AI Avatar */}
        {!isUser && (
          <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1px] shadow-spark-glow">
            <div className="w-full h-full bg-gemini-darker rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-300" />
            </div>
          </div>
        )}

        {/* Message Content Bubble */}
        <div
          className={`relative group max-w-[90%] md:max-w-[85%] rounded-2xl p-4 md:p-5 text-sm transition-all ${
            isUser
              ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-500/30 text-white shadow-lg backdrop-blur-md'
              : 'glass-panel border border-white/10 text-slate-200 shadow-xl backdrop-blur-xl'
          }`}
        >
          {/* Header inside Bubble */}
          <div className="flex items-center justify-between gap-4 mb-2.5 pb-1.5 border-b border-white/5 text-[11px] text-slate-400">
            <span className="font-semibold flex items-center gap-1.5">
              {isUser ? (
                <span className="text-purple-300">You</span>
              ) : (
                <>
                  <span className="text-cyan-300 font-bold">AI Web Architect</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono border border-purple-500/30">
                    Engine Pro
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
            <div className="space-y-2">
              
              {/* Natural Language Summary (Suppress pre/code tags to avoid empty black boxes) */}
              {summaryText && summaryText.length > 3 ? (
                <div className="prose-gemini prose-sm max-w-none text-slate-200 leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      pre: () => null,
                      code: ({ children }) => <span className="text-cyan-300 font-semibold">{children}</span>
                    }}
                  >
                    {summaryText}
                  </ReactMarkdown>
                </div>
              ) : null}

              {/* Ultra-Compact Project Action Capsule */}
              {isWebsiteProject && (
                <div className="rounded-xl bg-gradient-to-r from-purple-950/80 via-slate-900/90 to-cyan-950/80 border border-cyan-500/30 hover:border-cyan-500/50 p-3 sm:p-3.5 shadow-lg relative overflow-hidden not-prose transition-all mt-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                    
                    {/* Left: Icon + Title + Status Badge */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1px] shadow-sm shrink-0">
                        <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                          <FolderArchive className="w-4 h-4 text-cyan-300" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                          Production-Ready Project Archive
                        </h4>
                        <span className="whitespace-nowrap inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          ZIP Ready
                        </span>
                      </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap">
                      {/* 1-Click Deploy to Vercel */}
                      <button
                        onClick={() => setDeployVercelOpen(true)}
                        className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold text-white bg-slate-900/90 hover:bg-slate-800 border border-white/15 hover:border-cyan-400/50 shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
                        title="Deploy live to Vercel in 1-click"
                      >
                        <Triangle className="w-3 h-3 fill-cyan-300 text-cyan-300" />
                        <span className="hidden sm:inline">Deploy to Vercel</span>
                        <span className="sm:hidden">Vercel</span>
                      </button>

                      {/* 1-Click Push to GitHub */}
                      <button
                        onClick={() => setPushGithubOpen(true)}
                        className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold text-white bg-slate-900/90 hover:bg-slate-800 border border-white/15 hover:border-cyan-400/50 shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
                        title="Push project directly to your GitHub repository"
                      >
                        <Github className="w-3.5 h-3.5 text-cyan-300" />
                        <span className="hidden sm:inline">Push to GitHub</span>
                        <span className="sm:hidden">GitHub</span>
                      </button>

                      {/* 1-Click ZIP Download */}
                      <button
                        onClick={handleDownloadProjectZip}
                        disabled={isExportingZip}
                        className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold text-white bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-md shadow-cyan-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                        title="Download Complete Zero-Config ZIP Repository"
                      >
                        <Download className="w-3.5 h-3.5 text-white" />
                        <span className="hidden sm:inline">{isExportingZip ? 'Packing...' : 'Download ZIP'}</span>
                        <span className="sm:hidden">{isExportingZip ? '...' : 'ZIP'}</span>
                      </button>

                      {/* Live 3D Studio */}
                      <button
                        onClick={() => setPreviewHtml(getPrimaryCode())}
                        className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold text-slate-200 bg-white/10 hover:bg-cyan-500/10 border border-white/15 hover:border-cyan-400/40 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
                        title="Launch Interactive 3D Studio Preview"
                      >
                        <Eye className="w-3.5 h-3.5 text-cyan-300" />
                        <span className="hidden sm:inline">Live Studio</span>
                        <span className="sm:hidden">Preview</span>
                      </button>
                    </div>
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
        title="Project Preview"
      />

      {/* Push to GitHub Modal */}
      <PushToGitHubModal
        isOpen={pushGithubOpen}
        onClose={() => setPushGithubOpen(false)}
        rawCode={getPrimaryCode()}
        defaultRepoName="nexusforge-app"
      />

      {/* Deploy to Vercel Modal */}
      <DeployToVercelModal
        isOpen={deployVercelOpen}
        onClose={() => setDeployVercelOpen(false)}
        rawCode={getPrimaryCode()}
        defaultProjectName="nexusforge-app"
      />
    </>
  );
}
