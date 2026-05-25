'use client';

import { ArrowUp } from 'lucide-react';

export default function PremiumFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-zinc-100 dark:bg-zinc-950 border-t border-zinc-300 dark:border-zinc-900 py-10 md:py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <a href="#" className="text-xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-100 flex items-center gap-1 justify-center md:justify-start mb-2">
              STEPHAN<span className="text-blue-500">.</span>EK
            </a>
            <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} Stephan El Khoury. All rights reserved.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <a href="#about" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors px-1 py-1.5">About</a>
            <a href="#projects" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors px-1 py-1.5">Projects</a>
            <a href="#experience" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors px-1 py-1.5">Experience</a>
            <a href="#contact" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors px-1 py-1.5">Contact</a>
          </div>

          <button onClick={scrollToTop} className="w-11 h-11 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all" aria-label="Scroll to top">
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </footer>
  );
}
