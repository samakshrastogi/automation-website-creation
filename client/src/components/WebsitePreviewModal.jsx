import React, { useState, useRef } from 'react';
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
  Compass
} from 'lucide-react';

export default function WebsitePreviewModal({ isOpen, onClose, htmlCode, title = "Multi-Page Website Studio" }) {
  const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'code' | 'split'
  const [key, setKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef(null);

  if (!isOpen || !htmlCode) return null;

  // Intelligent detection: React JSX vs HTML5
  const isReactCode = (
    htmlCode.includes('import React') ||
    htmlCode.includes('export default') ||
    htmlCode.includes('function App') ||
    htmlCode.includes('const App =') ||
    htmlCode.includes('useState(') ||
    htmlCode.includes('useEffect(')
  );

  let formattedHtml = '';

  if (isReactCode) {
    // Strip ES module imports/exports for in-browser Babel Standalone execution
    let cleanedReactCode = htmlCode
      .replace(/import\s+React\s*,?\s*\{?[^}]*\}?\s*from\s*['"][^'"]+['"];?/g, '')
      .replace(/import\s+[^;]+from\s*['"][^'"]+['"];?/g, '')
      .replace(/export\s+default\s+function\s+/g, 'function ')
      .replace(/export\s+default\s+/g, 'const AppExport = ');

    // Ensure App is mounted
    const mountScript = `
      const rootElement = document.getElementById('root');
      if (rootElement && typeof App !== 'undefined') {
        const root = ReactDOM.createRoot(rootElement);
        root.render(React.createElement(App));
      } else if (rootElement && typeof AppExport !== 'undefined') {
        const root = ReactDOM.createRoot(rootElement);
        root.render(React.createElement(AppExport));
      }
    `;

    formattedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React 3D & GSAP Live Multi-Page Website</title>
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- React 18 & ReactDOM 18 -->
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <!-- Babel Standalone for JSX compilation -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <!-- GSAP & ScrollTrigger -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <!-- Three.js 3D Engine -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <!-- FontAwesome -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background-color: #06080c; color: #f8fafc; margin: 0; }
    .glass-card { background: rgba(255,255,255,0.05); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.1); }
    .glass-panel { background: rgba(13,17,27,0.75); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.12); }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen overflow-x-hidden">
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useRef, useMemo, useCallback } = React;
    
    // Lucide Icon proxy to ensure AI-generated React icons render seamlessly
    const createIcon = (name) => (props = {}) => {
      const kebab = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
      return React.createElement('i', {
        'data-lucide': kebab,
        className: props.className || 'w-5 h-5 inline-block',
        style: props.style,
        onClick: props.onClick
      });
    };

    [
      'Sparkles', 'Zap', 'Check', 'CheckCircle', 'CheckCircle2', 'Star', 'ArrowRight', 'ArrowLeft',
      'Shield', 'ShieldCheck', 'Heart', 'User', 'Search', 'Menu', 'X', 'ChevronRight',
      'ChevronLeft', 'ChevronDown', 'Play', 'Code', 'Code2', 'Layers', 'Globe',
      'Cpu', 'Database', 'Copy', 'ExternalLink', 'Send', 'Terminal', 'Wand2',
      'RefreshCw', 'Smartphone', 'Monitor', 'Tablet', 'Download', 'MessageSquare',
      'Plus', 'Trash2', 'HelpCircle', 'Flame', 'Activity', 'BarChart3', 'TrendingUp',
      'Lock', 'Mail', 'Phone', 'MapPin', 'Moon', 'Sun', 'Clock', 'Calendar', 'Github', 'Twitter'
    ].forEach((name) => {
      window[name] = createIcon(name);
    });

    ${cleanedReactCode}
    ${mountScript}
  </script>
  <script>
    const triggerIcons = () => { if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons(); };
    setTimeout(triggerIcons, 100);
    setTimeout(triggerIcons, 400);
    setTimeout(triggerIcons, 1000);
  </script>
</body>
</html>`;
  } else if (!htmlCode.includes('<html') && !htmlCode.includes('<!DOCTYPE')) {
    formattedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Multi-Page Preview</title>
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- GSAP -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
  <!-- Three.js -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <!-- Lucide Icons & FontAwesome -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background-color: #06080c; color: #f8fafc; margin: 0; }
    .glass-card { background: rgba(255,255,255,0.05); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.1); }
    .glass-panel { background: rgba(13,17,27,0.75); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.12); }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen overflow-x-hidden">
  ${htmlCode}
  <script>
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 300);
  </script>
</body>
</html>`;
  } else {
    formattedHtml = htmlCode;
    if (!formattedHtml.includes('tailwindcss.com')) {
      formattedHtml = formattedHtml.replace('<head>', '<head><script src="https://cdn.tailwindcss.com"></script>');
    }
    if (!formattedHtml.includes('gsap.min.js')) {
      formattedHtml = formattedHtml.replace('<head>', '<head><script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>');
    }
    if (!formattedHtml.includes('three.min.js')) {
      formattedHtml = formattedHtml.replace('<head>', '<head><script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>');
    }
    if (!formattedHtml.includes('lucide@latest')) {
      formattedHtml = formattedHtml.replace('<head>', '<head><script src="https://unpkg.com/lucide@latest"></script>');
    }
  }

  const handleDownload = () => {
    const blob = new Blob([formattedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'full-website-application.html';
    a.click();
    URL.revokeObjectURL(url);
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
        <div className="px-4 md:px-6 py-3 bg-black/50 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
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
                  Multi-Page Interactive
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 hidden sm:block">Full React & Tailwind CSS DOM Sandbox</p>
            </div>
          </div>

          {/* Center: View Mode (Preview vs Code vs Split) & Viewport Switches */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
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

            {/* Viewport Switcher (Preview Mode) */}
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

          {/* Right Actions & Close */}
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
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-md shadow-purple-500/20 flex items-center gap-1.5 transition-all active:scale-95"
              title="Download Standalone HTML Package"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Site</span>
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
