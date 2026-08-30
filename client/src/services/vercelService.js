import confetti from 'canvas-confetti';
import { buildProjectFileTree } from './githubService.js';

const TOKEN_STORAGE_KEY = 'nexusforge_vercel_token';
const USER_STORAGE_KEY = 'nexusforge_vercel_user';

export function getStoredVercelToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  } catch (e) {
    return '';
  }
}

export function setStoredVercelToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (e) {}
}

export function getStoredVercelUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setStoredVercelUser(user) {
  try {
    if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_STORAGE_KEY);
  } catch (e) {}
}

export function clearVercelAuth() {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (e) {}
}

/**
 * Check backend Vercel OAuth configuration
 */
export async function getBackendVercelConfig() {
  try {
    const res = await fetch('/api/vercel/config');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {}
  return { clientId: '', hasSecret: false, isConfigured: false };
}

/**
 * Direct 1-Click Vercel OAuth Popup Flow
 */
export async function loginWithVercelOAuthPopup(clientId) {
  const redirectUri = window.location.origin;
  const oauthUrl = `https://vercel.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  const popup = window.open(
    oauthUrl,
    'vercel_oauth',
    'width=600,height=700,menubar=no,toolbar=no,status=no'
  );

  return new Promise((resolve, reject) => {
    let checkInterval = null;

    const messageHandler = async (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'VERCEL_OAUTH_CODE' && event.data.code) {
        window.removeEventListener('message', messageHandler);
        if (checkInterval) clearInterval(checkInterval);
        if (popup && !popup.closed) popup.close();

        try {
          const res = await fetch('/api/vercel/oauth-exchange', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: event.data.code, redirectUri }),
          });

          const data = await res.json();
          if (!res.ok || data.error) {
            reject(new Error(data.error || 'Failed to exchange Vercel OAuth code.'));
            return;
          }

          setStoredVercelToken(data.token);
          setStoredVercelUser(data.user);
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
      }
    }, 1000);
  });
}

/**
 * Verify a Vercel Token and store profile
 */
export async function verifyVercelToken(token) {
  if (!token || !token.trim()) {
    throw new Error('Please enter a valid Vercel API Token.');
  }

  const cleanToken = token.trim();
  const response = await fetch('/api/vercel/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: cleanToken }),
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error || 'Failed to authenticate with Vercel.');
  }

  setStoredVercelToken(cleanToken);
  setStoredVercelUser(data.user);

  return data.user;
}

/**
 * 1-Click Atomic Deployment to Vercel
 */
export async function deployProjectToVercel(token, projectName, rawCode, onProgress = () => {}) {
  const cleanToken = (token || getStoredVercelToken()).trim();
  if (!cleanToken) {
    throw new Error('Please connect your Vercel account first.');
  }

  onProgress({ step: 1, message: 'Bundling project files...' });
  const files = buildProjectFileTree(rawCode, projectName);

  onProgress({ step: 2, message: 'Creating atomic deployment on Vercel...' });
  const deployRes = await fetch('/api/vercel/deploy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: cleanToken,
      name: projectName,
      files,
    }),
  });

  const deployData = await deployRes.json();
  if (!deployRes.ok || deployData.error) {
    throw new Error(deployData.error || 'Failed to initiate Vercel deployment.');
  }

  const deploymentId = deployData.id;
  const initialUrl = deployData.url;

  onProgress({ step: 3, message: 'Provisioning build environment...' });

  // Poll deployment status
  const maxAttempts = 30; // 60 seconds
  let attempts = 0;

  return new Promise((resolve, reject) => {
    const pollTimer = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(pollTimer);
        resolve({
          id: deploymentId,
          url: initialUrl,
          name: deployData.name,
          readyState: 'BUILDING',
          inspectorUrl: deployData.inspectorUrl,
        });
        return;
      }

      try {
        const statusRes = await fetch(`/api/vercel/deployment/${deploymentId}`, {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
          },
        });

        const statusData = await statusRes.json();

        if (statusData.readyState === 'READY') {
          clearInterval(pollTimer);
          onProgress({ step: 4, message: 'Live on Vercel!' });

          // Celebration Confetti
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });

          resolve({
            id: deploymentId,
            url: statusData.alias || statusData.url || initialUrl,
            name: statusData.name,
            readyState: 'READY',
            inspectorUrl: statusData.inspectorUrl,
          });
        } else if (statusData.readyState === 'ERROR' || statusData.readyState === 'CANCELED') {
          clearInterval(pollTimer);
          reject(new Error(`Deployment ended with status: ${statusData.readyState}`));
        } else {
          onProgress({
            step: 3,
            message: `Building & Optimizing assets (${attempts * 2}s)...`,
          });
        }
      } catch (err) {
        // Network retry
      }
    }, 2000);
  });
}
