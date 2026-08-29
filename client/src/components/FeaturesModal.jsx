import React from 'react';
import { X, Layers, Sparkles, Database, Cpu, Code2, Globe, CheckCircle2 } from 'lucide-react';

export default function FeaturesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 md:p-8 border border-white/15 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-[1px]">
            <div className="w-full h-full bg-gemini-darker rounded-[15px] p-2 flex items-center justify-center">
              <Layers className="w-6 h-6 text-cyan-300" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Full-Stack Monorepo Architecture</h2>
            <p className="text-xs text-slate-400">React + Node.js + MongoDB + Google Gemini</p>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="glass-card p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 text-cyan-300 text-sm font-semibold mb-2">
              <Sparkles className="w-4 h-4" />
              <span>3D & GSAP Animations</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Real-time WebGL/Three.js interactive particle sphere reacting to mouse physics + GSAP timeline transitions and confetti bursts.
            </p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 text-purple-300 text-sm font-semibold mb-2">
              <Cpu className="w-4 h-4" />
              <span>Google Gemini AI Engine</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Integrated with `@google/generative-ai` with automatic prompt ideation sparks, streaming logic, and fallback demo mode.
            </p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-2">
              <Database className="w-4 h-4" />
              <span>MongoDB & Mongoose</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Persists chat sessions, timestamps, message arrays, and categorized conversation tags with offline fallback.
            </p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2 text-pink-400 text-sm font-semibold mb-2">
              <Code2 className="w-4 h-4" />
              <span>Glassmorphism Design</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Multi-layered acrylic frosted glass panels with `backdrop-filter: blur(24px)`, neon glow borders, and markdown syntax rendering.
            </p>
          </div>
        </div>

        {/* Configuration Quick Guide */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-xs">
          <h4 className="font-semibold text-white mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>How to connect your live API Key:</span>
          </h4>
          <ol className="list-decimal pl-5 space-y-1 text-slate-300">
            <li>Open <code className="text-purple-300 bg-white/5 px-1 py-0.5 rounded">server/.env</code></li>
            <li>Add <code className="text-cyan-300 bg-white/5 px-1 py-0.5 rounded">GEMINI_API_KEY=your_key_here</code> (get a free key at <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="underline text-cyan-400">Google AI Studio</a>)</li>
            <li>Set <code className="text-emerald-300 bg-white/5 px-1 py-0.5 rounded">MONGODB_URI=mongodb://localhost:27017/gemini_chatgpt_db</code> if you have MongoDB running locally.</li>
          </ol>
        </div>

        {/* Dismiss Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg"
          >
            Got it, Let's Chat
          </button>
        </div>
      </div>
    </div>
  );
}
