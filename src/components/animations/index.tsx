'use client';

import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';
import MusicNotes from './MusicNotes';
import FloatingParticles from './FloatingParticles';

gsap.registerPlugin(ScrollTrigger);

interface AnimatedSectionProps {
  children: React.ReactNode;
  delay?: number;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({ children, delay = 0 }) => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        delay,
        ease: [0.6, -0.05, 0.01, 0.99]
      }
    });
  }, [controls, delay]);

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={controls}
      className="relative"
    >
      {children}
    </motion.div>
  );
};

interface AnimatedLinkProps {
  href: string;
  children: React.ReactNode;
}

const AnimatedLink: React.FC<AnimatedLinkProps> = ({ href, children }) => (
  <motion.a
    href={href}
    className="relative inline-block p-2"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <span className="relative z-10 text-white">{children}</span>
    <motion.span
      className="absolute inset-0 gradient-primary rounded-lg opacity-0"
      whileHover={{ opacity: 0.2 }}
      transition={{ duration: 0.2 }}
    />
  </motion.a>
);

interface AnimatedButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ onClick, children }) => (
  <motion.button
    onClick={onClick}
    className="glow-button relative px-6 py-3 bg-gradient-to-r from-[#C13CFF] to-[#FF8A00] rounded-full text-white font-semibold shadow-lg"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {children}
  </motion.button>
);

const AnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Temporarily disabled smooth scroll to fix scrolling issue
  // useSmoothScroll();

  return (
    <>
      <FloatingParticles />
      <MusicNotes />
      {children}
    </>
  );
};

export { AnimationProvider, AnimatedSection, AnimatedLink, AnimatedButton };
export { default as TextReveal } from './TextReveal';
export { default as ScrollReveal } from './ScrollReveal';
export { default as GradientText } from './GradientText';
export { default as FloatingParticles } from './FloatingParticles';
