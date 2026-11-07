'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, summary, [data-cursor="hover"]';

export default function CustomCursor() {
  const pathname = usePathname() ?? '';
  const inAdmin = pathname.startsWith('/admin');
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 300, damping: 28, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 300, damping: 28, mass: 0.5 });

  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const visibleRef = useRef(false);
  const hoverRef = useRef(false);

  useEffect(() => {
    if (inAdmin) return;
    const finePointer = window.matchMedia('(pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!finePointer.matches || reduced.matches) return;

    document.documentElement.classList.add('has-custom-cursor');

    const onMove = (event: MouseEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      if (!visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
      }
      const target = event.target as Element | null;
      const isInteractive = Boolean(target && target.closest(INTERACTIVE));
      if (isInteractive !== hoverRef.current) {
        hoverRef.current = isInteractive;
        setHovering(isInteractive);
      }
    };
    const onLeave = () => {
      visibleRef.current = false;
      setVisible(false);
    };
    const onDown = () => document.documentElement.classList.add('cursor-down');
    const onUp = () => document.documentElement.classList.remove('cursor-down');

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, [x, y, inAdmin]);

  return (
    <>
      <motion.div
        aria-hidden="true"
        className={`cursor-ring${hovering ? ' is-hovering' : ''}`}
        style={{ x: ringX, y: ringY, opacity: visible ? 1 : 0 }}
      />
      <motion.div
        aria-hidden="true"
        className="cursor-dot"
        style={{ x, y, opacity: visible ? 1 : 0 }}
      />
    </>
  );
}
