'use client';

import { motion } from 'framer-motion';
import { Briefcase, ChevronRight, Activity, Cpu } from 'lucide-react';
import type { ExperienceContent } from './types';
export default function PremiumExperience({ content }: { content: ExperienceContent }) {
  const items = content.items ?? [];

  return (
    <section id="experience" className="py-16 md:py-24 bg-white dark:bg-zinc-950 border-t border-zinc-200/50 dark:border-zinc-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-sm font-semibold text-purple-500 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
              <Cpu size={16} />
              Career Trajectory
            </h2>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">{content.title}</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg">{content.subtitle}</p>
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {items.map((item, index) => (
            <motion.article
              key={`${item.title}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group flex flex-col md:flex-row gap-6 bg-zinc-100/70 dark:bg-zinc-900/40 border border-zinc-300/80 dark:border-zinc-800/80 rounded-2xl p-6 md:p-8 hover:bg-zinc-200/70 dark:hover:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all"
            >
              <div className="md:w-1/4 shrink-0">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 text-xs font-mono text-zinc-700 dark:text-zinc-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                  <Activity size={12} className={index === 0 ? 'text-emerald-500' : 'text-zinc-500'} />
                  {item.year}
                </span>
              </div>

              <div className="md:w-3/4 space-y-4">
                <div>
                  <h4 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
                    {item.title}
                    <ChevronRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-500" />
                  </h4>
                  <div className="flex items-center gap-2 mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    <Briefcase size={14} />
                    {item.company}
                  </div>
                </div>

                <p className="text-zinc-700 dark:text-zinc-400 leading-relaxed">{item.description}</p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {item.metrics.map((metric) => (
                    <span key={`${item.title}-${metric}`} className="text-[10px] font-mono uppercase tracking-wider bg-zinc-200/70 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 px-2.5 py-1 rounded-md border border-zinc-300/60 dark:border-zinc-700/50">
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
