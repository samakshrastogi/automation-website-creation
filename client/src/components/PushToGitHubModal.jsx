import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Github,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Lock,
  Globe,
  RefreshCw,
  Copy,
  Check,
  FolderGit2,
  Key
} from 'lucide-react';
import {
  getStoredGitHubToken,
  getStoredGitHubUser,
  createGitHubRepository,
  pushProjectToGitHub
} from '../services/githubService.js';
import GitHubConnectModal from './GitHubConnectModal.jsx';

export default function PushToGitHubModal({
  isOpen,
  onClose,
  rawCode,
  defaultRepoName = 'nexusforge-app',
  githubUser,
  onUserUpdate,
}) {
  const [repoName, setRepoName] = useState(
    defaultRepoName.toLowerCase().replace(/[^a-z0-9-_]/g, '-') || 'nexusforge-app'
  );
  const [description, setDescription] = useState(
    'Full-Stack React 18 + Vite + Tailwind CSS application generated with NexusForge AI Studio'
  );
  const [isPrivate, setIsPrivate] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [resultData, setResultData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  if (!isOpen) return null;

  const handlePush = async (e) => {
    e?.preventDefault();
    const token = getStoredGitHubToken();
    const user = githubUser || getStoredGitHubUser();

    if (!token || !user) {
      setConnectModalOpen(true);
      return;
    }

    if (!repoName.trim()) {
      setErrorMsg('Please specify a repository name.');
      return;
    }

    try {
      setIsPushing(true);
      setErrorMsg('');
      setCurrentStep('Creating repository on GitHub...');

      // 1. Create Repository
      const repo = await createGitHubRepository(token, repoName.trim(), description, isPrivate);

      // 2. Commit all project files
      const result = await pushProjectToGitHub(
        token,
        repo.owner.login,
        repo.name,
        rawCode,
        (progress) => setCurrentStep(progress.message)
      );

      setResultData(result);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to push repository to GitHub.');
    } finally {
      setIsPushing(false);
    }
  };

  const handleCopyLink = () => {
    if (resultData?.repoUrl) {
      navigator.clipboard.writeText(resultData.repoUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleResetAndClose = () => {
    setResultData(null);
    setErrorMsg('');
    setCurrentStep(null);
    onClose();
  };

  return (
    <>
      {createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl p-5 sm:p-6 md:p-8 border border-white/15 shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={handleResetAndClose}
              disabled={isPushing}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-[1px] shadow-lg shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
                  <FolderGit2 className="w-6 h-6 text-cyan-300" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Push to GitHub
                </h2>
                <p className="text-xs text-slate-400">
                  Deploy complete 9-file React + Vite repository to your account
                </p>
              </div>
            </div>

            {/* If Success: Show Repository Card */}
            {resultData ? (
              <div className="space-y-4">
                <div className="glass-card rounded-2xl p-5 border border-emerald-500/40 bg-emerald-950/20 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Repository Published Successfully!</h3>
                    <p className="text-xs text-slate-300 font-mono mt-1 break-all">
                      {resultData.repoUrl}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-2">
                    <a
                      href={resultData.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>Open in GitHub</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      onClick={handleCopyLink}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-1.5 transition-all"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleResetAndClose}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md active:scale-95 transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : !githubUser && !getStoredGitHubToken() ? (
              /* If Not Connected: Prompt Connection */
              <div className="space-y-4 text-center py-4">
                <Github className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                <h3 className="text-sm font-bold text-white">Connect Your GitHub Account</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  To push projects directly to GitHub, connect your account with a Personal Access Token in 1 click.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setConnectModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-md active:scale-95 transition-all inline-flex items-center gap-2"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Connect GitHub Account</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Push Form */
              <form onSubmit={handlePush} className="space-y-4">
                {/* Repository Name Input */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Repository Name
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-2.5 rounded-xl border border-white/10">
                      {githubUser?.login || 'user'} /
                    </span>
                    <input
                      type="text"
                      value={repoName}
                      onChange={(e) => setRepoName(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'))}
                      placeholder="my-awesome-website"
                      disabled={isPushing}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 text-slate-100 placeholder-slate-500 text-xs font-mono focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short repository description..."
                    disabled={isPushing}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 text-slate-100 placeholder-slate-500 text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                {/* Privacy Toggle */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Visibility
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPrivate(false)}
                      disabled={isPushing}
                      className={`p-3 rounded-2xl border text-xs font-medium flex items-center gap-2.5 transition-all ${
                        !isPrivate
                          ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-sm'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Globe className="w-4 h-4 text-cyan-300" />
                      <div className="text-left">
                        <p className="font-bold text-white text-xs">Public</p>
                        <p className="text-[10px] text-slate-400">Anyone on the internet</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPrivate(true)}
                      disabled={isPushing}
                      className={`p-3 rounded-2xl border text-xs font-medium flex items-center gap-2.5 transition-all ${
                        isPrivate
                          ? 'bg-purple-500/15 border-purple-500/40 text-purple-300 shadow-sm'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Lock className="w-4 h-4 text-purple-300" />
                      <div className="text-left">
                        <p className="font-bold text-white text-xs">Private</p>
                        <p className="text-[10px] text-slate-400">Only you can see this</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Progress / Status */}
                {isPushing && currentStep && (
                  <div className="glass-card rounded-xl p-3 border border-cyan-500/30 bg-cyan-950/10 flex items-center gap-3">
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-300 shrink-0" />
                    <span className="text-xs font-medium text-cyan-200">{currentStep}</span>
                  </div>
                )}

                {/* Error Banner */}
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    disabled={isPushing}
                    className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPushing || !repoName.trim()}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-md shadow-cyan-500/20 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {isPushing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Publishing to GitHub...</span>
                      </>
                    ) : (
                      <>
                        <Github className="w-3.5 h-3.5" />
                        <span>Create & Push Repository</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* GitHub Account Connect Modal */}
      <GitHubConnectModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        githubUser={githubUser}
        onUserUpdate={onUserUpdate}
      />
    </>
  );
}
