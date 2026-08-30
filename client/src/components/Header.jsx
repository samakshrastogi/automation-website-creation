import React from 'react';
import { Sparkles, PanelLeftOpen, Cpu, Zap, Github } from 'lucide-react';

export default function Header({
  sidebarOpen,
  setSidebarOpen,
  selectedModel,
  setSelectedModel,
  githubUser,
  onOpenGitHub,
}) {
  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-white/10 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left side: Brand + Expand Sidebar Button (Shown ONLY when sidebar is closed) */}
        <div className="flex items-center gap-3">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-300 hover:text-cyan-300 hover:bg-white/10 border border-transparent hover:border-cyan-500/30 transition-all active:scale-95 flex items-center justify-center"
              title="Expand Sidebar"
              aria-label="Expand Sidebar"
            >
              <PanelLeftOpen className="w-5 h-5 text-slate-300 hover:text-cyan-300 transition-colors" />
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1px] shadow-spark-glow">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse-slow" />
              </div>
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span className="bg-gradient-to-r from-cyan-400 via-indigo-200 to-purple-400 bg-clip-text text-transparent">
                  NexusForge
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono font-bold tracking-wider">
                  AI STUDIO
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Right side: Model Selector + GitHub Account Button */}
        <div className="flex items-center gap-2.5">
          {/* Model Selector */}
          <div className="flex items-center gap-1.5 glass-panel rounded-2xl p-1 px-2 border border-white/10 text-xs shadow-inner">
            <button
              onClick={() => setSelectedModel('gemini-3.6-flash')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                selectedModel === 'gemini-3.6-flash'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-300" />
              <span>Fast Engine (v3.6)</span>
            </button>
            <button
              onClick={() => setSelectedModel('gemini-3.7-flash')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all hidden sm:flex items-center gap-1.5 ${
                selectedModel === 'gemini-3.7-flash'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-purple-300" />
              <span>Turbo Engine (v3.7)</span>
            </button>
          </div>

          {/* GitHub Connection Button */}
          <button
            onClick={onOpenGitHub}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 ${
              githubUser
                ? 'glass-card border-emerald-500/30 text-emerald-300 hover:border-emerald-500/50'
                : 'glass-card border-white/10 text-slate-300 hover:text-white hover:border-cyan-500/30'
            }`}
            title={githubUser ? `Connected as @${githubUser.login}` : 'Connect GitHub Account'}
          >
            {githubUser ? (
              <>
                <img
                  src={githubUser.avatarUrl}
                  alt={githubUser.login}
                  className="w-4 h-4 rounded-full border border-white/20"
                />
                <span className="hidden sm:inline font-mono">@{githubUser.login}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </>
            ) : (
              <>
                <Github className="w-4 h-4 text-slate-400 hover:text-white" />
                <span className="hidden sm:inline">Connect GitHub</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
