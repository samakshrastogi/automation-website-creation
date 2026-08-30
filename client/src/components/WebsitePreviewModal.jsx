import React, { useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  RefreshCw,
  Copy,
  Check,
  Smartphone,
  Tablet,
  Monitor,
  Sparkles,
  ExternalLink,
  Volume2,
  VolumeX,
  FolderArchive,
  Github
} from 'lucide-react';
import { sanitizeAndHealCode } from '../services/codeSanitizer.js';
import { exportReactProjectZip } from '../services/projectPackager.js';
import PushToGitHubModal from './PushToGitHubModal.jsx';

export default function WebsitePreviewModal({
  isOpen,
  onClose,
  htmlCode,
  title = 'Project Preview',
  githubUser,
  onUserUpdate,
}) {
  // Always call all hooks at the top unconditionally
  const [viewport, setViewport] = useState('desktop');
  const [copied, setCopied] = useState(false);
  const [key, setKey] = useState(0);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [pushGithubOpen, setPushGithubOpen] = useState(false);
  const [sfxEnabled, setSfxEnabled] = useState(true);

  const iframeRef = useRef(null);

  // Memoize sanitized HTML bundle
  const formattedHtml = useMemo(() => {
    if (!htmlCode) return '';
    return sanitizeAndHealCode(htmlCode, 'cyber', sfxEnabled);
  }, [htmlCode, sfxEnabled, key]);

  if (!isOpen) return null;

  // Viewport width presets
  const viewportWidths = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[390px]',
  };

  // Copy raw code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Open preview in standalone tab
  const handleOpenNewTab = () => {
    const blob = new Blob([formattedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // 1-Click React ZIP Exporter
  const handleExportReactZip = async () => {
    try {
      setIsExportingZip(true);
      await exportReactProjectZip(htmlCode, 'production-website');
    } catch (err) {
      console.error('Failed to export ZIP:', err);
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <>
      {createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-2xl overflow-hidden">
          <div 
            className="w-full h-full max-h-[96vh] rounded-3xl border border-white/20 shadow-2xl flex flex-col overflow-hidden bg-slate-950/95"
          >
            {/* Top Header Control Bar */}
            <div className="px-4 py-3 bg-slate-900/90 border-b border-white/10 flex items-center justify-between gap-2 md:gap-4 shrink-0">
              
              {/* Left: Brand & Title */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg">
                  <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{title}</h3>
                </div>
              </div>

              {/* Center: SFX Toggle & Viewport Device Switcher */}
              <div className="flex items-center gap-2">
                {/* SFX Audio Toggle */}
                <button
                  onClick={() => {
                    setSfxEnabled(!sfxEnabled);
                    setKey((k) => k + 1);
                  }}
                  className={`p-1.5 px-2.5 rounded-xl border transition-all text-xs flex items-center gap-1.5 ${
                    sfxEnabled ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'text-slate-400 border-white/10 bg-white/5'
                  }`}
                  title={sfxEnabled ? 'SFX Audio Enabled' : 'SFX Audio Muted'}
                >
                  {sfxEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-300" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline text-[11px] font-mono">{sfxEnabled ? 'SFX' : 'MUTED'}</span>
                </button>

                {/* Viewport Switcher */}
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
              </div>

              {/* Right: Actions, Push to GitHub & Download ZIP Exporter */}
              <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
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

                {/* 1-Click Push to GitHub */}
                <button
                  onClick={() => setPushGithubOpen(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/15 hover:border-cyan-400/50 shadow-md flex items-center gap-1.5 transition-all active:scale-95 ml-1"
                  title="Push Directly to GitHub Repository"
                >
                  <Github className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Push to GitHub</span>
                </button>

                {/* Export Download ZIP Project */}
                <button
                  onClick={handleExportReactZip}
                  disabled={isExportingZip}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-md shadow-purple-500/20 flex items-center gap-1.5 transition-all active:scale-95"
                  title="Export Full React 18 + Vite + Tailwind Project (.ZIP)"
                >
                  <FolderArchive className="w-3.5 h-3.5" />
                  <span>{isExportingZip ? 'Packing...' : 'Download ZIP'}</span>
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

            {/* Modal Body: Full Interactive Live Preview */}
            <div className="flex-1 w-full h-full overflow-hidden bg-slate-950 flex items-center justify-center p-2 sm:p-4">
              <div
                className={`h-full max-h-full transition-all duration-300 shadow-2xl rounded-2xl overflow-hidden border border-white/15 bg-slate-950 flex flex-col ${viewportWidths[viewport]}`}
              >
                <iframe
                  ref={iframeRef}
                  key={key}
                  srcDoc={formattedHtml}
                  title="Website Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                  className="w-full h-full border-0 bg-white"
                />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Push to GitHub Modal */}
      <PushToGitHubModal
        isOpen={pushGithubOpen}
        onClose={() => setPushGithubOpen(false)}
        rawCode={htmlCode}
        defaultRepoName="nexusforge-app"
        githubUser={githubUser}
        onUserUpdate={onUserUpdate}
      />
    </>
  );
}
