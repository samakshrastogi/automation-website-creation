import React, { useState, useRef, useMemo } from 'react';
import {
  X,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Download,
  RefreshCw,
  Sparkles,
  Code2,
  Eye,
  Copy,
  Check,
  Globe,
  Layers,
  Compass,
  Volume2,
  VolumeX,
  Palette,
  FolderArchive,
  FileCode
} from 'lucide-react';
import { sanitizeAndHealCode, THEME_PALETTES } from '../services/codeSanitizer.js';
import { exportReactProjectZip } from '../services/projectPackager.js';

export default function WebsitePreviewModal({ isOpen, onClose, htmlCode, title = "Multi-Page Website Studio" }) {
  const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'code' | 'split'
  const [activeTheme, setActiveTheme] = useState('cyber');
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [key, setKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef(null);

  if (!isOpen || !htmlCode) return null;

  // Auto-heal & format the code through the Sanitizer Engine
  const formattedHtml = useMemo(() => {
    return sanitizeAndHealCode(htmlCode, activeTheme, sfxEnabled);
  }, [htmlCode, activeTheme, sfxEnabled]);

  const isReactCode = (
    htmlCode.includes('import React') ||
    htmlCode.includes('export default') ||
    htmlCode.includes('function App') ||
    htmlCode.includes('const App =') ||
    htmlCode.includes('useState(')
  );

  // Single HTML Export
  const handleDownloadHtml = () => {
    const blob = new Blob([formattedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'website-application.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Full React Vite ZIP Project Export
  const handleExportReactZip = async () => {
    try {
      setIsExportingZip(true);
      await exportReactProjectZip(htmlCode, 'ai-web-application');
    } catch (err) {
      console.error('ZIP Export Error:', err);
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenNewTab = () => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(formattedHtml);
      newWindow.document.close();
    }
  };

  const viewportWidths = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[390px]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-6 bg-black/85 backdrop-blur-2xl">
      <div className="glass-panel w-full h-[96vh] rounded-3xl border border-white/20 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header Control Bar */}
        <div className="px-4 md:px-6 py-3 bg-black/60 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          {/* Brand / Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1px] shadow-spark-glow">
              <div className="w-full h-full bg-gemini-darker rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-300" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{title}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Auto-Healed Live Sandbox
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 hidden sm:block">Full React & Tailwind CSS DOM Simulation</p>
            </div>
          </div>

          {/* Center Controls: View Mode & Viewports & Themes */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle (Preview vs Code vs Split) */}
            <div className="flex items-center gap-1 glass-card p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setViewMode('preview')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === 'preview'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
                  viewMode === 'code'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Code</span>
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`hidden md:flex px-2.5 py-1 rounded-lg items-center gap-1.5 transition-all ${
                  viewMode === 'split'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Split</span>
              </button>
            </div>

            {/* Theme Palette Switcher */}
            <div className="hidden lg:flex items-center gap-1 glass-card p-1 rounded-xl border border-white/10">
              {Object.entries(THEME_PALETTES).map(([keyName, pal]) => (
                <button
                  key={keyName}
                  onClick={() => {
                    setActiveTheme(keyName);
                    setKey((k) => k + 1);
                  }}
                  title={pal.name}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    activeTheme === keyName ? 'scale-125 ring-2 ring-white/60' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: pal.primary }}
                />
              ))}
            </div>

            {/* SFX Sound Toggle */}
            <button
              onClick={() => {
                setSfxEnabled(!sfxEnabled);
                setKey((k) => k + 1);
              }}
              className={`p-1.5 rounded-xl border transition-all text-xs flex items-center gap-1 ${
                sfxEnabled ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'text-slate-400 border-white/10'
              }`}
              title={sfxEnabled ? 'SFX Audio Enabled' : 'SFX Audio Muted'}
            >
              {sfxEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden xl:inline text-[11px]">{sfxEnabled ? 'SFX ON' : 'SFX OFF'}</span>
            </button>

            {/* Viewport Switcher */}
            {viewMode !== 'code' && (
              <div className="flex items-center gap-1 glass-card p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setViewport('desktop')}
                  className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                    viewport === 'desktop'
                      ? 'bg-purple-600/40 text-purple-200'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline text-[11px]">Desktop</span>
                </button>
                <button
                  onClick={() => setViewport('tablet')}
                  className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                    viewport === 'tablet'
                      ? 'bg-purple-600/40 text-purple-200'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tablet View"
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline text-[11px]">Tablet</span>
                </button>
                <button
                  onClick={() => setViewport('mobile')}
                  className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                    viewport === 'mobile'
                      ? 'bg-purple-600/40 text-purple-200'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline text-[11px]">Mobile</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setKey((k) => k + 1)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Reload Sandbox Frame"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyCode}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Copy Full Codebase"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleOpenNewTab}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Open in Full Browser Tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>

            {/* Export HTML */}
            <button
              onClick={handleDownloadHtml}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5 transition-all"
              title="Download Single HTML Package"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-300" />
              <span className="hidden sm:inline">HTML</span>
            </button>

            {/* Export React ZIP Project */}
            <button
              onClick={handleExportReactZip}
              disabled={isExportingZip}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-md shadow-purple-500/20 flex items-center gap-1.5 transition-all active:scale-95"
              title="Download Complete React 18 + Vite + Tailwind Project ZIP"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>{isExportingZip ? 'Packing ZIP...' : 'Export React ZIP'}</span>
            </button>

            <div className="w-[1px] h-5 bg-white/10 mx-1" />
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area: Preview / Code / Split */}
        <div className="flex-1 bg-slate-950/90 overflow-hidden flex flex-col md:flex-row">
          {/* Code Viewer Panel (when in code or split mode) */}
          {(viewMode === 'code' || viewMode === 'split') && (
            <div
              className={`border-r border-white/10 bg-slate-950 flex flex-col overflow-hidden ${
                viewMode === 'code' ? 'w-full' : 'w-full md:w-1/2'
              }`}
            >
              <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono flex items-center gap-1.5 text-cyan-300">
                  <Code2 className="w-3.5 h-3.5" />
                  {isReactCode ? 'App.jsx (Full React Codebase)' : 'index.html'}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="px-2 py-0.5 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors text-[11px] flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="flex-1 p-4 overflow-auto text-xs text-slate-200 font-mono leading-relaxed bg-black/60">
                <code>{htmlCode}</code>
              </pre>
            </div>
          )}

          {/* Sandbox IFrame Preview Panel */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div
              className={`flex-1 bg-slate-950/80 overflow-auto flex items-center justify-center p-2 md:p-4 ${
                viewMode === 'split' ? 'hidden md:flex md:w-1/2' : 'w-full'
              }`}
            >
              <div
                className={`h-full transition-all duration-300 shadow-2xl rounded-2xl overflow-hidden border border-white/15 bg-slate-950 ${viewportWidths[viewport]}`}
              >
                <iframe
                  ref={iframeRef}
                  key={key}
                  title="Multi-Page Website Live Sandbox"
                  srcDoc={formattedHtml}
                  sandbox="allow-scripts allow-modals allow-same-origin allow-forms"
                  className="w-full h-full border-none bg-slate-950"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
