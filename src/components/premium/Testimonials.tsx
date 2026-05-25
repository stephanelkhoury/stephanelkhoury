'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import type { TestimonialsContent } from './types';
export default function PremiumTestimonials({ content }: { content: TestimonialsContent }) {
  const items = content.items ?? [];

  return (
    <section className="py-16 md:py-24 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200/50 dark:border-zinc-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-sm font-semibold text-blue-500 uppercase tracking-widest mb-2">Trust & Validation</h2>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">{content.title}</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg">{content.subtitle}</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <motion.article
              key={`${item.author}-${index}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-zinc-100/70 dark:bg-zinc-900/40 border border-zinc-300/80 dark:border-zinc-800/80 p-6 sm:p-8 rounded-2xl relative hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors"
            >
              <Quote className="absolute top-6 right-6 w-12 h-12 text-zinc-500/40 dark:text-zinc-800/50" />
              <p className="text-zinc-700 dark:text-zinc-300 italic mb-8 leading-relaxed">"{item.quote}"</p>
              <div>
                <h5 className="text-zinc-900 dark:text-white font-bold text-sm">{item.author}</h5>
                <p className="text-zinc-600 dark:text-zinc-500 text-xs">{item.role}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
