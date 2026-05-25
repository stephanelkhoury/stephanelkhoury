'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Layers, Code2, Cpu, LineChart } from 'lucide-react';
import type { HeroContent } from './types';

export default function PremiumHero({ content }: { content: HeroContent }) {
  const highlights = content.highlights ?? [];

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center pt-24 md:pt-20 pb-10 md:pb-0 overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <div className="hero-spotlight pointer-events-none absolute inset-0 z-0" />
      <div className="hero-grid-overlay absolute inset-0 z-0 opacity-20" />

      <div className="max-w-7xl relative z-10 mx-auto px-4 sm:px-6 md:px-12 flex flex-col items-center w-full">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-5xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm mb-6 md:mb-8 text-blue-400">
            <LineChart size={14} />
            <span className="text-xs font-semibold tracking-wide uppercase">{content.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-5 md:mb-6 leading-[1.08]">
            {content.headingPrimary}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400">{content.headingAccent}</span>
            <br className="hidden md:block" />
            {content.headingSuffix}
          </h1>

          <p className="text-base sm:text-lg md:text-2xl text-zinc-600 dark:text-zinc-400 mb-8 md:mb-12 font-light max-w-3xl mx-auto leading-relaxed">
            {content.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full justify-center">
            {content.ctaPrimaryLabel && content.ctaPrimaryHref && (
              <a href={content.ctaPrimaryHref} className="group relative flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 md:py-4 bg-zinc-100 hover:bg-white text-zinc-950 rounded-full font-bold transition-all w-full sm:w-auto min-h-12 overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  {content.ctaPrimaryLabel}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
            )}
            {content.ctaSecondaryLabel && content.ctaSecondaryHref && (
              <a href={content.ctaSecondaryHref} className="px-6 sm:px-8 py-3.5 md:py-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 hover:border-blue-500/50 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white rounded-full font-medium transition-all w-full sm:w-auto min-h-12 flex items-center justify-center gap-2 group">
                <Layers size={18} className="text-zinc-600 dark:text-zinc-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                {content.ctaSecondaryLabel}
              </a>
            )}
          </div>
        </motion.div>

        <div className="w-full max-w-5xl mt-12 sm:mt-16 md:mt-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 relative z-10">
          {highlights.slice(0, 4).map((highlight, index) => {
            const Icon = [Code2, Cpu, LineChart, Layers][index] || Layers;
            return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              className="bg-zinc-100/80 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-300/80 dark:border-zinc-800/80 p-4 md:p-5 rounded-2xl hover:bg-zinc-200/70 dark:hover:bg-zinc-800/50 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors group"
            >
              <div className="text-blue-400 mb-3 group-hover:scale-110 transition-transform origin-left"><Icon /></div>
              <h3 className="text-zinc-900 dark:text-white font-semibold text-sm mb-1">{highlight.title}</h3>
              <p className="text-zinc-600 dark:text-zinc-500 text-xs">{highlight.desc}</p>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
