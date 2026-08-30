/**
 * GitHub REST API & Direct OAuth Authorization Service
 * Handles 1-click GitHub login, token verification, repository creation, and atomic Git Tree commits.
 */

const GITHUB_API_BASE = 'https://api.github.com';
const TOKEN_STORAGE_KEY = 'nexusforge_github_token';
const USER_STORAGE_KEY = 'nexusforge_github_user';

export function getStoredGitHubToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  } catch (e) {
    return '';
  }
}

export function setStoredGitHubToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (e) {}
}

export function getStoredGitHubUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setStoredGitHubUser(user) {
  try {
    if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_STORAGE_KEY);
  } catch (e) {}
}

export function clearGitHubAuth() {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (e) {}
}

/**
 * Check backend GitHub OAuth configuration
 */
export async function getBackendGitHubConfig() {
  try {
    const res = await fetch('/api/auth/github/config');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {}
  return { clientId: '', hasSecret: false, isConfigured: false };
}

/**
 * Validates a GitHub Token and caches profile details
 */
export async function verifyGitHubToken(token) {
  if (!token || !token.trim()) {
    throw new Error('Please provide a valid GitHub authentication token.');
  }

  const cleanToken = token.trim();
  const response = await fetch(`${GITHUB_API_BASE}/user`, {
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error('Invalid or expired GitHub authentication. Please re-authenticate.');
    }
    throw new Error(errorData.message || `GitHub error (${response.status})`);
  }

  const data = await response.json();
  const user = {
    login: data.login,
    name: data.name || data.login,
    avatarUrl: data.avatar_url,
    htmlUrl: data.html_url,
    publicRepos: data.public_repos,
    totalPrivateRepos: data.total_private_repos || 0,
  };

  setStoredGitHubToken(cleanToken);
  setStoredGitHubUser(user);

  return user;
}

/**
 * Standard 1-Click OAuth Popup Flow
 */
export async function loginWithOAuthPopup(clientId) {
  const redirectUri = window.location.origin;
  const oauthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo,user&redirect_uri=${encodeURIComponent(redirectUri)}`;

  const popup = window.open(
    oauthUrl,
    'github_oauth',
    'width=600,height=700,menubar=no,toolbar=no,status=no'
  );

  return new Promise((resolve, reject) => {
    let checkInterval = null;

    const messageHandler = async (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'GITHUB_OAUTH_CODE' && event.data.code) {
        window.removeEventListener('message', messageHandler);
        if (checkInterval) clearInterval(checkInterval);
        if (popup && !popup.closed) popup.close();

        try {
          const res = await fetch('/api/auth/github/oauth-exchange', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: event.data.code, clientId }),
          });

          const data = await res.json();
          if (!res.ok || data.error) {
            reject(new Error(data.error || 'Failed to exchange OAuth code.'));
            return;
          }

          setStoredGitHubToken(data.token);
          setStoredGitHubUser(data.user);
          resolve(data.user);
        } catch (err) {
          reject(err);
        }
      }
    };

    window.addEventListener('message', messageHandler);

    checkInterval = setInterval(() => {
      if (popup && popup.closed) {
        clearInterval(checkInterval);
        window.removeEventListener('message', messageHandler);
        // Popup closed without completing
      }
    }, 1000);
  });
}

/**
 * Creates a new GitHub repository on the user's account
 */
export async function createGitHubRepository(token, repoName, description = '', isPrivate = false) {
  const cleanToken = token.trim();
  const sanitizedRepoName = repoName
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || `nexusforge-app-${Date.now()}`;

  const response = await fetch(`${GITHUB_API_BASE}/user/repos`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: sanitizedRepoName,
      description: description || 'Generated with NexusForge AI Studio — Full-Stack React + Vite + Tailwind CSS',
      private: Boolean(isPrivate),
      auto_init: true,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (err.errors && err.errors.some(e => e.message && e.message.includes('name already exists'))) {
      throw new Error(`Repository "${sanitizedRepoName}" already exists on your GitHub account. Please pick a different name.`);
    }
    throw new Error(err.message || `Failed to create repository (${response.status})`);
  }

  return await response.json();
}

/**
 * Builds the standard full-stack file tree for the generated project
 */
export function buildProjectFileTree(rawCode, projectName = 'nexusforge-app') {
  let appCode = rawCode ? rawCode.trim() : '';
  if (appCode.startsWith('```')) {
    appCode = appCode.replace(/^```(?:html|jsx|tsx|js|javascript)?\n?/, '').replace(/\n?```$/, '');
  }

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

  const packageJson = JSON.stringify({
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
  }, null, 2);

  const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
});
`;

  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
};
`;

  const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;

  const indexHtml = `<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName} — NexusForge AI</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  </head>
  <body class="bg-[#030508] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;

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

  const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    background-color: #030508;
    color: #f8fafc;
    overflow-x: hidden;
  }
}

.glass-panel {
  background: rgba(13, 17, 27, 0.72);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.09);
}
`;

  const gitignore = `node_modules
dist
dist-ssr
*.local
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`;

  const readmeMd = `# ${projectName}

> ⚡ Full-Stack React + Vite + Tailwind CSS Single-Page Application generated with **[NexusForge AI Studio](https://github.com)**.

## 🚀 Quickstart Guide

### 1. Clone & Install Dependencies
\`\`\`bash
git clone https://github.com/REPLACE_WITH_YOUR_REPO.git
cd ${projectName}
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

---

## 🛠️ Tech Stack
- **Framework**: React 18 + Vite 6
- **Styling**: Tailwind CSS 3 + PostCSS
- **3D Graphics & Physics**: Three.js WebGL
- **Icons**: Lucide React
- **Animations**: GSAP

---
*Created with [NexusForge AI Studio](https://github.com).*
`;

  return [
    { path: 'package.json', content: packageJson },
    { path: 'vite.config.js', content: viteConfig },
    { path: 'tailwind.config.js', content: tailwindConfig },
    { path: 'postcss.config.js', content: postcssConfig },
    { path: 'index.html', content: indexHtml },
    { path: 'src/main.jsx', content: mainJsx },
    { path: 'src/App.jsx', content: appCode },
    { path: 'src/index.css', content: indexCss },
    { path: '.gitignore', content: gitignore },
    { path: 'README.md', content: readmeMd },
  ];
}

/**
 * Pushes all files atomically into the GitHub repository using Git Data Trees API
 */
export async function pushProjectToGitHub(token, owner, repoName, rawCode, onProgress = () => {}) {
  const cleanToken = token.trim();
  const headers = {
    Authorization: `Bearer ${cleanToken}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  onProgress({ step: 1, message: 'Creating project files...' });
  const files = buildProjectFileTree(rawCode, repoName);

  // 1. Get default branch reference
  onProgress({ step: 2, message: 'Fetching repository base branch...' });
  const repoRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repoName}`, { headers });
  if (!repoRes.ok) throw new Error('Could not access newly created repository.');
  const repoData = await repoRes.json();
  const defaultBranch = repoData.default_branch || 'main';

  const refRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repoName}/git/ref/heads/${defaultBranch}`, { headers });
  let baseCommitSha = null;
  let baseTreeSha = null;
  if (refRes.ok) {
    const refData = await refRes.json();
    baseCommitSha = refData.object.sha;
    const commitRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repoName}/git/commits/${baseCommitSha}`, { headers });
    if (commitRes.ok) {
      const commitData = await commitRes.json();
      baseTreeSha = commitData.tree.sha;
    }
  }

  // 2. Create Blobs for each file
  onProgress({ step: 3, message: 'Uploading file blobs to GitHub...' });
  const treeItems = [];
  for (const file of files) {
    const blobRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repoName}/git/blobs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        content: file.content,
        encoding: 'utf-8',
      }),
    });
    if (!blobRes.ok) throw new Error(`Failed to upload file "${file.path}"`);
    const blobData = await blobRes.json();
    treeItems.push({
      path: file.path,
      mode: '100644',
      type: 'blob',
      sha: blobData.sha,
    });
  }

  // 3. Create a Git Tree
  onProgress({ step: 4, message: 'Constructing Git Tree...' });
  const treeBody = { tree: treeItems };
  if (baseTreeSha) treeBody.base_tree = baseTreeSha;

  const treeRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repoName}/git/trees`, {
    method: 'POST',
    headers,
    body: JSON.stringify(treeBody),
  });
  if (!treeRes.ok) throw new Error('Failed to create Git Tree on GitHub.');
  const treeData = await treeRes.json();

  // 4. Create Commit
  onProgress({ step: 5, message: 'Committing code to repository...' });
  const commitBody = {
    message: '🚀 Initial commit: Full-stack React + Vite application generated with NexusForge AI Studio',
    tree: treeData.sha,
    parents: baseCommitSha ? [baseCommitSha] : [],
  };

  const commitRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repoName}/git/commits`, {
    method: 'POST',
    headers,
    body: JSON.stringify(commitBody),
  });
  if (!commitRes.ok) throw new Error('Failed to create Git Commit.');
  const newCommitData = await commitRes.json();

  // 5. Update Branch Ref
  onProgress({ step: 6, message: 'Updating main branch...' });
  const updateRefRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repoName}/git/refs/heads/${defaultBranch}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      sha: newCommitData.sha,
      force: true,
    }),
  });

  if (!updateRefRes.ok) {
    await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repoName}/git/refs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ref: `refs/heads/${defaultBranch}`,
        sha: newCommitData.sha,
      }),
    });
  }

  onProgress({ step: 7, message: 'Complete!' });
  return {
    repoUrl: `https://github.com/${owner}/${repoName}`,
    owner,
    repoName,
    branch: defaultBranch,
  };
}
