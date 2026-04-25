'use client';

import { motion } from 'framer-motion';
import { Award, Database, ShieldCheck, Zap } from 'lucide-react';
import type { AboutContent } from './types';

export default function PremiumAbout({
  content,
  certificationsCount,
}: {
  content: AboutContent;
  certificationsCount: number;
}) {
  const paragraphs = content.paragraphs ?? [];
  const stats = content.stats ?? [];

  return (
    <section id="about" className="py-24 bg-white dark:bg-zinc-950 relative overflow-hidden border-t border-zinc-200/50 dark:border-zinc-900/50">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="space-y-8">
            <div>
              <h2 className="text-sm font-semibold text-blue-500 uppercase tracking-widest mb-2">{content.kicker}</h2>
              <h3 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight mb-6">
                {content.headline}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">{content.headlineAccent}</span>
              </h3>
            </div>

            <div className="space-y-6 text-zinc-700 dark:text-zinc-400 text-lg leading-relaxed">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
              {stats.map((stat) => (
                <div key={stat.label} className="border border-zinc-300 dark:border-zinc-800 bg-zinc-100/70 dark:bg-zinc-900/50 p-4 rounded-xl">
                  <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-500 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="relative h-full min-h-[500px] flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-md aspect-square">

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-2xl flex flex-col items-center justify-center shadow-2xl z-20">
                <Award className="w-8 h-8 text-amber-400 mb-1" />
                <span className="text-xs font-bold text-zinc-900 dark:text-white">{certificationsCount} CERTS</span>
              </div>

              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border border-zinc-300 dark:border-zinc-800 rounded-full"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-full flex items-center justify-center -rotate-90 group cursor-pointer">
                  <Database className="w-5 h-5 text-emerald-400" />
                  <span className="absolute -top-8 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Control Data</span>
                </div>

                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-full flex items-center justify-center -rotate-90 group cursor-pointer">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                  <span className="absolute -bottom-8 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">QA Base</span>
                </div>
              </motion.div>

              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-12 border border-zinc-300/60 dark:border-zinc-800/60 rounded-full"
              >
                <div className="absolute top-1/2 -left-6 -translate-y-1/2 w-12 h-12 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-full flex items-center justify-center rotate-90 group cursor-pointer">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span className="absolute -left-24 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Screening UI</span>
                </div>
              </motion.div>

              <svg className="absolute inset-0 w-full h-full z-10 opacity-30 pointer-events-none" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#3f3f46" strokeWidth="0.5" strokeDasharray="2 4" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="#3f3f46" strokeWidth="0.5" strokeDasharray="2 4" />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
