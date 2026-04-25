'use client';

import type { ComponentType } from 'react';
import { motion } from 'framer-motion';
import { Server, Layout, Database, Workflow, Search, Activity } from 'lucide-react';
import type { ArchitectureContent } from './types';

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  screening: Layout,
  base: Server,
  data: Database,
  seo: Search,
};

export default function PremiumArchitecture({ content }: { content: ArchitectureContent }) {
  const pipeline = content.pipeline ?? [];

  return (
    <section id="architecture" className="py-24 bg-zinc-50 dark:bg-zinc-950 relative border-t border-zinc-200/50 dark:border-zinc-900/50 overflow-hidden">

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-sm font-semibold text-blue-500 uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
              <Workflow size={16} />
              The Pipeline
            </h2>
            <h3 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">{content.title}</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">{content.subtitle}</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pipeline.map((node, index) => {
            const Icon = iconMap[node.icon] || Layout;
            return (
              <motion.article
                key={`${node.title}-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-2xl p-6 hover:border-zinc-500 dark:hover:border-zinc-600 transition-colors"
              >
                <div className="absolute top-4 right-4 text-[10px] uppercase tracking-wider text-zinc-500 font-mono">{node.status}</div>
                <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6 text-blue-400" />
                </div>
                <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">{node.title}</h4>
                <ul className="space-y-2">
                  {node.details.map((detail) => (
                    <li key={`${node.title}-${detail}`} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-400 font-mono">
                      <Activity className="w-3 h-3 text-zinc-500 dark:text-zinc-600" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
