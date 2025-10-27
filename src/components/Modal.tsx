'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle escape key press and prevent background scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Store current scroll position
      const scrollY = window.scrollY;
      
      document.addEventListener('keydown', handleEscape);
      
      // Enhanced body scroll prevention for all devices
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      
      // Prevent touch scrolling on mobile
      document.body.style.touchAction = 'none';
      document.body.style.overscrollBehavior = 'none';
      
      // Focus the modal for better accessibility
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      
      // Restore body styles and scroll position
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.touchAction = '';
      document.body.style.overscrollBehavior = '';
      
      // Restore scroll position
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
      
      // Restore focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, onClose]);

  // Handle backdrop click with proper event handling
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 cursor-pointer"
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              type: "spring", 
              duration: 0.4,
              bounce: 0.1,
              stiffness: 200,
              damping: 20
            }}
            className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 md:p-6 lg:p-8 pointer-events-none"
            style={{
              paddingTop: 'max(1rem, env(safe-area-inset-top))',
              paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
            }}
          >
            <div 
              ref={modalRef}
              tabIndex={-1}
              className="bg-main-dark/95 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-7xl max-h-full overflow-hidden flex flex-col pointer-events-auto focus:outline-none relative"
              style={{
                maxHeight: 'calc(100vh - 2rem)',
                minHeight: 'min(400px, calc(100vh - 2rem))',
              }}
            >
              {/* Header - Fixed */}
              <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-main-dark/80 backdrop-blur-sm sticky top-0 z-10">
                {title && (
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold gradient-text pr-4 truncate">
                    {title}
                  </h2>
                )}
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
                  aria-label="Close modal"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-gray-400 hover:text-white text-sm sm:text-base" />
                </motion.button>
              </div>
              
              {/* Content - Scrollable with Performance Optimizations */}
              <div 
                className="flex-1 overflow-y-auto performance-scroll modal-scrollbar overscroll-contain"
                style={{
                  scrollBehavior: 'auto', // Better performance than smooth
                  WebkitOverflowScrolling: 'touch',
                  scrollbarGutter: 'stable',
                  transform: 'translateZ(0)', // GPU acceleration
                  willChange: 'scroll-position',
                  contain: 'layout style paint',
                }}
              >
                <div className="p-3 sm:p-4 md:p-6 lg:p-8 min-h-0">
                  {children}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
