import { GoogleGenerativeAI } from '@google/generative-ai';
import { Chat } from '../models/Chat.js';
import mongoose from 'mongoose';

// In-memory store fallback when MongoDB is not connected
const inMemoryChats = new Map();

// Helper to check MongoDB connection
const isDbConnected = () => mongoose.connection.readyState === 1;

// Curated list of high-impact multi-page website creation & web architecture prompts
const fallbackPromptBank = [
  "Build a complete multi-page SaaS web application with interactive navigation (Home, Features, Pricing with monthly/yearly toggle, Interactive Dashboard preview, and Contact Modal) using React, Tailwind CSS, 3D particle effects, and GSAP animations.",
  "Create a full-scale Luxury E-Commerce store with multi-page views (Hero Storefront, Filterable Product Catalog, 3D Product Detail Modal, Slide-over Cart Drawer, and Checkout Flow) in Tailwind CSS with dark glassmorphism.",
  "Architect a complete Creative Agency website with full multi-page navigation (Home Showreel, Interactive Services Matrix, Case Study Portfolio with filter pills, Team Showcase, and Booking Form) featuring Three.js WebGL visuals.",
  "Develop an enterprise AI Cloud Analytics Suite with full routing (Real-time Analytics Dashboard, API Keys Manager, Usage Billing Tiers, Logs Explorer, and System Settings) with glowing glass cards and live charts.",
  "Build a modern Fintech Banking Portal featuring multi-page views (Personal Accounts, Global Money Transfers, Investment Analytics, Security Vault, and Live Currency Calculator) in dark glassmorphism.",
  "Create a full-featured Cyberpunk Gaming Studio website with multi-page navigation (Latest Game Releases, Esports Tournament Schedule, Community Forum preview, Merch Store, and VIP Member Portal) with glowing neon aesthetics."
];

const SYSTEM_INSTRUCTION = `You are a World-Class Principal Full-Stack Web Architect and Senior UI/UX Designer, operating with the combined capabilities of ChatGPT and Gemini. You specialize in generating COMPLETE, PRODUCTION-READY, FULL-SCALE SINGLE-PAGE & MULTI-VIEW WEBSITES with React, Tailwind CSS, Glassmorphism, 3D Three.js WebGL visuals, and Lucide icons.

WHEN RESPONDING TO A USER REQUEST:
1. FIRST, ALWAYS PROVIDE A CLEAR, HIGH-LEVEL EXECUTIVE SUMMARY IN NATURAL WORDS:
   - State clearly: "✨ **We have implemented all of your requirements!**"
   - Summarize the specific architecture, features, 3D WebGL scenes, animations, interactive state, and design decisions crafted.
2. AT THE END OF YOUR RESPONSE, ENCLOSE THE ENTIRE SELF-CONTAINED REACT CODEBASE INSIDE A SINGLE MARKDOWN CODE BLOCK (\`\`\`jsx ... \`\`\`). The system will automatically package it into a 1-Click ZIP file for the user.

CRITICAL ARCHITECTURAL MANDATES (EVERY PROJECT MUST MEET THESE 11 CORE SECTIONS):
Every generated website MUST contain all 11 fully functional, rich interactive sections on a single unified page:
1. SECTION 1: STICKY GLASSMORPHIC NAVIGATION BAR
   - Brand Logo with glowing icon, smooth anchor scroll links ('#hero', '#features', '#showcase', '#lookbook', '#metrics', '#testimonials', '#pricing', '#faq', '#contact'), Mobile menu drawer toggle, and working Shopping Cart / Action Drawer trigger with live badge counter.
2. SECTION 2: IMMERSIVE 3D HERO SECTION
   - Interactive Three.js WebGL particle physics canvas (or holographic mesh) reacting to mouse movements, high-impact gradient typography, live status pill ('⚡ 2026 NEXT-GEN COLLECTION'), and dual action CTA buttons with smooth scroll transitions.
3. SECTION 3: SOCIAL PROOF & CLIENT MARQUEE / TRUST BAR
   - Animated continuous ticker or grid showcasing verified partner brands, rating scores ('★ 4.9/5 by 10,000+ Users'), and live platform metrics.
4. SECTION 4: INTERACTIVE FEATURE MATRIX & TECH SPECS
   - Multi-column glass cards with Lucide icons, hover glow effects, and interactive tab filtering (e.g. 'Performance', 'Security', 'Architecture', 'Integrations').
5. SECTION 5: DYNAMIC PRODUCT / SERVICE SHOWCASE GRID
   - Dense item cards with contextual AI Pollinations images (e.g. 'https://image.pollinations.ai/prompt/{encoded_prompt}?width=800&height=600&nologo=true'), price tags, category tags, rating stars, and interactive 'Add to Cart / Loadout' actions that update the cart drawer in real time.
6. SECTION 6: INTERACTIVE 3D LOOKBOOK / DEEP-DIVE SHOWCASE
   - Featured high-res AI visual with clickable interactive hotspot tooltips revealing technical specs, materials, or feature highlights.
7. SECTION 7: LIVE KPI & PERFORMANCE METRICS GRID
   - Animated numeric stats counters (e.g. '99.99% Uptime', '10x Faster Synthesis', '50k+ Projects Deployed', '< 15ms Latency').
8. SECTION 8: CUSTOMER TESTIMONIALS & CASE STUDIES GRID
   - Authentic user review cards with Pollinations AI user avatars, star ratings, quotes, names, roles, and verified badges.
9. SECTION 9: TRANSPARENT PRICING & PLAN SWITCHER
   - Interactive Monthly vs. Annual billing toggle (with 20% savings discount tag), feature checklists, highlighted popular tier with glowing borders, and selection actions.
10. SECTION 10: INTERACTIVE FAQ ACCORDION
    - Stateful accordion panels with smooth expansion/collapse animations for common questions.
11. SECTION 11: HIGH-CONVERSION FOOTER & NEWSLETTER / CONTACT SUBSCRIPTION
    - Working email input form with toast notification on submit, complete sitemap links with smooth scrolling, social badges, and copyright.

AI IMAGE GENERATION REQUIREMENT:
- For ALL banners, product photos, showcase graphics, and avatars, ALWAYS generate high-resolution contextual image URLs via Pollinations:
  https://image.pollinations.ai/prompt/{url_encoded_detailed_subject_and_style}?width=1200&height=800&nologo=true
  Avatars: https://image.pollinations.ai/prompt/{url_encoded_avatar_prompt}?width=300&height=300&nologo=true`;

const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-flash-latest',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
];

/**
 * Helper to generate content with automatic model fallback
 */
async function generateWithGeminiFallback(genAI, primaryModelName, contents, generationConfig) {
  // Put primary model first, then unique candidates
  const modelsToTry = Array.from(new Set([primaryModelName || 'gemini-2.5-flash', ...CANDIDATE_MODELS]));
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION,
      });
      const result = await model.generateContent({
        contents,
        generationConfig: generationConfig || {
          temperature: 0.7,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      });
      return {
        text: result.response.text(),
        modelUsed: modelName,
      };
    } catch (err) {
      lastError = err;
      console.warn(`[Gemini Fallback] Model '${modelName}' failed (${err.message}). Trying next candidate...`);
    }
  }

  throw lastError || new Error('All Gemini candidate models failed.');
}

/**
 * Controller: Generate intelligent chat response using Google Gemini
 */
export const generateChat = async (req, res) => {
  try {
    const { message, chatId, model = 'gemini-3.6-flash', history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let aiResponseText = '';
    let resolvedModel = model || 'gemini-3.6-flash';

    if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // Format history for Google Generative AI
        const contents = history.map((msg) => ({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }));

        // Append current message
        contents.push({
          role: 'user',
          parts: [{ text: message }],
        });

        const geminiResult = await generateWithGeminiFallback(genAI, model, contents);
        aiResponseText = geminiResult.text;
        resolvedModel = geminiResult.modelUsed;
      } catch (geminiError) {
        console.error('Gemini API Error:', geminiError.message);
        aiResponseText = `⚠️ **Gemini API Notice:** Unable to reach Gemini API directly (${geminiError.message}).\n\n*Please verify your \`GEMINI_API_KEY\` in \`server/.env\`.*`;
      }
    } else {
      // Mock Gemini response when API key is not yet set: Generate a complete, multi-page Glassmorphic web application
      aiResponseText = `✨ **Complete Multi-Page Website Architecture Generated!**

Here is the complete, self-contained multi-page web application built with **React**, **Tailwind CSS**, **Glassmorphism**, and **interactive client-side page routing** for: *"**${message}**"*.

You can click **"Live Preview"** below to interact with the live website, switch pages (Home, Features, Pricing, About, Contact), test modals, and explore different device viewports!

\`\`\`jsx
import React, { useState, useEffect, useRef } from 'react';

export default function FullWebsiteApp() {
  const [currentPage, setCurrentPage] = useState('home');
  const [billingCycle, setBillingCycle] = useState('annual');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact' },
  ];

  const featuresList = [
    {
      title: 'Neural Web Generation',
      desc: 'Instant full-stack multi-page website synthesis powered by multi-modal AI models.',
      badge: 'Core Engine',
      gradient: 'from-purple-500 to-indigo-500',
    },
    {
      title: '3D Glassmorphism Physics',
      desc: 'WebGL-accelerated canvas particles with dynamic depth, reactive tilt, and iridescent glows.',
      badge: 'Visual Layer',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      title: 'Real-time State Sync',
      desc: 'Seamless data flow with reactive state management, persistent caching, and live updates.',
      badge: 'Data Layer',
      gradient: 'from-pink-500 to-rose-500',
    },
    {
      title: 'Adaptive Multi-Device UI',
      desc: 'Pixel-perfect responsiveness engineered for desktop displays, tablets, and mobile viewports.',
      badge: 'Responsive',
      gradient: 'from-emerald-500 to-teal-500',
    }
  ];

  const pricingTiers = [
    {
      name: 'Starter Cloud',
      priceMonthly: 19,
      priceAnnual: 15,
      desc: 'Ideal for independent creators, solo founders, and modern landing pages.',
      features: ['Up to 5 Multi-Page Sites', '3D WebGL Effects', 'Custom Glass Themes', 'Community Support'],
      popular: false,
    },
    {
      name: 'Pro Architect',
      priceMonthly: 49,
      priceAnnual: 39,
      desc: 'Engineered for scaling startups, agencies, and high-performance apps.',
      features: ['Unlimited Full Websites', 'Real-time AI Code Synthesizer', 'Multi-View State Routing', 'Priority 24/7 Support', 'Export Full Code Bundles'],
      popular: true,
    },
    {
      name: 'Enterprise Matrix',
      priceMonthly: 99,
      priceAnnual: 79,
      desc: 'Custom enterprise infrastructure with dedicated compute and compliance.',
      features: ['Dedicated AI Cluster', 'Custom Three.js Shaders', 'White-Label Branding', 'SLA Guarantee', '1-on-1 Architect Onboarding'],
      popular: false,
    }
  ];

  const handleSubmitContact = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setContactModalOpen(false);
      setFormData({ name: '', email: '', message: '' });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500 selection:text-white relative overflow-x-hidden">
      {/* Background Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl" />
      </div>

      {/* Sticky Glass Navbar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/75 border-b border-white/10 px-4 md:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('home')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
                <i data-lucide="sparkles" className="w-5 h-5 text-cyan-300" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Aether<span className="text-purple-400">AI</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">v3.0</span>
              </h1>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-md">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setCurrentPage(link.id)}
                className={\`px-4 py-1.5 rounded-full text-xs font-medium transition-all \${
                  currentPage === link.id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                }\`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* CTA & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setContactModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 shadow-md shadow-purple-500/20 transition-all active:scale-95"
            >
              <i data-lucide="zap" className="w-3.5 h-3.5" />
              <span>Get Started</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:bg-white/10"
            >
              <i data-lucide="menu" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-white/10 mt-3 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setCurrentPage(link.id);
                  setMobileMenuOpen(false);
                }}
                className={\`w-full text-left px-4 py-2 rounded-xl text-sm font-medium \${
                  currentPage === link.id ? 'bg-purple-600/30 text-purple-300' : 'text-slate-400'
                }\`}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Multi-Page Dynamic View Renderer */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-10">
        {/* PAGE 1: HOME */}
        {currentPage === 'home' && (
          <div className="space-y-16">
            <section className="text-center py-12 md:py-20 relative">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-6">
                <i data-lucide="sparkles" className="w-3.5 h-3.5 text-cyan-300" />
                <span>Next-Generation Automated Full-Stack Architect</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight mb-6">
                Build Complete Websites at the <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">Speed of Thought</span>
              </h2>
              <p className="text-slate-400 text-sm md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
                Generate production-ready multi-page web applications with real state management, 3D WebGL graphics, and responsive glassmorphism.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={() => setCurrentPage('features')}
                  className="px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:scale-105 transition-all shadow-xl shadow-purple-500/25"
                >
                  Explore Features →
                </button>
                <button
                  onClick={() => setCurrentPage('pricing')}
                  className="px-6 py-3.5 rounded-2xl text-sm font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all"
                >
                  View Pricing Plans
                </button>
              </div>

              {/* Showcase Banner */}
              <div className="mt-14 rounded-3xl p-2 bg-gradient-to-tr from-purple-500/30 to-cyan-500/30 border border-white/20 shadow-2xl backdrop-blur-xl">
                <img
                  src="https://image.pollinations.ai/prompt/futuristic%20dark%20glassmorphism%20web%20app%20dashboard%20analytics%20ui%20neon%20cyan%20purple%208k?width=1200&height=650&nologo=true"
                  alt="Web Application Showcase"
                  className="rounded-2xl w-full object-cover max-h-[480px]"
                />
              </div>
            </section>
          </div>
        )}

        {/* PAGE 2: FEATURES */}
        {currentPage === 'features' && (
          <div className="space-y-10 py-6">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Engineered for Perfection</h2>
              <p className="text-slate-400 text-sm">Discover the pillars of our multi-page generative architecture.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuresList.map((f, idx) => (
                <div key={idx} className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl hover:border-purple-500/50 transition-all group">
                  <div className={\`inline-block px-3 py-1 rounded-full text-[11px] font-bold text-white bg-gradient-to-r \${f.gradient} mb-4\`}>
                    {f.badge}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAGE 3: PRICING */}
        {currentPage === 'pricing' && (
          <div className="space-y-10 py-6">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Transparent, Predictable Pricing</h2>
              <p className="text-slate-400 text-sm mb-6">Choose the perfect tier for your workflow and scale effortlessly.</p>
              
              {/* Monthly vs Annual Toggle */}
              <div className="inline-flex items-center gap-2 p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={\`px-4 py-1.5 rounded-full text-xs font-semibold transition-all \${billingCycle === 'monthly' ? 'bg-purple-600 text-white' : 'text-slate-400'}\`}
                >
                  Monthly Billing
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={\`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 \${billingCycle === 'annual' ? 'bg-purple-600 text-white' : 'text-slate-400'}\`}
                >
                  <span>Annual Billing</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">Save 20%</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {pricingTiers.map((tier, idx) => (
                <div
                  key={idx}
                  className={\`p-7 rounded-3xl backdrop-blur-xl border transition-all flex flex-col justify-between \${
                    tier.popular
                      ? 'bg-purple-950/40 border-purple-500/50 shadow-2xl shadow-purple-500/20 relative'
                      : 'bg-slate-900/60 border-white/10'
                  }\`}
                >
                  {tier.popular && (
                    <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 text-[10px] font-bold text-slate-950 uppercase tracking-wider">
                      Most Popular
                    </span>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{tier.name}</h3>
                    <p className="text-xs text-slate-400 mb-6">{tier.desc}</p>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-4xl font-extrabold text-white">
                        \${billingCycle === 'annual' ? tier.priceAnnual : tier.priceMonthly}
                      </span>
                      <span className="text-xs text-slate-400">/ month</span>
                    </div>
                    <div className="space-y-2.5 mb-8">
                      {tier.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2.5 text-xs text-slate-300">
                          <i data-lucide="check" className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setContactModalOpen(true)}
                    className={\`w-full py-3 rounded-xl text-xs font-bold transition-all \${
                      tier.popular
                        ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }\`}
                  >
                    Select Plan
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAGE 4: ABOUT US */}
        {currentPage === 'about' && (
          <div className="space-y-12 py-6 max-w-4xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Our Mission</h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto">
                Empowering every developer, agency, and entrepreneur to turn ideas into fully architected multi-page web applications instantaneously.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10">
                <span className="text-3xl font-extrabold text-cyan-400">99.9%</span>
                <p className="text-xs text-slate-400 mt-1">Uptime Reliability</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10">
                <span className="text-3xl font-extrabold text-purple-400">10x</span>
                <p className="text-xs text-slate-400 mt-1">Faster Synthesis</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10">
                <span className="text-3xl font-extrabold text-pink-400">50k+</span>
                <p className="text-xs text-slate-400 mt-1">Websites Deployed</p>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 5: CONTACT */}
        {currentPage === 'contact' && (
          <div className="max-w-xl mx-auto py-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Get in Touch</h2>
              <p className="text-slate-400 text-xs">Have questions or need a custom solution? Send our engineering team a message.</p>
            </div>
            <form onSubmit={handleSubmitContact} className="p-8 rounded-3xl bg-slate-900/70 border border-white/15 backdrop-blur-2xl space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Alex Rivera"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex@company.com"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Project Scope / Message</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about the website you want to architect..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-90 transition-all shadow-lg"
              >
                {formSubmitted ? 'Message Sent Successfully! ✓' : 'Send Message'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Global Interactive Contact Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-white/20 shadow-2xl relative">
            <button
              onClick={() => setContactModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white"
            >
              <i data-lucide="x" className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-1">Launch Your Web Application</h3>
            <p className="text-xs text-slate-400 mb-4">Enter your details to initiate immediate cloud provisioning.</p>
            <form onSubmit={handleSubmitContact} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <input
                type="email"
                required
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 transition-all shadow-md"
              >
                {formSubmitted ? 'Success! Redirecting...' : 'Confirm & Deploy'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Footer */}
      <footer className="relative z-10 border-t border-white/10 py-10 px-4 md:px-8 mt-20 bg-slate-950/80">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">Aether AI Suite</span>
            <span>© 2026. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <button key={link.id} onClick={() => setCurrentPage(link.id)} className="hover:text-purple-300 transition-colors">
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
\`\`\`

> 💡 **Live Production Connection:** To generate completely bespoke AI websites live on the fly with Google Gemini's neural network, add your API key in \`server/.env\` (\`GEMINI_API_KEY=your_key\`).`;
    }

    // Persist to MongoDB or In-Memory fallback
    let currentChatId = chatId;
    let chatDoc = null;

    if (isDbConnected()) {
      if (currentChatId && mongoose.isValidObjectId(currentChatId)) {
        chatDoc = await Chat.findById(currentChatId);
      }

      if (!chatDoc) {
        // Create title from first 35 chars of user message
        const title = message.slice(0, 35) + (message.length > 35 ? '...' : '');
        chatDoc = new Chat({
          title,
          messages: [],
        });
      }

      chatDoc.messages.push({ role: 'user', content: message, model });
      chatDoc.messages.push({ role: 'model', content: aiResponseText, model });
      await chatDoc.save();
      currentChatId = chatDoc._id.toString();
    } else {
      // In-memory fallback
      if (!currentChatId || !inMemoryChats.has(currentChatId)) {
        currentChatId = 'chat_' + Date.now();
        const title = message.slice(0, 35) + (message.length > 35 ? '...' : '');
        inMemoryChats.set(currentChatId, {
          _id: currentChatId,
          title,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      const memChat = inMemoryChats.get(currentChatId);
      memChat.messages.push({ role: 'user', content: message, model, timestamp: new Date() });
      memChat.messages.push({ role: 'model', content: aiResponseText, model, timestamp: new Date() });
      memChat.updatedAt = new Date();
    }

    return res.status(200).json({
      success: true,
      chatId: currentChatId,
      response: aiResponseText,
      model: resolvedModel,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat controller error:', error);
    return res.status(500).json({
      error: 'An internal server error occurred while processing your chat.',
      details: error.message,
    });
  }
};

/**
 * Controller: Generate a creative, high-impact prompt suggestion on click
 */
export const generatePromptIdea = async (req, res) => {
  try {
    const { category = 'any', tone = 'creative and technical' } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const promptReq = `Generate a single, fascinating, thought-provoking, and deeply engaging prompt or question that a user could ask an AI assistant like Gemini/ChatGPT. 
Focus on ${category} with a ${tone} vibe. 
Return ONLY the prompt text itself, no quotes, no conversational preamble. Keep it within 1 to 2 sentences.`;

        const geminiResult = await generateWithGeminiFallback(genAI, 'gemini-3.6-flash', [{ role: 'user', parts: [{ text: promptReq }] }]);
        const generatedPrompt = geminiResult.text.trim().replace(/^["']|["']$/g, '');

        return res.status(200).json({
          success: true,
          prompt: generatedPrompt,
          model: geminiResult.modelUsed,
          source: 'gemini-live',
        });
      } catch (geminiError) {
        console.warn('Gemini prompt generation error, using fallback:', geminiError.message);
      }
    }

    // Pick random from curated fallback bank
    const randomPrompt = fallbackPromptBank[Math.floor(Math.random() * fallbackPromptBank.length)];
    return res.status(200).json({
      success: true,
      prompt: randomPrompt,
      source: 'curated-spark',
    });
  } catch (error) {
    console.error('Generate prompt controller error:', error);
    return res.status(500).json({ error: 'Failed to generate prompt idea.' });
  }
};

/**
 * Controller: Retrieve chat list
 */
export const getChats = async (req, res) => {
  try {
    if (isDbConnected()) {
      const chats = await Chat.find({}, 'title createdAt updatedAt').sort({ updatedAt: -1 });
      return res.status(200).json({ success: true, chats });
    } else {
      const chats = Array.from(inMemoryChats.values()).map((c) => ({
        _id: c._id,
        title: c.title,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }));
      return res.status(200).json({ success: true, chats });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch chats', details: error.message });
  }
};

/**
 * Controller: Get specific chat with messages
 */
export const getChatById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected() && mongoose.isValidObjectId(id)) {
      const chat = await Chat.findById(id);
      if (!chat) return res.status(404).json({ error: 'Chat not found' });
      return res.status(200).json({ success: true, chat });
    } else {
      const chat = inMemoryChats.get(id);
      if (!chat) return res.status(404).json({ error: 'Chat not found' });
      return res.status(200).json({ success: true, chat });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch chat details', details: error.message });
  }
};

/**
 * Controller: Permanently delete a chat across all storage layers
 */
export const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Chat ID is required.' });
    }

    // 1. Delete from MongoDB database
    if (isDbConnected()) {
      if (mongoose.isValidObjectId(id)) {
        await Chat.findByIdAndDelete(id);
      }
      await Chat.deleteOne({ _id: id }).catch(() => {});
    }

    // 2. Delete from in-memory cache
    inMemoryChats.delete(id);

    return res.status(200).json({
      success: true,
      message: 'Conversation permanently deleted.',
      deletedId: id,
    });
  } catch (error) {
    console.error('Delete chat error:', error);
    return res.status(500).json({ error: 'Failed to permanently delete chat', details: error.message });
  }
};
