'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
  animationDuration: number;
}

const FloatingParticles: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = React.useState<Particle[]>([]);
  const [isClient, setIsClient] = React.useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Get theme colors from CSS variables
    const getThemeColors = () => {
      if (typeof window !== 'undefined') {
        const root = getComputedStyle(document.documentElement);
        return [
          root.getPropertyValue('--gradient-primary').trim() || '#00E1FF',
          root.getPropertyValue('--gradient-secondary').trim() || '#C13CFF', 
          root.getPropertyValue('--gradient-tertiary').trim() || '#FF8A00',
          '#FFFFFF'
        ];
      }
      return ['#00E1FF', '#C13CFF', '#FF8A00', '#FFFFFF'];
    };
    
    const colors = getThemeColors();
    const particleCount = 50;

    const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.6 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
      animationDuration: 3 + Math.random() * 2,
    }));

    setParticles(newParticles);

    const animateParticles = () => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: (particle.x + particle.speedX + 100) % 100,
          y: (particle.y + particle.speedY + 100) % 100,
        }))
      );
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
    >
      {isClient && particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full blur-sm"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.opacity,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [particle.opacity, particle.opacity * 0.5, particle.opacity],
          }}
          transition={{
            duration: particle.animationDuration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;
