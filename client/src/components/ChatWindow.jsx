import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage.jsx';
import { Sparkles, Terminal, Cpu, Lightbulb, Compass, Zap, Bot } from 'lucide-react';
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
        '.hero-card',
        { opacity: 0, y: 25, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.4)' }
      );
      gsap.fromTo(
        '.hero-title',
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
    }
  }, [messages.length]);

  const presetCards = [
    {
      icon: Terminal,
      title: 'SaaS AI Landing Page',
      desc: 'Create dark glassmorphic landing page with pricing & hero CTA.',
      prompt: 'Create a complete, responsive dark glassmorphism SaaS landing page for an AI agent platform with animated hero CTA, feature grid cards, interactive pricing tiers, and testimonial slider using HTML5 and Tailwind CSS.',
    },
    {
      icon: Sparkles,
      title: '3D Glass Portfolio',
      desc: 'Build creative portfolio with glowing skill badges and projects.',
      prompt: 'Build a full creative developer portfolio website with dark glassmorphism, glowing skill cards, interactive project filter pills, and contact form in Tailwind CSS.',
    },
    {
      icon: Lightbulb,
      title: 'E-Commerce Storefront',
      desc: 'Interactive sneaker showcase with 3D card tilt & cart drawer.',
      prompt: 'Design a high-end luxury e-commerce product showcase website with sticky glass navigation, 3D product preview cards, customer rating badges, and slide-over cart drawer using Tailwind CSS.',
    },
    {
      icon: Zap,
      title: 'Generate Website Spark',
      desc: 'Click to forge a brand new website prompt via Gemini AI.',
      isGenerator: true,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      {messages.length === 0 ? (
        /* Empty State / Hero Landing */
        <div ref={heroRef} className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[65vh] text-center pt-8">
          {/* Glowing 3D Holographic Core */}
          <div className="hero-title relative mb-6">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-glass-glow animate-float">
              <div className="w-full h-full bg-gemini-darker/90 backdrop-blur-xl rounded-[22px] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-cyan-400/20 blur-md" />
                <Bot className="w-10 h-10 md:w-12 md:h-12 text-cyan-300 relative z-10" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h2 className="hero-title text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-3">
            Automated <span className="gemini-gradient-text">Website Creation</span> AI
          </h2>
          <p className="hero-title text-sm md:text-base text-slate-400 max-w-xl mb-10 leading-relaxed">
            Generate full-stack websites, landing pages, and web apps with instant live previews, 3D glassmorphism, and Gemini intelligence.
          </p>

          {/* Prompt Presets Row (Single Horizontal Line) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full max-w-5xl text-left">
            {presetCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (card.isGenerator) {
                      onGeneratePromptIdea('any');
                    } else {
                      onSelectPromptPreset(card.prompt);
                    }
                  }}
                  className="hero-card glass-card p-3.5 rounded-xl cursor-pointer group flex flex-col justify-between relative overflow-hidden min-h-[115px] border border-white/10 hover:border-purple-500/40"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 group-hover:bg-purple-500/20 group-hover:text-cyan-300 transition-colors">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[9px] uppercase font-semibold tracking-wider text-slate-500 group-hover:text-purple-300 transition-colors">
                      {card.isGenerator ? 'Spark' : 'Explore'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-slate-200 group-hover:text-white mb-1 transition-colors leading-tight">
                      {card.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Active Conversation Message List */
        <div className="space-y-4 py-4">
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
              <div className="glass-panel rounded-2xl px-5 py-4 flex items-center gap-2">
                <span className="text-xs text-purple-300 font-medium mr-1">Gemini is reasoning</span>
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}
