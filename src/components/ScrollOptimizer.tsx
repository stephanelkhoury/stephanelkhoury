'use client';

import { useEffect } from 'react';

/**
 * Performance optimization utility for scroll containers
 * Reduces animation complexity during scroll events
 */
export const useScrollPerformance = () => {
  useEffect(() => {
    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    const handleScrollStart = () => {
      if (!isScrolling) {
        isScrolling = true;
        document.documentElement.style.setProperty('--scroll-state', 'scrolling');
        // Temporarily disable complex animations during scroll
        document.body.classList.add('scrolling');
      }
      
      // Reset timeout
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        document.documentElement.style.setProperty('--scroll-state', 'idle');
        document.body.classList.remove('scrolling');
      }, 150); // Debounce scroll end detection
    };

    const handleWheel = (e: WheelEvent) => {
      handleScrollStart();
    };

    const handleScroll = () => {
      handleScrollStart();
    };

    const handleTouchMove = () => {
      handleScrollStart();
    };

    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleTouchMove);
      clearTimeout(scrollTimeout);
    };
  }, []);
};

/**
 * Optimized scroll container component
 */
interface ScrollContainerProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
}

export const OptimizedScrollContainer: React.FC<ScrollContainerProps> = ({
  children,
  className = '',
  maxHeight = '60vh'
}) => {
  useScrollPerformance();

  return (
    <div
      className={`performance-scroll modal-scrollbar ${className}`}
      style={{
        maxHeight,
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollBehavior: 'auto', // Better performance than smooth
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        transform: 'translateZ(0)', // GPU acceleration
        willChange: 'scroll-position',
        // Removed contain property that was blocking scroll
      }}
    >
      {children}
    </div>
  );
};

// Default export component for wrapping the entire app
const ScrollOptimizer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useScrollPerformance();
  
  return <>{children}</>;
};

export default ScrollOptimizer;
