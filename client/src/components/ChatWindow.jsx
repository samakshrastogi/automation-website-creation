import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage.jsx';
import { Sparkles, Terminal, Lightbulb, Zap, Bot, ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';

export default function ChatWindow({
  messages,
  isGenerating,
  onSelectPromptPreset,
  onGeneratePromptIdea,
}) {
  const messagesEndRef = useRef(null);
  const heroRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // GSAP animation for hero entrance
  useEffect(() => {
    if (messages.length === 0 && heroRef.current) {
      gsap.fromTo(
        '.hero-chip',
        { opacity: 0, y: 15, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: 'back.out(1.4)' }
      );
      gsap.fromTo(
        '.hero-title',
        { opacity: 0, y: -15 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
      );
    }
  }, [messages.length]);

  const presetChips = [
    {
      icon: Terminal,
      title: 'Full-Stack SaaS Web App',
      prompt: 'Build a complete, production-grade multi-page SaaS web application with working navigation (Home, Features, Pricing with monthly/annual toggle, Dashboard Preview, and Contact Modal) using React, Tailwind CSS, 3D WebGL physics, and Glassmorphism.',
    },
    {
      icon: Sparkles,
      title: 'Creative Agency Studio',
      prompt: 'Architect a full creative design studio website with multi-page client routing (Home Hero, Interactive Services Matrix, Case Study Portfolio with filter tabs, Team Grid, and Client Booking Modal) in dark glassmorphism.',
    },
    {
      icon: Lightbulb,
      title: '3D E-Commerce Storefront',
      prompt: 'Create a complete luxury e-commerce web application featuring multi-view navigation (Hero Storefront, Filterable Product Catalog, 3D Product Detail Modal, Slide-over Cart Drawer with subtotal calculation, and Checkout Form) in Tailwind CSS.',
    },
    {
      icon: Zap,
      title: 'Fintech Banking Portal',
      prompt: 'Build a modern Fintech Banking Portal featuring multi-page views (Personal Accounts, Global Money Transfers, Investment Analytics, Security Vault, and Live Currency Calculator) in dark glassmorphism.',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 md:py-6">
      {messages.length === 0 ? (
        /* Empty State / Compact Hero Landing */
        <div ref={heroRef} className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center pt-2 md:pt-4">
          {/* Glowing 3D Holographic Core Icon */}
          <div className="hero-title relative mb-3.5">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-glass-glow animate-float">
              <div className="w-full h-full bg-gemini-darker/90 backdrop-blur-xl rounded-[14px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-cyan-400/20 blur-sm" />
                <Bot className="w-6 h-6 md:w-7 md:h-7 text-cyan-300 relative z-10" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h2 className="hero-title text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-1.5">
            Nexus<span className="gemini-gradient-text">Forge</span> AI Studio
          </h2>
          <p className="hero-title text-xs md:text-sm text-slate-400 max-w-lg mb-5 leading-relaxed">
            Autonomous 11-section web application synthesis with 3D WebGL physics, live sandbox previews, and full ZIP downloads.
          </p>

          {/* Compact Prompt Chips Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 w-full max-w-3xl text-left">
            {presetChips.map((chip, idx) => {
              const Icon = chip.icon;
              return (
                <div
                  key={idx}
                  onClick={() => onSelectPromptPreset(chip.prompt)}
                  className="hero-chip glass-card p-2.5 px-3 rounded-xl cursor-pointer group flex items-center justify-between gap-2 border border-white/10 hover:border-purple-500/40 hover:bg-purple-500/10 active:scale-95 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 group-hover:bg-purple-500/20 group-hover:text-cyan-300 transition-colors shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate transition-colors">
                      {chip.title}
                    </span>
                  </div>

                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-300 transition-colors shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Active Conversation Message List */
        <div className="space-y-4 py-2 md:py-4">
          {messages.map((msg, index) => (
            <ChatMessage
              key={index}
              message={msg}
              isLast={index === messages.length - 1}
            />
          ))}

          {/* Typing Indicator */}
          {isGenerating && (
            <div className="flex gap-4 w-full max-w-4xl mx-auto py-4 px-4 justify-start">
              <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-[1px]">
                <div className="w-full h-full bg-gemini-darker rounded-[11px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
                </div>
              </div>
              <div className="glass-panel rounded-2xl px-4 py-3 flex items-center gap-2 text-xs text-slate-300 border border-purple-500/30">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span>Synthesizing multi-page architecture with Gemini & WebGL physics...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
