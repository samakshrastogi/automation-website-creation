/**
 * Vercel REST API & Direct OAuth Controller
 * Handles 1-click Vercel login, atomic project deployments, and status polling
 */

const VERCEL_API_BASE = 'https://api.vercel.com';

/**
 * Get Vercel OAuth Configuration
 */
export const getVercelConfig = (req, res) => {
  const clientId = process.env.VERCEL_CLIENT_ID || '';
  const hasSecret = Boolean(process.env.VERCEL_CLIENT_SECRET && process.env.VERCEL_CLIENT_SECRET.trim() !== '');

  res.status(200).json({
    clientId,
    hasSecret,
    isConfigured: Boolean(clientId && hasSecret),
  });
};

/**
 * Exchange Vercel OAuth code for Access Token & User Profile
 */
export const exchangeVercelCode = async (req, res) => {
  try {
    const { code, redirectUri } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required.' });
    }

    const clientId = process.env.VERCEL_CLIENT_ID;
    const clientSecret = process.env.VERCEL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(400).json({
        error: 'Vercel OAuth is not configured on the server. Please set VERCEL_CLIENT_ID and VERCEL_CLIENT_SECRET in server/.env.',
        needsConfig: true,
      });
    }

    // Exchange code for Vercel access token
    const tokenRes = await fetch(`${VERCEL_API_BASE}/v2/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri || 'http://localhost:3000',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || tokenData.error) {
      return res.status(400).json({
        error: tokenData.error_description || tokenData.error?.message || 'Failed to exchange Vercel authorization code.',
      });
    }

    const accessToken = tokenData.access_token || tokenData.token;

    // Fetch user profile from Vercel
    const userRes = await fetch(`${VERCEL_API_BASE}/v2/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userRes.ok) {
      return res.status(400).json({ error: 'Failed to fetch user details from Vercel.' });
    }

    const userData = await userRes.json();
    const user = userData.user || userData;

    return res.status(200).json({
      token: accessToken,
      user: {
        id: user.id || user.uid,
        username: user.username || user.name || 'Vercel User',
        name: user.name || user.username || 'Vercel User',
        email: user.email || '',
        avatarUrl: user.avatar ? `https://vercel.com/api/www/avatar/${user.avatar}` : null,
      },
    });
  } catch (error) {
    console.error('Vercel OAuth Exchange Error:', error);
    return res.status(500).json({ error: 'Internal error exchanging Vercel OAuth code.' });
  }
};

/**
 * Verify Vercel API Token and fetch user profile
 */
export const verifyVercelToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token || !token.trim()) {
      return res.status(400).json({ error: 'Vercel API token is required.' });
    }

    const cleanToken = token.trim();
    const response = await fetch(`${VERCEL_API_BASE}/v2/user`, {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401 || response.status === 403) {
        return res.status(401).json({ error: 'Invalid Vercel API Token. Please check your token and try again.' });
      }
      return res.status(response.status).json({
        error: errorData.error?.message || `Vercel API error (${response.status})`,
      });
    }

    const data = await response.json();
    const user = data.user || data;

    return res.status(200).json({
      token: cleanToken,
      user: {
        id: user.id || user.uid,
        username: user.username || user.name || 'Vercel User',
        name: user.name || user.username || 'Vercel User',
        email: user.email || '',
        avatarUrl: user.avatar ? `https://vercel.com/api/www/avatar/${user.avatar}` : null,
      },
    });
  } catch (error) {
    console.error('Verify Vercel Token Error:', error);
    return res.status(500).json({ error: 'Internal error verifying Vercel token.' });
  }
};

/**
 * Create an atomic deployment on Vercel
 */
export const createDeployment = async (req, res) => {
  try {
    const { token, name, files, projectSettings } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Vercel token is required.' });
    }
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'Project files are required for deployment.' });
    }

    const cleanToken = token.trim();
    const sanitizedName = (name || 'nexusforge-app')
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || `nexusforge-app-${Date.now()}`;

    // Format files for Vercel API
    const vercelFiles = files.map((file) => ({
      file: file.path || file.file,
      data: file.content || file.data,
      encoding: 'utf-8',
    }));

    const payload = {
      name: sanitizedName,
      files: vercelFiles,
      projectSettings: projectSettings || {
        framework: 'vite',
        buildCommand: 'npm run build',
        outputDirectory: 'dist',
      },
      target: 'production',
    };

    const response = await fetch(`${VERCEL_API_BASE}/v13/deployments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || `Failed to create Vercel deployment (${response.status})`,
      });
    }

    return res.status(200).json({
      id: data.id,
      url: `https://${data.url}`,
      name: data.name,
      readyState: data.readyState || data.status,
      inspectorUrl: data.inspectorUrl || `https://vercel.com/dashboard`,
      createdAt: data.createdAt,
    });
  } catch (error) {
    console.error('Create Vercel Deployment Error:', error);
    return res.status(500).json({ error: 'Internal error creating Vercel deployment.' });
  }
};

/**
 * Check deployment status and get live URL
 */
export const getDeploymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(400).json({ error: 'Vercel authorization token is required.' });
    }

    const response = await fetch(`${VERCEL_API_BASE}/v13/deployments/${id}`, {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || `Failed to fetch deployment status (${response.status})`,
      });
    }

    return res.status(200).json({
      id: data.id,
      url: `https://${data.url}`,
      readyState: data.readyState || data.status,
      name: data.name,
      alias: data.alias && data.alias[0] ? `https://${data.alias[0]}` : `https://${data.url}`,
      inspectorUrl: data.inspectorUrl,
    });
  } catch (error) {
    console.error('Get Deployment Status Error:', error);
    return res.status(500).json({ error: 'Internal error checking deployment status.' });
  }
};
