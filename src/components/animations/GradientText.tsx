'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface GradientTextProps {
  text: string;
  className?: string;
  delay?: number;
}

const GradientText: React.FC<GradientTextProps> = ({ text, className = '', delay = 0 }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.8,
        delay,
        ease: [0.6, -0.05, 0.01, 0.99]
      }}
      className={`gradient-text animate-gradientFlow ${className}`}
    >
      {text}
    </motion.span>
  );
};

export default GradientText;
