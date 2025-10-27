'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const MusicNotes: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (!containerRef.current || !isClient) return;
    
    const notes = ['♪', '♫', '♬', '♩'];
    const container = containerRef.current;
    
    const createNote = () => {
      const note = document.createElement('div');
      note.className = 'absolute text-2xl opacity-0';
      note.style.color = getComputedStyle(document.documentElement).getPropertyValue('--gradient-primary') || '#00E1FF';
      note.textContent = notes[Math.floor(Math.random() * notes.length)];
      note.style.left = `${Math.random() * 100}%`;
      container.appendChild(note);
      
      gsap.fromTo(note,
        {
          y: '100vh',
          x: gsap.utils.random(-50, 50),
          opacity: 0.1,
        },
        {
          duration: gsap.utils.random(3, 6),
          y: '-100vh',
          x: gsap.utils.random(-100, 100),
          opacity: 0,
          ease: 'none',
          onComplete: () => {
            container.removeChild(note);
          }
        }
      );
    };
    
    const interval = setInterval(createNote, 2000);
    return () => clearInterval(interval);
  }, [isClient]);
  
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
    />
  );
};

export default MusicNotes;
