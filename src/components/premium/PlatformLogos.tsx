'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

type LogoItem = {
  name: string;
  slug: string;
  logoUrl: string;
};

export default function PlatformLogos({ items }: { items: LogoItem[] }) {
  if (items.length === 0) return null;

  const repeated = [...items, ...items, ...items];

  return (
    <section id="platforms" className="py-16 md:py-24 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-950 border-t border-zinc-200/60 dark:border-zinc-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 overflow-hidden">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Stack & Platforms</h2>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight mb-4">Platforms I Work On</h3>
            <p className="text-zinc-600 dark:text-zinc-300 text-base sm:text-lg">Hover to pause. Click any logo to view my experience with that platform.</p>
          </motion.div>
        </div>

        <div className="logo-marquee group rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/70 dark:bg-zinc-900/40 py-4">
          <div className="logo-marquee-track group-hover:[animation-play-state:paused]">
            {repeated.map((item, index) => (
              <Link
                key={`${item.slug}-${index}`}
                href={`/platforms/${item.slug}`}
                className="logo-pill bg-white/95 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md"
                aria-label={`Open ${item.name} platform page`}
                title={item.name}
              >
                <img
                  src={item.logoUrl}
                  alt={item.name}
                  className="logo-pill-image"
                  loading="lazy"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
