import React, { useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
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

  // Auto-heal & format the code through the Sanitizer Engine (called unconditionally)
  const formattedHtml = useMemo(() => {
    if (!htmlCode) return '';
    return sanitizeAndHealCode(htmlCode, activeTheme, sfxEnabled);
  }, [htmlCode, activeTheme, sfxEnabled]);

  const isReactCode = Boolean(
    htmlCode && (
      htmlCode.includes('import React') ||
      htmlCode.includes('export default') ||
      htmlCode.includes('function App') ||
      htmlCode.includes('const App =') ||
      htmlCode.includes('useState(')
    )
  );

  // Guard after ALL hooks have been registered
  if (!isOpen || !htmlCode) return null;

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
    tablet: 'w-[768px] max-w-full',
    mobile: 'w-[390px] max-w-full',
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-2xl overflow-hidden">
      <div 
        className="w-full h-full max-h-[96vh] rounded-3xl border border-white/20 shadow-2xl flex flex-col overflow-hidden bg-slate-950/95"
      >
        {/* Top Header Control Bar */}
        <div className="px-4 py-3 bg-slate-900/90 border-b border-white/10 flex items-center justify-between gap-2 md:gap-4 shrink-0">
          
          {/* Left: Brand & Status Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-300" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white truncate">{title}</h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Live Sandbox
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate hidden md:block">Full React, Tailwind & WebGL Simulator</p>
            </div>
          </div>

          {/* Center: View Modes, Palettes, SFX & Viewports */}
          <div className="flex items-center gap-1.5 md:gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 rounded-xl bg-white/5 border border-white/10 text-xs">
              <button
                onClick={() => setViewMode('preview')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  viewMode === 'preview'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Preview Screen"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Preview</span>
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  viewMode === 'code'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Code Inspector"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Code</span>
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`hidden lg:flex px-2.5 py-1 rounded-lg items-center gap-1 transition-all ${
                  viewMode === 'split'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Side-by-Side Split View"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Split</span>
              </button>
            </div>

            {/* Theme Palette Dots */}
            <div className="hidden xl:flex items-center gap-1 px-2 py-1 rounded-xl bg-white/5 border border-white/10">
              {Object.entries(THEME_PALETTES).map(([keyName, pal]) => (
                <button
                  key={keyName}
                  onClick={() => {
                    setActiveTheme(keyName);
                    setKey((k) => k + 1);
                  }}
                  title={pal.name}
                  className={`w-4 h-4 rounded-full transition-transform ${
                    activeTheme === keyName ? 'scale-125 ring-2 ring-white shadow-lg' : 'opacity-50 hover:opacity-100'
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
                sfxEnabled ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'text-slate-400 border-white/10 bg-white/5'
              }`}
              title={sfxEnabled ? 'SFX Audio Enabled' : 'SFX Audio Muted'}
            >
              {sfxEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-300" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden 2xl:inline text-[11px] font-mono">{sfxEnabled ? 'SFX' : 'MUTED'}</span>
            </button>

            {/* Viewport Switcher */}
            {viewMode !== 'code' && (
              <div className="hidden sm:flex items-center p-0.5 rounded-xl bg-white/5 border border-white/10">
                <button
                  onClick={() => setViewport('desktop')}
                  className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                    viewport === 'desktop' ? 'bg-purple-600/50 text-white font-medium' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewport('tablet')}
                  className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                    viewport === 'tablet' ? 'bg-purple-600/50 text-white font-medium' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tablet View (768px)"
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewport('mobile')}
                  className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                    viewport === 'mobile' ? 'bg-purple-600/50 text-white font-medium' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Mobile View (390px)"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setKey((k) => k + 1)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Reload Frame"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCopyCode}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Copy Code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleOpenNewTab}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Open in Full Window"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {/* Export HTML */}
            <button
              onClick={handleDownloadHtml}
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5 transition-all"
              title="Download Standalone HTML"
            >
              <FileCode className="w-3.5 h-3.5 text-cyan-300" />
              <span className="hidden sm:inline">HTML</span>
            </button>

            {/* Export React ZIP Project */}
            <button
              onClick={handleExportReactZip}
              disabled={isExportingZip}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-md shadow-purple-500/20 flex items-center gap-1.5 transition-all active:scale-95"
              title="Export Full React 18 + Vite + Tailwind Project (.ZIP)"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isExportingZip ? 'Packing...' : 'React ZIP'}</span>
            </button>

            <div className="w-[1px] h-5 bg-white/10 mx-1" />
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/30 transition-all border border-transparent"
              title="Close Preview (Esc)"
            >
              <X className="w-4 h-4 text-rose-400" />
            </button>
          </div>
        </div>

        {/* Content Area: Preview / Code / Split */}
        <div className="flex-1 bg-slate-950 overflow-hidden flex flex-col md:flex-row min-h-0">
          
          {/* Code Viewer Panel */}
          {(viewMode === 'code' || viewMode === 'split') && (
            <div
              className={`border-r border-white/10 bg-slate-950 flex flex-col overflow-hidden ${
                viewMode === 'code' ? 'w-full h-full' : 'w-full md:w-1/2 h-full'
              }`}
            >
              <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between text-xs text-slate-400 shrink-0">
                <span className="font-mono flex items-center gap-1.5 text-cyan-300">
                  <Code2 className="w-3.5 h-3.5" />
                  {isReactCode ? 'App.jsx (Full React Codebase)' : 'index.html'}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="px-2 py-0.5 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors text-[11px] flex items-center gap-1 font-mono"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'COPIED' : 'COPY'}</span>
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
              className={`flex-1 bg-slate-950 overflow-auto flex items-center justify-center p-2 sm:p-4 ${
                viewMode === 'split' ? 'hidden md:flex md:w-1/2 h-full' : 'w-full h-full'
              }`}
            >
              <div
                className={`h-full max-h-full transition-all duration-300 shadow-2xl rounded-2xl overflow-hidden border border-white/15 bg-slate-950 flex flex-col ${viewportWidths[viewport]}`}
              >
                <iframe
                  ref={iframeRef}
                  key={key}
                  title="Multi-Page Website Live Sandbox"
                  srcDoc={formattedHtml}
                  sandbox="allow-scripts allow-modals allow-same-origin allow-forms"
                  className="w-full flex-1 border-none bg-slate-950"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
