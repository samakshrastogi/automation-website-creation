import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Triangle,
  Globe,
  Rocket,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  getStoredVercelToken,
  deployProjectToVercel
} from '../services/vercelService.js';

export default function DeployToVercelModal({
  isOpen,
  onClose,
  rawCode,
  defaultProjectName = 'nexusforge-app',
  vercelUser,
  onOpenConnectModal,
}) {
  const [projectName, setProjectName] = useState(defaultProjectName);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState(null);
  const [progressState, setProgressState] = useState({ step: 0, message: '' });
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      const sanitized = (defaultProjectName || 'nexusforge-app')
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || `nexusforge-app-${Math.floor(Math.random() * 8999 + 1000)}`;
      setProjectName(sanitized);
      setDeploymentResult(null);
      setProgressState({ step: 0, message: '' });
      setErrorMsg('');
    }
  }, [isOpen, defaultProjectName]);

  if (!isOpen) return null;

  const handleDeploy = async (e) => {
    e?.preventDefault();
    const token = getStoredVercelToken();
    if (!token) {
      setErrorMsg('Please connect your Vercel account first.');
      return;
    }

    try {
      setIsDeploying(true);
      setErrorMsg('');
      setDeploymentResult(null);

      const result = await deployProjectToVercel(
        token,
        projectName,
        rawCode,
        (progress) => setProgressState(progress)
      );

      setDeploymentResult(result);
    } catch (err) {
      setErrorMsg(err.message || 'Deployment to Vercel failed.');
    } finally {
      setIsDeploying(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 md:p-8 border border-white/15 shadow-2xl relative">
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
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-900 to-cyan-500 p-[1px] shadow-lg shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
              <Triangle className="w-5 h-5 fill-white text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Deploy to Vercel
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                1-Click Live
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Publish your full React + Vite application to a live global URL
            </p>
          </div>
        </div>

        {/* Account Status Pill */}
        <div className="mb-5 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
            <span className="text-xs text-slate-300">
              {vercelUser ? (
                <>Deploying as <strong className="text-white font-mono">@{vercelUser.username}</strong></>
              ) : (
                'Vercel Account Not Connected'
              )}
            </span>
          </div>

          {!vercelUser && (
            <button
              onClick={() => {
                onClose();
                onOpenConnectModal();
              }}
              className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 underline"
            >
              Connect Vercel
            </button>
          )}
        </div>

        {/* Success State */}
        {deploymentResult ? (
          <div className="space-y-5 animate-fadeIn">
            <div className="p-5 rounded-2xl bg-gradient-to-b from-emerald-950/40 to-slate-900/80 border border-emerald-500/30 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 mx-auto flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Your Project is Live!</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Deployed successfully to Vercel's global edge network.
                </p>
              </div>

              {/* Live URL Card */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Globe className="w-4 h-4 text-cyan-300 shrink-0" />
                  <span className="text-xs font-mono font-bold text-cyan-300 truncate">
                    {deploymentResult.url}
                  </span>
                </div>
                <a
                  href={deploymentResult.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all flex items-center gap-1 shrink-0 shadow-md shadow-cyan-500/20"
                >
                  <span>Visit</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <a
                href={deploymentResult.inspectorUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1.5"
              >
                <span>Vercel Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md active:scale-95 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Deployment Form */
          <form onSubmit={handleDeploy} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Project Name
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'))}
                  disabled={isDeploying}
                  placeholder="e.g. my-awesome-app"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 text-slate-100 text-xs font-mono focus:border-cyan-400 focus:outline-none"
                  required
                />
                <span className="absolute right-3 text-[11px] font-mono text-slate-500">
                  .vercel.app
                </span>
              </div>
            </div>

            {/* Architecture Details */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-2 text-xs text-slate-400">
              <div className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Deployment Bundle</span>
                </span>
                <span className="font-mono text-[11px] text-cyan-300 font-semibold">9 Files (Vite + React)</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Includes full production build configuration with React 18, Tailwind CSS, Three.js WebGL graphics, and automatic Vite bundling.
              </p>
            </div>

            {/* Live Progress Bar */}
            {isDeploying && (
              <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-cyan-300 font-medium flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{progressState.message || 'Deploying project to Vercel...'}</span>
                  </span>
                  <span className="font-mono text-slate-400 font-bold">
                    Step {progressState.step || 1}/4
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-300"
                    style={{ width: `${(progressState.step || 1) * 25}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Deploy Action Button */}
            <button
              type="submit"
              disabled={isDeploying || !projectName.trim()}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:opacity-50 shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {isDeploying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Deploying to Vercel...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 text-white" />
                  <span>Deploy Live Website</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
