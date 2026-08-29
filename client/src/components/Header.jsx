import React from 'react';
import { Sparkles, Menu, Layers, Database, Cpu, HelpCircle } from 'lucide-react';

export default function Header({
  sidebarOpen,
  setSidebarOpen,
  selectedModel,
  setSelectedModel,
  health,
  onOpenFeatures,
}) {
  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-white/10 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left side: Toggle + Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all active:scale-95"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1px] shadow-spark-glow">
              <div className="w-full h-full bg-gemini-darker rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse-slow" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1">
                  Gemini <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">×</span> ChatGPT
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Glassmorphism 3D
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Full-Stack React + Node.js + MongoDB</p>
            </div>
          </div>
        </div>

        {/* Center: Model Selector */}
        <div className="flex items-center gap-1.5 glass-panel rounded-2xl p-1 px-2 border border-white/10 text-xs shadow-inner">
          <button
            onClick={() => setSelectedModel('gemini-3.6-flash')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
              selectedModel === 'gemini-3.6-flash'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Gemini 3.6 Flash</span>
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
            <span>Gemini 3.7 Flash</span>
          </button>
        </div>

        {/* Right side: Status Indicators & Help */}
        <div className="flex items-center gap-2">
          {/* MongoDB indicator */}
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium glass-pill"
            title={`MongoDB: ${health?.services?.mongodb || 'Connecting...'}`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300 capitalize">{health?.services?.mongodb || 'Ready'}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                health?.services?.mongodb === 'connected' ? 'bg-emerald-400 animate-ping' : 'bg-emerald-400/70'
              }`}
            />
          </div>

          {/* Info Modal Trigger */}
          <button
            onClick={onOpenFeatures}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-medium"
            title="System Architecture & Stack Details"
          >
            <Layers className="w-4 h-4 text-purple-300" />
            <span className="hidden lg:inline">Stack Details</span>
          </button>
        </div>
      </div>
    </header>
  );
}
