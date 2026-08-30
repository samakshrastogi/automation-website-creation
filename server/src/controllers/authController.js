/**
 * GitHub Authentication Controller
 * Direct OAuth 2.0 Web Flow with zero-config for non-tech end users
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
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required.' });
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(400).json({
        error: 'GitHub OAuth App is not configured. Please add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to server/.env.',
        needsConfig: true,
      });
    }

    // Exchange authorization code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
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

    // Fetch authenticated user profile from GitHub
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
