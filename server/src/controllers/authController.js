/**
 * GitHub Authentication Controller
 * Supports standard OAuth 2.0 Web Popup flow and Device Authorization flow
 */

/**
 * Get GitHub OAuth Configuration
 */
export const getGitHubConfig = (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID || '';
  const hasSecret = Boolean(process.env.GITHUB_CLIENT_SECRET && process.env.GITHUB_CLIENT_SECRET.trim() !== '');

  res.status(200).json({
    clientId,
    hasSecret,
    isConfigured: Boolean(clientId && hasSecret),
  });
};

/**
 * Exchange OAuth authorization code for GitHub Access Token & User Profile
 */
export const exchangeGitHubCode = async (req, res) => {
  try {
    const { code, clientId, clientSecret } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required.' });
    }

    const actualClientId = clientId || process.env.GITHUB_CLIENT_ID;
    const actualClientSecret = clientSecret || process.env.GITHUB_CLIENT_SECRET;

    if (!actualClientId || !actualClientSecret) {
      return res.status(400).json({
        error: 'GitHub OAuth Client ID or Client Secret not configured on the server. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in server/.env.',
      });
    }

    // Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: actualClientId,
        client_secret: actualClientSecret,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      return res.status(400).json({
        error: tokenData.error_description || tokenData.error,
      });
    }

    const accessToken = tokenData.access_token;

    // Fetch user profile from GitHub
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'NexusForge-AI-Studio',
      },
    });

    if (!userRes.ok) {
      return res.status(400).json({ error: 'Failed to fetch user details from GitHub.' });
    }

    const userData = await userRes.json();

    return res.status(200).json({
      token: accessToken,
      user: {
        login: userData.login,
        name: userData.name || userData.login,
        avatarUrl: userData.avatar_url,
        htmlUrl: userData.html_url,
        publicRepos: userData.public_repos,
        totalPrivateRepos: userData.total_private_repos || 0,
      },
    });
  } catch (error) {
    console.error('GitHub OAuth Exchange Error:', error);
    return res.status(500).json({ error: 'Internal error exchanging GitHub OAuth code.' });
  }
};

/**
 * Initiate GitHub Device Flow
 */
export const startDeviceFlow = async (req, res) => {
  try {
    const { clientId } = req.body;
    const actualClientId = clientId || process.env.GITHUB_CLIENT_ID;

    if (!actualClientId) {
      return res.status(400).json({
        error: 'GITHUB_CLIENT_ID is not configured in server/.env.',
      });
    }

    const response = await fetch('https://github.com/login/device/code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: actualClientId,
        scope: 'repo,user',
      }),
    });

    const data = await response.json();
    if (data.error || !response.ok) {
      return res.status(400).json({
        error: data.error_description || data.error || `GitHub responded with status ${response.status}`,
      });
    }

    return res.status(200).json({
      deviceCode: data.device_code,
      userCode: data.user_code,
      verificationUri: data.verification_uri,
      expiresIn: data.expires_in,
      interval: data.interval || 5,
    });
  } catch (error) {
    console.error('Device Flow Start Error:', error);
    return res.status(500).json({ error: 'Failed to initiate GitHub Device authorization.' });
  }
};

/**
 * Poll GitHub Device Flow Token
 */
export const pollDeviceToken = async (req, res) => {
  try {
    const { deviceCode, clientId } = req.body;
    if (!deviceCode) {
      return res.status(400).json({ error: 'Device code is required.' });
    }

    const actualClientId = clientId || process.env.GITHUB_CLIENT_ID;

    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: actualClientId,
        device_code: deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({
        status: 'pending',
        error: data.error,
        errorDescription: data.error_description,
      });
    }

    const accessToken = data.access_token;
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'NexusForge-AI-Studio',
      },
    });

    const userData = await userRes.json();

    return res.status(200).json({
      status: 'success',
      token: accessToken,
      user: {
        login: userData.login,
        name: userData.name || userData.login,
        avatarUrl: userData.avatar_url,
        htmlUrl: userData.html_url,
        publicRepos: userData.public_repos,
        totalPrivateRepos: userData.total_private_repos || 0,
      },
    });
  } catch (error) {
    console.error('Poll Device Token Error:', error);
    return res.status(500).json({ error: 'Failed to poll GitHub authorization status.' });
  }
};
