'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function SiteAura() {
  const pathname = usePathname();
  const hidden = pathname?.startsWith('/admin') ?? false;

  const particles = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, index) => ({
        id: index,
        left: `${(index * 7.1) % 100}%`,
        top: `${(index * 11.3) % 100}%`,
        delay: index * 0.35,
        duration: 8 + (index % 5),
      })),
    []
  );

  if (hidden) return null;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -top-44 -left-36 w-[34rem] h-[34rem] rounded-full bg-blue-600/12 blur-3xl"
        animate={{ x: [0, 90, -20, 0], y: [0, 50, -30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-[20%] -right-40 w-[30rem] h-[30rem] rounded-full bg-cyan-500/10 blur-3xl"
        animate={{ x: [0, -100, 30, 0], y: [0, -30, 40, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-52 left-[22%] w-[32rem] h-[32rem] rounded-full bg-emerald-500/10 blur-3xl"
        animate={{ x: [0, 60, -45, 0], y: [0, -40, 20, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
      />

      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute w-1.5 h-1.5 rounded-full bg-white/20"
          style={{ left: particle.left, top: particle.top }}
          animate={{ y: [0, -16, 0], opacity: [0.25, 0.8, 0.25], scale: [1, 1.8, 1] }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.12),transparent_38%),radial-gradient(circle_at_20%_100%,rgba(16,185,129,0.1),transparent_45%)]" />
    </div>
  );
}
