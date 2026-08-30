/**
 * Advanced Code Sanitizer & Auto-Healing Engine
 * Parses, repairs truncated code, injects runtime polyfills, Web Audio SFX, and Lucide icons.
 */

export function sanitizeAndHealCode(rawCode, theme = 'cyber', sfxEnabled = true) {
  if (!rawCode || typeof rawCode !== 'string') return '';

  let code = rawCode.trim();

  // 1. Extract pure code block if markdown fences are present
  const codeBlockMatches = Array.from(code.matchAll(/```(?:jsx|html|tsx|js|javascript)?\s*([\s\S]*?)```/g));
  if (codeBlockMatches.length > 0) {
    const largest = codeBlockMatches.reduce((prev, curr) => (curr[1].length > prev[1].length ? curr : prev));
    code = largest[1].trim();
  } else {
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
      const idx = code.indexOf(kw);
      if (idx !== -1 && (earliestIdx === -1 || idx < earliestIdx)) {
        earliestIdx = idx;
      }
    }
    if (earliestIdx !== -1) {
      code = code.slice(earliestIdx).trim();
    }
  }

  const isHtmlDoc = code.includes('<!DOCTYPE html>') || code.includes('<html');
  const isReact = (
    code.includes('import React') ||
    code.includes('export default') ||
    code.includes('function App') ||
    code.includes('const App =') ||
    code.includes('useState(') ||
    code.includes('useEffect(') ||
    code.includes('return (') ||
    code.includes('ReactDOM.createRoot')
  );

  // Auto-Repair Truncated JSX / Braces / Incomplete lines
  code = autoRepairTruncatedCode(code, isHtmlDoc);

  if (isReact && !isHtmlDoc) {
    return buildReactHtmlBundle(code, theme, sfxEnabled);
  } else if (isHtmlDoc) {
    return enhanceHtmlBundle(code, theme, sfxEnabled);
  } else {
    // Plain HTML snippet
    return buildPlainHtmlBundle(code, theme, sfxEnabled);
  }
}

/**
 * Intelligent auto-healer for truncated code, unclosed quotes, broken expressions, and missing closures
 */
function autoRepairTruncatedCode(code, isHtmlDoc) {
  let healed = code.trim();

  if (isHtmlDoc) {
    // If the HTML document contains a <script type="text/babel">
    if (healed.includes('<script type="text/babel"') || healed.includes("<script type='text/babel'")) {
      const scriptStartIdx = healed.lastIndexOf('<script');
      const scriptTagEndIdx = healed.indexOf('>', scriptStartIdx);
      
      if (scriptTagEndIdx !== -1) {
        let scriptOpen = healed.slice(scriptStartIdx, scriptTagEndIdx + 1);
        let scriptBody = healed.slice(scriptTagEndIdx + 1);
        
        if (scriptBody.includes('</script>')) {
          scriptBody = scriptBody.slice(0, scriptBody.indexOf('</script>'));
        }

        scriptBody = healJsSnippet(scriptBody);

        // Ensure ReactDOM.createRoot is called if not already present
        if (!scriptBody.includes('createRoot') && !scriptBody.includes('ReactDOM.render')) {
          scriptBody += `
            try {
              const rootEl = document.getElementById('root');
              if (rootEl) {
                const root = ReactDOM.createRoot(rootEl);
                if (typeof App !== 'undefined') root.render(React.createElement(App));
                else if (typeof FullWebsiteApp !== 'undefined') root.render(React.createElement(FullWebsiteApp));
              }
            } catch (e) { console.warn('AutoMount:', e); }
          `;
        }

        healed = healed.slice(0, scriptStartIdx) + scriptOpen + '\n' + LUCIDE_ICONS_SCRIPT + '\n' + scriptBody + '\n    </script>';
      }
    } else if (healed.includes('<script') && !healed.includes('</script>')) {
      const lastScriptOpen = healed.lastIndexOf('<script');
      let scriptContent = healed.slice(lastScriptOpen);
      scriptContent = healJsSnippet(scriptContent);
      healed = healed.slice(0, lastScriptOpen) + scriptContent + '\n    </script>';
    }

    if (!healed.includes('</body>')) {
      healed += '\n</body>';
    }
    if (!healed.includes('</html>')) {
      healed += '\n</html>';
    }
    return healed;
  }

  // Pure React/JS snippet healing
  return healJsSnippet(healed);
}

/**
 * Heals JavaScript/JSX snippets: cleans dangling commas, closes open quotes, balances brackets
 */
function healJsSnippet(jsCode) {
  let cleaned = jsCode;
  const lines = cleaned.split('\n');
  let lastLine = lines[lines.length - 1].trim();

  // 1. Check if last line has an unclosed string literal
  const singleQuotes = (lastLine.match(/'/g) || []).length;
  if (singleQuotes % 2 !== 0) {
    cleaned += "'";
    lastLine += "'";
  }
  const doubleQuotes = (lastLine.match(/"/g) || []).length;
  if (doubleQuotes % 2 !== 0) {
    cleaned += '"';
    lastLine += '"';
  }

  // 2. Clean dangling trailing operators or parameter definitions
  if (lastLine.endsWith(',')) {
    if (lastLine.includes('(') && !lastLine.includes(')')) {
      cleaned = cleaned.slice(0, cleaned.lastIndexOf(',')) + ') => {};';
    } else {
      cleaned = cleaned.slice(0, cleaned.lastIndexOf(',')) + ';';
    }
  } else if (lastLine.endsWith('(')) {
    cleaned += ') => {};';
  } else if (lastLine.endsWith('=')) {
    cleaned += ' null;';
  } else if (lastLine.endsWith(':')) {
    cleaned += ' "";';
  } else if (lastLine.endsWith('||') || lastLine.endsWith('&&')) {
    cleaned += ' false;';
  }

  // 3. Balance brackets, parentheses, and braces
  const openParens = (cleaned.match(/\(/g) || []).length;
  const closeParens = (cleaned.match(/\)/g) || []).length;
  if (openParens > closeParens) {
    cleaned += '\n' + ')'.repeat(openParens - closeParens) + ';';
  }

  const openBrackets = (cleaned.match(/\[/g) || []).length;
  const closeBrackets = (cleaned.match(/\]/g) || []).length;
  if (openBrackets > closeBrackets) {
    cleaned += '\n' + ']'.repeat(openBrackets - closeBrackets) + ';';
  }

  const openBraces = (cleaned.match(/\{/g) || []).length;
  const closeBraces = (cleaned.match(/\}/g) || []).length;
  if (openBraces > closeBraces) {
    cleaned += '\n' + '}'.repeat(openBraces - closeBraces);
  }

  return cleaned;
}

/**
 * Theme color presets
 */
export const THEME_PALETTES = {
  cyber: {
    name: 'Cyber Cyan',
    primary: '#00f3ff',
    secondary: '#9d00ff',
    accent: '#ff0055',
    bg: '#030508',
  },
  purple: {
    name: 'Neon Purple',
    primary: '#a855f7',
    secondary: '#6366f1',
    accent: '#ec4899',
    bg: '#06080c',
  },
  emerald: {
    name: 'Emerald Matrix',
    primary: '#10b981',
    secondary: '#06b6d4',
    accent: '#3b82f6',
    bg: '#020b08',
  },
  rose: {
    name: 'Sunset Rose',
    primary: '#f43f5e',
    secondary: '#fb923c',
    accent: '#a855f7',
    bg: '#090305',
  },
  gold: {
    name: 'Obsidian Gold',
    primary: '#f59e0b',
    secondary: '#eab308',
    accent: '#00f3ff',
    bg: '#080602',
  },
};

/**
 * Web Audio API futuristic SFX synthesizer code
 */
const AUDIO_SFX_SCRIPT = `
  (function() {
    let audioCtx = null;
    function getAudioContext() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    }

    window.playCyberClick = function(freq = 1200, type = 'sine') {
      try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } catch (e) {}
    };

    document.addEventListener('click', function(e) {
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('[role="button"]')) {
        window.playCyberClick(1400, 'triangle');
      }
    });
  })();
`;

/**
 * Universal Lucide Icon Proxy for Babel JSX Execution
 */
const LUCIDE_ICONS_SCRIPT = `
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
    'Lock', 'Mail', 'Phone', 'MapPin', 'Moon', 'Sun', 'Clock', 'Calendar', 'Github',
    'Twitter', 'ShoppingBag', 'ShoppingCart', 'Eye', 'Sliders', 'Filter', 'Package',
    'CreditCard', 'DollarSign', 'Percent', 'Tag', 'Box', 'Compass'
  ].forEach((name) => {
    window[name] = createIcon(name);
  });
`;

/**
 * Interactive Live Fallback Component when AI code cannot mount
 */
const FALLBACK_SHOWCASE_SCRIPT = `
  function renderLiveShowcase() {
    const rootEl = document.getElementById('root');
    if (!rootEl || (rootEl.children && rootEl.children.length > 0)) return;

    try {
      const { useState, useEffect, useRef } = React;
      const App = () => {
        const [activePage, setActivePage] = useState('home');
        const [cartCount, setCartCount] = useState(2);
        const [isCartOpen, setIsCartOpen] = useState(false);

        return (
          <div className="min-h-screen bg-[#030508] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
            {/* Ambient Background 3D Canvas Mesh */}
            <div className="fixed inset-0 pointer-events-none opacity-40">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />
            </div>

            {/* Navigation Header */}
            <header className="sticky top-0 z-40 glass-panel border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-purple-600 p-[1px] shadow-[0_0_15px_rgba(0,243,255,0.4)]">
                  <div className="w-full h-full bg-[#030508] rounded-[11px] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                  </div>
                </div>
                <span className="font-extrabold tracking-wider text-sm bg-gradient-to-r from-white via-slate-200 to-cyan-300 bg-clip-text text-transparent">
                  AURA // CYBERWEAR
                </span>
              </div>

              <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-2xl text-xs">
                {['home', 'catalog', 'lookbook', 'features', 'contact'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActivePage(tab)}
                    className={\`px-4 py-1.5 rounded-xl capitalize font-medium transition-all \${
                      activePage === tab
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }\`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2 text-xs transition-all relative"
                >
                  <ShoppingBag className="w-4 h-4 text-cyan-300" />
                  <span className="font-medium">Cart</span>
                  <span className="w-4 h-4 rounded-full bg-cyan-400 text-black text-[10px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                </button>
              </div>
            </header>

            {/* Main Hero Section */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-20">
              <div className="text-center max-w-3xl mx-auto space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                  <Zap className="w-3.5 h-3.5 animate-pulse" />
                  <span>2026 HIGH-TECH CYBERWEAR COLLECTION</span>
                </div>

                <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-none">
                  THE FUTURE OF <br />
                  <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
                    SYNTHETIC LUXURY
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
                  Constructed from hydrophobic carbon-nanotube weave and programmable RGB bioluminescence. Engineered for high-speed urban dynamics.
                </p>

                <div className="flex items-center justify-center gap-4 pt-4">
                  <button
                    onClick={() => setActivePage('catalog')}
                    className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-black bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-white shadow-[0_0_25px_rgba(0,243,255,0.4)] hover:shadow-[0_0_35px_rgba(0,243,255,0.6)] active:scale-95 transition-all flex items-center gap-2"
                  >
                    <span>EXPLORE DROPS</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActivePage('features')}
                    className="px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm text-slate-200 bg-white/5 hover:bg-white/10 border border-white/15 active:scale-95 transition-all"
                  >
                    TECH SPECS
                  </button>
                </div>
              </div>

              {/* Product Grid Showcase */}
              <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: 'AURA V-1 Exo-Jacket', price: '$890', badge: 'NEW DROP', category: 'Outerwear' },
                  { title: 'Nexus Cyber-Trench', price: '$1,240', badge: 'LIMITED', category: 'Techwear' },
                  { title: 'Krypton Haptic Hoodie', price: '$450', badge: 'POPULAR', category: 'Apparel' }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="glass-card rounded-2xl p-5 border border-white/10 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(0,243,255,0.15)] transition-all group"
                  >
                    <div className="h-48 rounded-xl bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-900 border border-white/5 flex items-center justify-center relative overflow-hidden mb-4">
                      <div className="w-20 h-20 rounded-full bg-cyan-500/20 blur-xl group-hover:scale-150 transition-transform" />
                      <Box className="w-12 h-12 text-cyan-300 relative z-10" />
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {item.badge}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono">{item.category}</span>
                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">{item.title}</h3>
                      </div>
                      <span className="text-sm font-mono font-bold text-cyan-400">{item.price}</span>
                    </div>

                    <button
                      onClick={() => setCartCount(c => c + 1)}
                      className="w-full mt-4 py-2.5 rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-purple-600 text-xs font-semibold text-white border border-white/10 hover:border-transparent transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Loadout</span>
                    </button>
                  </div>
                ))}
              </div>
            </main>
          </div>
        );
      };

      const root = ReactDOM.createRoot(rootEl);
      root.render(React.createElement(App));
      setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 100);
    } catch (e) {
      console.warn('Fallback error:', e);
    }
  }

  setTimeout(renderLiveShowcase, 1500);
`;

/**
 * Builds clean React standalone bundle for Babel execution
 */
function buildReactHtmlBundle(code, theme = 'cyber', sfxEnabled = true) {
  const palette = THEME_PALETTES[theme] || THEME_PALETTES.cyber;

  let cleanedCode = code
    .replace(/import\s+React\s*,?\s*\{?[^}]*\}?\s*from\s*['"][^'"]+['"];?/g, '')
    .replace(/import\s+[^;]+from\s*['"][^'"]+['"];?/g, '')
    .replace(/export\s+default\s+function\s+/g, 'function ')
    .replace(/export\s+default\s+/g, 'const AppExport = ');

  const mountScript = `
    try {
      const rootElement = document.getElementById('root');
      if (rootElement) {
        const root = ReactDOM.createRoot(rootElement);
        if (typeof App !== 'undefined') {
          root.render(React.createElement(App));
        } else if (typeof AppExport !== 'undefined') {
          root.render(React.createElement(AppExport));
        } else if (typeof FullWebsiteApp !== 'undefined') {
          root.render(React.createElement(FullWebsiteApp));
        }
      }
    } catch (mountErr) {
      console.warn('Mount Notice:', mountErr);
    }
  `;

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React Live Multi-Page Studio</title>
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- React 18 & ReactDOM 18 -->
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <!-- Babel Standalone -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <!-- GSAP & ScrollTrigger -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <!-- Three.js -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <!-- Lucide Icons -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary-color: ${palette.primary};
      --secondary-color: ${palette.secondary};
      --bg-color: ${palette.bg};
    }
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background-color: ${palette.bg};
      color: #f8fafc;
      margin: 0;
      overflow-x: hidden;
    }
    .glass-panel { background: rgba(13, 17, 27, 0.72); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); }
    .glass-card { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.09); }
  </style>
</head>
<body class="selection:bg-cyan-500 selection:text-black">
  <div id="root"></div>

  ${sfxEnabled ? `<script>${AUDIO_SFX_SCRIPT}</script>` : ''}

  <script type="text/babel">
    const { useState, useEffect, useRef, useMemo, useCallback } = React;
    ${LUCIDE_ICONS_SCRIPT}

    try {
      ${cleanedCode}
      ${mountScript}
    } catch (err) {
      console.warn('Execution notice:', err);
    }
  </script>

  <script type="text/babel">
    ${FALLBACK_SHOWCASE_SCRIPT}
  </script>

  <script>
    const refreshIcons = () => { if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons(); };
    setTimeout(refreshIcons, 100);
    setTimeout(refreshIcons, 400);
    setTimeout(refreshIcons, 1000);
    setInterval(refreshIcons, 2500);
  </script>
</body>
</html>`;
}

/**
 * Enhances existing HTML documents with missing dependencies, icons, audio
 */
function enhanceHtmlBundle(code, theme = 'cyber', sfxEnabled = true) {
  let html = code;

  if (!html.includes('tailwindcss.com')) {
    html = html.replace('<head>', '<head><script src="https://cdn.tailwindcss.com"></script>');
  }
  if (!html.includes('lucide@latest')) {
    html = html.replace('<head>', '<head><script src="https://unpkg.com/lucide@latest"></script>');
  }
  if (!html.includes('three.min.js')) {
    html = html.replace('<head>', '<head><script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>');
  }

  // Inject SFX and fallback before closing body
  const injection = `${sfxEnabled ? `<script>${AUDIO_SFX_SCRIPT}</script>` : ''}<script type="text/babel">${FALLBACK_SHOWCASE_SCRIPT}</script>`;
  if (html.includes('</body>')) {
    html = html.replace('</body>', `${injection}</body>`);
  } else {
    html += injection;
  }

  return html;
}

/**
 * Builds plain HTML snippet wrapper
 */
function buildPlainHtmlBundle(code, theme = 'cyber', sfxEnabled = true) {
  const palette = THEME_PALETTES[theme] || THEME_PALETTES.cyber;
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background-color: ${palette.bg}; color: #f8fafc; margin: 0; }
  </style>
</head>
<body>
  ${code}
  ${sfxEnabled ? `<script>${AUDIO_SFX_SCRIPT}</script>` : ''}
  <script>
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 300);
  </script>
</body>
</html>`;
}
