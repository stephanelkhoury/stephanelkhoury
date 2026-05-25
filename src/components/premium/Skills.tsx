'use client';

import type { ComponentType } from 'react';
import { motion } from 'framer-motion';
import { Layers, Database, Globe, Search, Play, FileCode2 } from 'lucide-react';
import type { SkillsContent } from './types';

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  frontend: FileCode2,
  backend: Database,
  cms: Globe,
  qa: Layers,
  seo: Search,
  creative: Play,
};

export default function PremiumSkills({ content }: { content: SkillsContent }) {
  const categories = content.categories ?? [];

  return (
    <section id="skills" className="py-16 md:py-24 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200/50 dark:border-zinc-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-sm font-semibold text-emerald-500 uppercase tracking-widest mb-2">Technical Proficiency</h2>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">{content.title}</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg">{content.subtitle}</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => {
            const Icon = iconMap[category.icon] || FileCode2;
            return (
              <motion.div
                key={`${category.title}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-zinc-100/70 dark:bg-zinc-900/30 border border-zinc-300/80 dark:border-zinc-800/80 rounded-2xl p-6 sm:p-8 hover:bg-zinc-200/70 dark:hover:bg-zinc-900/50 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-zinc-200/70 dark:bg-zinc-800/50">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h4 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{category.title}</h4>
                </div>

                <ul className="space-y-3">
                  {category.skills.map((skill) => (
                    <li key={`${category.title}-${skill}`} className="flex items-center gap-3 text-zinc-700 dark:text-zinc-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 dark:bg-zinc-700" />
                      <span className="text-sm font-medium">{skill}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
