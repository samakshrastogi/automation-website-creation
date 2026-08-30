import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Github,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Check
} from 'lucide-react';
import {
  clearGitHubAuth,
  getBackendGitHubConfig,
  loginWithOAuthPopup
} from '../services/githubService.js';

export default function GitHubConnectModal({
  isOpen,
  onClose,
  githubUser,
  onUserUpdate,
}) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [oauthConfig, setOauthConfig] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Check OAuth configuration on open
  useEffect(() => {
    if (isOpen) {
      getBackendGitHubConfig().then((cfg) => setOauthConfig(cfg));
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Direct 1-Click GitHub OAuth Sign-In (Zero Token Input)
  const handleSignInWithGitHub = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!oauthConfig?.isConfigured || !oauthConfig?.clientId) {
      // If OAuth App credentials not yet set in server/.env
      setErrorMsg('GitHub OAuth App not yet configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in server/.env for 1-click login.');
      return;
    }

    try {
      setIsLoggingIn(true);
      const user = await loginWithOAuthPopup(oauthConfig.clientId);
      onUserUpdate(user);
      setSuccessMsg(`Successfully connected as @${user.login}!`);
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'GitHub sign-in was cancelled or failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDisconnect = () => {
    clearGitHubAuth();
    onUserUpdate(null);
    setSuccessMsg('GitHub account disconnected.');
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-5 sm:p-6 md:p-8 border border-white/15 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
              <Github className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              GitHub Integration
            </h2>
            <p className="text-xs text-slate-400">
              1-click authorization to push repositories directly to your account
            </p>
          </div>
        </div>

        {/* Connected Profile Card */}
        {githubUser ? (
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-4 border border-emerald-500/30 bg-emerald-950/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={githubUser.avatarUrl}
                  alt={githubUser.login}
                  className="w-12 h-12 rounded-xl border border-white/20 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white">{githubUser.name}</h3>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <a
                    href={githubUser.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-cyan-300 hover:underline flex items-center gap-1 mt-0.5 font-mono"
                  >
                    @{githubUser.login}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Connected
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={handleDisconnect}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Disconnect Account</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md active:scale-95 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Sign-In Options: 100% Pure 1-Click Login Only */
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-5 border border-white/10 text-center space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">1-Click GitHub Login</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Sign in with your GitHub account. All repository creation permissions are automatically granted upon login.
                </p>
              </div>

              {/* Direct Login Button */}
              <button
                onClick={handleSignInWithGitHub}
                disabled={isLoggingIn}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:to-slate-700 border border-white/20 hover:border-cyan-400/50 shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                    <span>Signing in with GitHub...</span>
                  </>
                ) : (
                  <>
                    <Github className="w-4 h-4 text-white" />
                    <span>Sign in with GitHub</span>
                  </>
                )}
              </button>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Direct GitHub OAuth with automatic repository access</span>
            </div>

            {/* Status Messages */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
