import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Send, Wand2, RefreshCw, Layers, CornerDownLeft } from 'lucide-react';
import gsap from 'gsap';
import confetti from 'canvas-confetti';

export default function PromptInput({
  inputPrompt,
  setInputPrompt,
  onSubmit,
  isGenerating,
  onGeneratePromptIdea,
  isGeneratingPrompt,
}) {
  const textareaRef = useRef(null);
  const sparkleBtnRef = useRef(null);
  const containerRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState('any');

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputPrompt]);

  // GSAP animation when Prompt is generated
  const handleGeneratePromptClick = async (category = activeCategory) => {
    // 1. GSAP button animation
    if (sparkleBtnRef.current) {
      gsap.to(sparkleBtnRef.current, {
        scale: 0.92,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      });
      gsap.to('.sparkle-icon', {
        rotation: '+=360',
        duration: 0.7,
        ease: 'back.out(1.7)',
      });
    }

    // 2. Trigger Confetti particles
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.88 },
      colors: ['#9b72cf', '#00f2fe', '#ec4899', '#6366f1'],
      disableForReducedMotion: true,
    });

    // 3. Call backend prompt generator
    const newPrompt = await onGeneratePromptIdea(category);

    // 4. GSAP highlight flash on input container
    if (containerRef.current && newPrompt) {
      gsap.fromTo(
        containerRef.current,
        { boxShadow: '0 0 35px rgba(155, 114, 207, 0.8)' },
        { boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)', duration: 1.2, ease: 'power2.out' }
      );
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputPrompt.trim() && !isGenerating) {
        onSubmit();
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-6 pt-2">
      {/* Category selector row for Prompt Generator */}
      <div className="flex items-center justify-between gap-2 mb-2.5 px-2 overflow-x-auto text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="font-semibold text-slate-300">Website Prompts:</span>
          {['any', 'SaaS Landing Page', 'E-Commerce Store', '3D Portfolio', 'Analytics Dashboard', 'Full Website'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                handleGeneratePromptClick(cat);
              }}
              disabled={isGeneratingPrompt}
              className={`px-2.5 py-1 rounded-full glass-pill whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-purple-500/25 border-purple-500/50 text-purple-200 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat === 'any' ? '✨ Spark Website' : cat}
            </button>
          ))}
        </div>

        {/* Generate Prompt Direct Button */}
        <button
          ref={sparkleBtnRef}
          onClick={() => handleGeneratePromptClick(activeCategory)}
          disabled={isGeneratingPrompt}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full font-medium text-[11px] text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-500/20 active:scale-95 transition-all shrink-0"
        >
          <Sparkles className={`w-3.5 h-3.5 sparkle-icon text-cyan-200 ${isGeneratingPrompt ? 'animate-spin' : ''}`} />
          <span>{isGeneratingPrompt ? 'Forging Prompt...' : 'Generate Prompt'}</span>
        </button>
      </div>

      {/* Main Glassmorphic Capsule Input */}
      <div
        ref={containerRef}
        className="glass-input rounded-3xl p-2 md:p-3 relative transition-all duration-300"
      >
        <div className="flex items-end gap-2">
          {/* Sparkle Action Trigger inside input */}
          <button
            onClick={() => handleGeneratePromptClick(activeCategory)}
            disabled={isGeneratingPrompt}
            title="Generate a dynamic website creation prompt"
            className="p-2.5 rounded-2xl text-purple-400 hover:text-purple-200 hover:bg-purple-500/10 active:scale-90 transition-all shrink-0 mb-0.5"
          >
            <Wand2 className={`w-5 h-5 ${isGeneratingPrompt ? 'animate-spin text-cyan-300' : ''}`} />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe any website, landing page, or web app to generate (or click 'Generate Prompt')..."
            className="w-full bg-transparent resize-none border-none outline-none text-slate-100 placeholder-slate-500 text-sm md:text-base leading-relaxed max-h-44 py-2 px-1 focus:ring-0"
          />

          {/* Send / Generate button */}
          <button
            onClick={onSubmit}
            disabled={!inputPrompt.trim() || isGenerating}
            className={`p-3 rounded-2xl shrink-0 transition-all duration-200 flex items-center justify-center ${
              inputPrompt.trim() && !isGenerating
                ? 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95'
                : 'bg-white/5 text-slate-600 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <RefreshCw className="w-5 h-5 animate-spin text-purple-300" />
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Input Footer Helper */}
        <div className="flex items-center justify-between px-3 pt-2 text-[10px] text-slate-500 border-t border-white/5 mt-1.5">
          <div className="flex items-center gap-2">
            <span>Press <kbd className="px-1 py-0.5 rounded bg-white/10 text-slate-300 font-mono">Enter ↵</kbd> to send</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Shift + Enter for new line</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>Gemini 3.6 Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
