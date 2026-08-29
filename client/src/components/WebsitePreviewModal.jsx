import React, { useState } from 'react';
import { X, Monitor, Tablet, Smartphone, ExternalLink, Download, RefreshCw, Sparkles } from 'lucide-react';

export default function WebsitePreviewModal({ isOpen, onClose, htmlCode, title = "Website Live Preview" }) {
  const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [key, setKey] = useState(0);

  if (!isOpen || !htmlCode) return null;

  // Make sure complete HTML structure with Tailwind CDN exists if missing
  let formattedHtml = htmlCode;
  if (!formattedHtml.includes('<html') && !formattedHtml.includes('<!DOCTYPE')) {
    formattedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100">
  ${htmlCode}
</body>
</html>`;
  }

  const handleDownload = () => {
    const blob = new Blob([formattedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'website-preview.html';
    a.click();
    URL.revokeObjectURL(url);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-6 bg-black/80 backdrop-blur-xl">
      <div className="glass-panel w-full h-[95vh] rounded-3xl border border-white/20 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Control Bar */}
        <div className="px-5 py-3.5 bg-black/40 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-[1px]">
              <div className="w-full h-full bg-gemini-darker rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-300" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{title}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Interactive Sandbox
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Rendered with Tailwind CSS & Live DOM</p>
            </div>
          </div>

          {/* Viewport Switcher */}
          <div className="flex items-center gap-1 glass-card p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all ${
                viewport === 'desktop'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all ${
                viewport === 'tablet'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Tablet View"
            >
              <Tablet className="w-4 h-4" />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all ${
                viewport === 'mobile'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          {/* Actions & Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setKey((k) => k + 1)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Reload Frame"
            >
              <RefreshCw className="w-4 h-4" />
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
              className="p-2 rounded-xl text-cyan-400 hover:text-cyan-200 hover:bg-cyan-500/10 transition-colors"
              title="Download HTML"
            >
              <Download className="w-4 h-4" />
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

        {/* Viewport Frame Container */}
        <div className="flex-1 bg-slate-950/80 overflow-auto flex items-center justify-center p-2 md:p-4">
          <div
            className={`h-full transition-all duration-300 shadow-2xl rounded-2xl overflow-hidden border border-white/10 bg-white ${viewportWidths[viewport]}`}
          >
            <iframe
              key={key}
              title="Website Live Sandbox"
              srcDoc={formattedHtml}
              sandbox="allow-scripts allow-modals allow-same-origin allow-forms"
              className="w-full h-full border-none bg-slate-900"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
