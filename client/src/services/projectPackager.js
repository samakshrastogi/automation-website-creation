import JSZip from 'jszip';

/**
 * Generates and triggers download of a complete modular React 18 + Vite + Three.js 3D + Tailwind CSS repository ZIP
 */
export async function exportReactProjectZip(rawCode, projectName = 'ai-website-app') {
  const zip = new JSZip();

  // 1. Process React Code
  let appCode = rawCode ? rawCode.trim() : '';
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
      'canvas-confetti': '^1.9.4',
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
  server: {
    port: 3000,
    open: true,
  },
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
          card: 'rgba(15, 23, 42, 0.65)',
          cyan: '#00f3ff',
          purple: '#9d00ff',
          pink: '#ff0055',
          emerald: '#10b981',
          border: 'rgba(255, 255, 255, 0.08)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
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
    <title>${projectName} - High Performance Web Application</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  </head>
  <body class="bg-slate-950 text-slate-100 antialiased overflow-x-hidden selection:bg-cyan-500 selection:text-black">
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

  // 8. src/components/Canvas3D.jsx (Three.js WebGL Interactive 3D Canvas)
  const canvas3DJsx = `import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Canvas3D({ className = "absolute inset-0 pointer-events-none" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Particle Geometry
    const particleCount = 700;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cyan = new THREE.Color('#00f3ff');
    const purple = new THREE.Color('#9d00ff');

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = 18 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const mixed = cyan.clone().lerp(purple, Math.random());
      colors[i3] = mixed.r;
      colors[i3 + 1] = mixed.g;
      colors[i3 + 2] = mixed.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Material
    const material = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      particles.rotation.y += 0.002;
      particles.rotation.x += 0.001;

      // Gentle mouse tracking
      particles.rotation.y += mouseX * 0.001;
      particles.rotation.x += mouseY * 0.001;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className={className} />;
}
`;

  // 9. src/index.css
  const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    background-color: #030508;
    color: #f8fafc;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    margin: 0;
    overflow-x: hidden;
  }
}

.glass-panel {
  background: rgba(10, 15, 29, 0.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
`;

  // 10. README.md
  const readmeMd = `# 🚀 ${projectName}

Welcome to your AI-generated full-stack web application built with **React 18**, **Vite**, **Tailwind CSS**, and **Three.js 3D WebGL**!

---

## 🛠️ Tech Stack
- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
- **3D Graphics & Shaders**: [Three.js](https://threejs.org/)
- **Animations**: [GSAP](https://greensock.com/gsap/) + [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## ⚡ Quickstart Guide

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Start Development Server
\`\`\`bash
npm run dev
\`\`\`
Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
\`\`\`bash
npm run build
\`\`\`
The compiled assets will be ready in the \`dist/\` directory for deployment on **Vercel**, **Netlify**, or **AWS Amplify**.

---

## 📁 Repository Structure
\`\`\`text
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    └── components/
        └── Canvas3D.jsx
\`\`\`
`;

  // 11. .gitignore
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

  const componentsFolder = srcFolder.folder('components');
  componentsFolder.file('Canvas3D.jsx', canvas3DJsx);

  // Generate Blob and trigger download
  const content = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `${projectName.toLowerCase().replace(/[^a-z0-9-_]/g, '-')}-production-ready.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
