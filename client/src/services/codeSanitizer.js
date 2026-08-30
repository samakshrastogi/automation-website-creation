/**
 * Advanced Code Sanitizer & Auto-Healing Engine
 * Parses, repairs truncated code, injects runtime polyfills, Web Audio SFX, and Lucide icons.
 */

export function sanitizeAndHealCode(rawCode, theme = 'cyber', sfxEnabled = true) {
  if (!rawCode || typeof rawCode !== 'string') return '';

  let code = rawCode.trim();

  // Strip markdown code fences if present
  if (code.startsWith('```')) {
    code = code.replace(/^```(?:html|jsx|tsx|js|javascript)?\n?/, '').replace(/\n?```$/, '');
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

  // Auto-Repair Truncated JSX / Braces / Tags
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
 * Auto-heals unclosed tags, unclosed brackets, and broken closures
 */
function autoRepairTruncatedCode(code, isHtmlDoc) {
  let healed = code;

  if (isHtmlDoc) {
    if (!healed.includes('</html>')) {
      if (healed.includes('<script') && !healed.includes('</script>')) {
        healed += '\n    </script>';
      }
      if (healed.includes('<body') && !healed.includes('</body>')) {
        healed += '\n</body>';
      }
      healed += '\n</html>';
    }
    return healed;
  }

  // Check bracket balance for JS/JSX
  const openBraces = (healed.match(/\{/g) || []).length;
  const closeBraces = (healed.match(/\}/g) || []).length;
  if (openBraces > closeBraces) {
    const missing = openBraces - closeBraces;
    healed += '\n' + '}'.repeat(missing);
  }

  const openParens = (healed.match(/\(/g) || []).length;
  const closeParens = (healed.match(/\)/g) || []).length;
  if (openParens > closeParens) {
    const missing = openParens - closeParens;
    healed += '\n' + ')'.repeat(missing) + ';';
  }

  return healed;
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
    glow: 'rgba(0, 243, 255, 0.35)',
  },
  purple: {
    name: 'Neon Purple',
    primary: '#a855f7',
    secondary: '#6366f1',
    accent: '#ec4899',
    bg: '#06080c',
    glow: 'rgba(168, 85, 247, 0.35)',
  },
  emerald: {
    name: 'Emerald Matrix',
    primary: '#10b981',
    secondary: '#06b6d4',
    accent: '#3b82f6',
    bg: '#020b08',
    glow: 'rgba(16, 185, 129, 0.35)',
  },
  rose: {
    name: 'Sunset Rose',
    primary: '#f43f5e',
    secondary: '#fb923c',
    accent: '#a855f7',
    bg: '#090305',
    glow: 'rgba(244, 63, 94, 0.35)',
  },
  gold: {
    name: 'Obsidian Gold',
    primary: '#f59e0b',
    secondary: '#eab308',
    accent: '#00f3ff',
    bg: '#080602',
    glow: 'rgba(245, 158, 11, 0.35)',
  },
};

/**
 * Web Audio API futuristic SFX synthesizer code
 */
const AUDIO_SFX_SCRIPT = `
  // Web Audio Synthesizer for high-tech click & hover sounds
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
 * Lucide icon proxy script to prevent ReferenceErrors in Babel execution
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
 * Builds clean React standalone bundle for Babel execution
 */
function buildReactHtmlBundle(code, theme = 'cyber', sfxEnabled = true) {
  const palette = THEME_PALETTES[theme] || THEME_PALETTES.cyber;

  // Clean module imports
  let cleanedCode = code
    .replace(/import\s+React\s*,?\s*\{?[^}]*\}?\s*from\s*['"][^'"]+['"];?/g, '')
    .replace(/import\s+[^;]+from\s*['"][^'"]+['"];?/g, '')
    .replace(/export\s+default\s+function\s+/g, 'function ')
    .replace(/export\s+default\s+/g, 'const AppExport = ');

  // Mount script
  const mountScript = `
    const rootElement = document.getElementById('root');
    if (rootElement && typeof App !== 'undefined') {
      const root = ReactDOM.createRoot(rootElement);
      root.render(React.createElement(App));
    } else if (rootElement && typeof AppExport !== 'undefined') {
      const root = ReactDOM.createRoot(rootElement);
      root.render(React.createElement(AppExport));
    } else if (rootElement && typeof FullWebsiteApp !== 'undefined') {
      const root = ReactDOM.createRoot(rootElement);
      root.render(React.createElement(FullWebsiteApp));
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
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
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

    ${cleanedCode}
    ${mountScript}
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
 * Enhances existing HTML documents
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
  if (sfxEnabled && !html.includes('playCyberClick')) {
    html = html.replace('</body>', `<script>${AUDIO_SFX_SCRIPT}</script></body>`);
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
