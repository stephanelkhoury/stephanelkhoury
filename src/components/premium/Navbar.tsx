'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';

const navLinks = [
  { name: 'About', href: '#about' },
  { name: 'Services', href: '#services' },
  { name: 'Projects', href: '#projects' },
  { name: 'Skills', href: '#skills' },
  { name: 'Experience', href: '#experience' },
  { name: 'Contact', href: '#contact' },
];

const THEMES = [
  { value: 'dark',   Icon: Moon,    label: 'Dark'  },
  { value: 'light',  Icon: Sun,     label: 'Light' },
  { value: 'system', Icon: Monitor, label: 'Auto'  },
] as const;

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;

  const idx = THEMES.findIndex((t) => t.value === theme);
  const current = THEMES[idx >= 0 ? idx : 0];
  const next    = THEMES[(idx + 1) % THEMES.length];
  const { Icon } = current;

  return (
    <div className="relative">
      <button
        onClick={() => setTheme(next.value)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label={`Switch to ${next.label} mode`}
        className="flex items-center justify-center w-9 h-9 rounded-full border border-zinc-300 dark:border-zinc-700/60 bg-zinc-100 dark:bg-zinc-900/60 hover:border-blue-500/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all duration-200 text-zinc-600 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400"
      >
        <Icon size={15} />
      </button>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            key="tt"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 whitespace-nowrap z-50 pointer-events-none"
          >
            {next.label} mode
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-100 dark:bg-zinc-800 border-l border-t border-zinc-300 dark:border-zinc-700 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PremiumNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 dark:bg-zinc-950/85 backdrop-blur-md border-b border-zinc-300/70 dark:border-zinc-800/60 py-3 md:py-4' : 'bg-white/85 dark:bg-transparent backdrop-blur-sm border-b border-zinc-300/60 dark:border-transparent py-3 md:py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between">
        <a href="#" className="text-lg sm:text-xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-100">
          STEPHAN<span className="text-blue-500">.</span>EK
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              {link.name}
            </a>
          ))}
          <a href="#contact" className="px-5 py-2 rounded-full bg-blue-600/10 text-blue-400 border border-blue-600/20 hover:bg-blue-600 hover:text-white transition-all text-sm font-medium">
            Let&apos;s Talk
          </a>
          <ThemeToggle />
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            className="h-11 w-11 rounded-full border border-zinc-300 dark:border-zinc-700/60 bg-zinc-100/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 flex items-center justify-center"
            onClick={() => setIsOpen((v) => !v)}
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-300 dark:border-zinc-800 px-4 pb-6 pt-4 flex flex-col gap-1 max-h-[calc(100vh-70px)] overflow-y-auto"
          >
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-base font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-500 dark:hover:text-blue-400 py-3 px-2 rounded-lg" onClick={() => setIsOpen(false)}>
                {link.name}
              </a>
            ))}
            <a
              href="#contact"
              className="mt-2 inline-flex items-center justify-center px-5 py-3 rounded-full bg-blue-600 text-white font-medium"
              onClick={() => setIsOpen(false)}
            >
              Let&apos;s Talk
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
