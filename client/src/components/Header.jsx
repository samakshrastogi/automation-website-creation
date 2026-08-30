import React from 'react';
import { Sparkles, PanelLeftOpen, Cpu, Zap } from 'lucide-react';

export default function Header({
  sidebarOpen,
  setSidebarOpen,
  selectedModel,
  setSelectedModel,
}) {
  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-white/10 px-3 sm:px-4 py-2.5 sm:py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left side: Brand + Expand Sidebar Button */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-300 hover:text-cyan-300 hover:bg-white/10 border border-transparent hover:border-cyan-500/30 transition-all active:scale-95 flex items-center justify-center shrink-0"
              title="Expand Sidebar"
              aria-label="Expand Sidebar"
            >
              <PanelLeftOpen className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 hover:text-cyan-300 transition-colors" />
            </button>
          )}

          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="relative flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1px] shadow-spark-glow shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300 animate-pulse-slow" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center gap-1.5 truncate">
                <span className="bg-gradient-to-r from-cyan-400 via-indigo-200 to-purple-400 bg-clip-text text-transparent truncate">
                  NexusForge
                </span>
                <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono font-bold tracking-wider shrink-0">
                  AI STUDIO
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Right side: Model Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <div className="flex items-center gap-1 glass-panel rounded-xl sm:rounded-2xl p-1 px-1.5 sm:px-2 border border-white/10 text-[11px] sm:text-xs shadow-inner">
            <button
              onClick={() => setSelectedModel('gemini-3.6-flash')}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-medium transition-all flex items-center gap-1 sm:gap-1.5 ${
                selectedModel === 'gemini-3.6-flash'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-300" />
              <span className="hidden sm:inline">Fast Engine (v3.6)</span>
              <span className="sm:hidden">Fast</span>
            </button>
            <button
              onClick={() => setSelectedModel('gemini-3.7-flash')}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-medium transition-all flex items-center gap-1 sm:gap-1.5 ${
                selectedModel === 'gemini-3.7-flash'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-300" />
              <span className="hidden sm:inline">Turbo Engine (v3.7)</span>
              <span className="sm:hidden">Turbo</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
