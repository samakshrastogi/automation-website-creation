import JSZip from 'jszip';

/**
 * Generates and triggers download of a complete React 18 + Vite + Tailwind CSS repository ZIP
 */
export async function exportReactProjectZip(rawCode, projectName = 'ai-website-app') {
  const zip = new JSZip();

  // 1. Process React Code
  let appCode = rawCode.trim();
  if (appCode.startsWith('```')) {
    appCode = appCode.replace(/^```(?:html|jsx|tsx|js|javascript)?\n?/, '').replace(/\n?```$/, '');
  }

  // Ensure React imports exist in App.jsx
  if (!appCode.includes("from 'react'")) {
    appCode = "import React, { useState, useEffect, useRef, useMemo } from 'react';\n" + appCode;
  }
  if (!appCode.includes('export default')) {
    if (appCode.includes('function App')) {
      appCode = appCode.replace('function App', 'export default function App');
    } else {
      appCode += '\n\nexport default App;\n';
    }
  }

  // 2. package.json
  const packageJson = {
    name: projectName.toLowerCase().replace(/[^a-z0-9-_]/g, '-'),
    private: true,
    version: '1.0.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    },
    dependencies: {
      react: '^18.3.1',
      'react-dom': '^18.3.1',
      'lucide-react': '^0.475.0',
      three: '^0.173.0',
      gsap: '^3.12.7',
      clsx: '^2.1.1',
      'tailwind-merge': '^3.0.1',
    },
    devDependencies: {
      '@types/react': '^18.3.18',
      '@types/react-dom': '^18.3.5',
      '@vitejs/plugin-react': '^4.3.4',
      autoprefixer: '^10.4.20',
      postcss: '^8.5.2',
      tailwindcss: '^3.4.17',
      vite: '^6.1.0',
    },
  };

  // 3. vite.config.js
  const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
});
`;

  // 4. tailwind.config.js
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          black: '#030508',
          dark: '#080c14',
          cyan: '#00f3ff',
          purple: '#9d00ff',
          pink: '#ff0055',
        }
      }
    },
  },
  plugins: [],
}
`;

  // 5. postcss.config.js
  const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;

  // 6. index.html
  const indexHtml = `<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Generated Web Application</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  </head>
  <body class="bg-slate-950 text-slate-100 antialiased overflow-x-hidden">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;

  // 7. src/main.jsx
  const mainJsx = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;

  // 8. src/index.css
  const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #030508;
  color: #f8fafc;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  margin: 0;
  overflow-x: hidden;
}

.glass-panel {
  background: rgba(10, 15, 29, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
`;

  // 9. README.md
  const readmeMd = `# ${projectName}

This project was automatically generated with the **ChatGPT & Gemini Hybrid Full-Stack Website Creator**.

## 🚀 Getting Started

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Start Local Development Server
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
\`\`\`bash
npm run build
\`\`\`
The optimized static bundle will be built in the \`dist/\` directory ready for deployment on **Vercel**, **Netlify**, or **GitHub Pages**.
`;

  // 10. .gitignore
  const gitignore = `node_modules
dist
dist-ssr
*.local
.DS_Store
`;

  // Assemble ZIP structure
  zip.file('package.json', JSON.stringify(packageJson, null, 2));
  zip.file('vite.config.js', viteConfig);
  zip.file('tailwind.config.js', tailwindConfig);
  zip.file('postcss.config.js', postcssConfig);
  zip.file('index.html', indexHtml);
  zip.file('.gitignore', gitignore);
  zip.file('README.md', readmeMd);

  const srcFolder = zip.folder('src');
  srcFolder.file('main.jsx', mainJsx);
  srcFolder.file('App.jsx', appCode);
  srcFolder.file('index.css', indexCss);

  // Generate Blob and trigger download
  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `${projectName.toLowerCase().replace(/[^a-z0-9-_]/g, '-')}-react-project.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
