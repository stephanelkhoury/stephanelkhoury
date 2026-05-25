'use client';

import type { ComponentType, CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { Code2, MonitorCheck, BarChart3, Palette, CheckCircle2, Music, Blocks, Briefcase } from 'lucide-react';
import type { ServicesContent } from './types';

const iconMap: Record<string, ComponentType<{ className?: string; style?: CSSProperties }>> = {
  monitor: MonitorCheck,
  code: Code2,
  qa: CheckCircle2,
  seo: BarChart3,
  ui: Palette,
  docs: Blocks,
  music: Music,
  business: Briefcase,
};

export default function PremiumServices({ content }: { content: ServicesContent }) {
  const items = content.items ?? [];
  const fallbackPalette = ['#60a5fa', '#fbbf24', '#34d399', '#c084fc', '#f472b6', '#818cf8', '#fb7185', '#22d3ee'];

  return (
    <section id="services" className="py-16 md:py-24 bg-zinc-50 dark:bg-zinc-950 relative border-t border-zinc-200/50 dark:border-zinc-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-sm font-semibold text-blue-500 uppercase tracking-widest mb-2">Capabilities</h2>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">{content.title}</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg">{content.subtitle}</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, index) => {
            const Icon = iconMap[item.icon] || Code2;
            const iconColor = item.iconColor || fallbackPalette[index % fallbackPalette.length];
            return (
              <motion.div
                key={`${item.title}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="bg-zinc-100/70 dark:bg-zinc-900/40 border border-zinc-300/80 dark:border-zinc-800/80 p-6 sm:p-8 rounded-2xl group transition-all duration-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800/50 hover:border-zinc-400 dark:hover:border-zinc-700 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="mb-6 inline-flex p-3 rounded-xl bg-zinc-200/70 dark:bg-zinc-800/50 group-hover:bg-zinc-300 dark:group-hover:bg-zinc-800 transition-colors relative z-10">
                  <Icon className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" style={{ color: iconColor }} />
                </div>
                <h4 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">{item.title}</h4>
                <p className="text-zinc-700 dark:text-zinc-400 text-sm leading-relaxed relative z-10">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
