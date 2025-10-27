'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPalette, faCheck } from '@fortawesome/free-solid-svg-icons';

interface GradientTheme {
  name: string;
  primary: string;
  secondary: string;
  tertiary?: string;
  cssVariables: {
    [key: string]: string;
  };
}

const gradientThemes: GradientTheme[] = [
  {
    name: 'Cyber Blue',
    primary: '#00E1FF',
    secondary: '#C13CFF',
    tertiary: '#FF8A00',
    cssVariables: {
      '--gradient-primary': '#00E1FF',
      '--gradient-secondary': '#C13CFF',
      '--gradient-tertiary': '#FF8A00',
      '--main-gradient': 'linear-gradient(135deg, #00E1FF 0%, #C13CFF 50%, #FF8A00 100%)'
    }
  },
  {
    name: 'Ocean Wave',
    primary: '#00D4FF',
    secondary: '#5B73FF',
    tertiary: '#9B59B6',
    cssVariables: {
      '--gradient-primary': '#00D4FF',
      '--gradient-secondary': '#5B73FF',
      '--gradient-tertiary': '#9B59B6',
      '--main-gradient': 'linear-gradient(135deg, #00D4FF 0%, #5B73FF 50%, #9B59B6 100%)'
    }
  },
  {
    name: 'Sunset Glow',
    primary: '#FF6B6B',
    secondary: '#FFE66D',
    tertiary: '#FF8E53',
    cssVariables: {
      '--gradient-primary': '#FF6B6B',
      '--gradient-secondary': '#FFE66D',
      '--gradient-tertiary': '#FF8E53',
      '--main-gradient': 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 50%, #FF8E53 100%)'
    }
  },
  {
    name: 'Forest Magic',
    primary: '#11998E',
    secondary: '#38EF7D',
    tertiary: '#17A2B8',
    cssVariables: {
      '--gradient-primary': '#11998E',
      '--gradient-secondary': '#38EF7D',
      '--gradient-tertiary': '#17A2B8',
      '--main-gradient': 'linear-gradient(135deg, #11998E 0%, #38EF7D 50%, #17A2B8 100%)'
    }
  },
  {
    name: 'Purple Dream',
    primary: '#667EEA',
    secondary: '#764BA2',
    tertiary: '#F093FB',
    cssVariables: {
      '--gradient-primary': '#667EEA',
      '--gradient-secondary': '#764BA2',
      '--gradient-tertiary': '#F093FB',
      '--main-gradient': 'linear-gradient(135deg, #667EEA 0%, #764BA2 50%, #F093FB 100%)'
    }
  },
  {
    name: 'Fire Storm',
    primary: '#FF512F',
    secondary: '#DD2476',
    tertiary: '#FF8A00',
    cssVariables: {
      '--gradient-primary': '#FF512F',
      '--gradient-secondary': '#DD2476',
      '--gradient-tertiary': '#FF8A00',
      '--main-gradient': 'linear-gradient(135deg, #FF512F 0%, #DD2476 50%, #FF8A00 100%)'
    }
  }
];

const ThemeSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<GradientTheme>(gradientThemes[0]);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
      const theme = gradientThemes.find(t => t.name === savedTheme);
      if (theme) {
        setCurrentTheme(theme);
        applyTheme(theme);
      }
    } else {
      // Apply default theme on first load
      applyTheme(gradientThemes[0]);
    }
  }, []);

  const applyTheme = (theme: GradientTheme) => {
    const root = document.documentElement;
    Object.entries(theme.cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
    
    // Parse RGB values from hex colors for additional CSS properties
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };
    
    const primaryRgb = hexToRgb(theme.primary);
    const secondaryRgb = hexToRgb(theme.secondary);
    const tertiaryRgb = theme.tertiary ? hexToRgb(theme.tertiary) : null;
    
    if (primaryRgb && secondaryRgb && tertiaryRgb) {
      // Update additional dynamic CSS properties
      root.style.setProperty('--primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
      root.style.setProperty('--secondary-rgb', `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`);
      root.style.setProperty('--tertiary-rgb', `${tertiaryRgb.r}, ${tertiaryRgb.g}, ${tertiaryRgb.b}`);
      
      // Update theme-specific background colors and shadows
      root.style.setProperty('--theme-shadow-primary', `0 4px 15px rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.25)`);
      root.style.setProperty('--theme-shadow-glow', `0 0 20px rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.3), 0 0 40px rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.2)`);
      root.style.setProperty('--theme-bg-primary-20', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)`);
      root.style.setProperty('--theme-bg-secondary-20', `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.2)`);
      root.style.setProperty('--gradient-shadow', `0 10px 25px rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.25)`);
      root.style.setProperty('--gradient-bg-subtle', `linear-gradient(135deg, rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1) 0%, rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.1) 50%, rgba(${tertiaryRgb.r}, ${tertiaryRgb.g}, ${tertiaryRgb.b}, 0.1) 100%)`);
      
      // Update background gradients for sections
      root.style.setProperty('--section-bg-gradient', `linear-gradient(135deg, rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.05) 0%, rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.05) 100%)`);
      root.style.setProperty('--hover-color', theme.primary);
    }
  };

  const handleThemeChange = (theme: GradientTheme) => {
    setIsChanging(true);
    setCurrentTheme(theme);
    applyTheme(theme);
    
    // Save to localStorage
    localStorage.setItem('selectedTheme', theme.name);
    
    // Close menu and reset changing state
    setTimeout(() => {
      setIsOpen(false);
      setIsChanging(false);
    }, 300);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
          isChanging 
            ? 'bg-green-500 text-white' 
            : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={isChanging}
      >
        <FontAwesomeIcon 
          icon={isChanging ? faCheck : faPalette} 
          className="mr-2" 
        />
        {isChanging ? 'Applied!' : 'Theme'}
      </motion.button>

      {/* Theme Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute top-full mt-2 right-0 bg-main-dark/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50 min-w-[320px]"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10">
                <h3 className="text-white font-semibold text-center">Choose Theme</h3>
                <p className="text-gray-400 text-sm text-center mt-1">
                  Select a gradient theme for the website
                </p>
              </div>

              {/* Theme Options */}
              <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                {gradientThemes.map((theme, index) => (
                  <motion.button
                    key={theme.name}
                    onClick={() => handleThemeChange(theme)}
                    className={`w-full flex items-center gap-4 p-3 rounded-lg transition-all duration-200 ${
                      currentTheme.name === theme.name
                        ? 'bg-white/20 border-2 border-white/40'
                        : 'bg-white/5 hover:bg-white/10 border-2 border-transparent'
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Gradient Preview */}
                    <div 
                      className="w-12 h-12 rounded-lg border-2 border-white/20"
                      style={{
                        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 50%, ${theme.tertiary} 100%)`
                      }}
                    />
                    
                    {/* Theme Info */}
                    <div className="flex-1 text-left">
                      <h4 className="text-white font-medium">{theme.name}</h4>
                      <div className="flex gap-2 mt-1">
                        <div 
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: theme.primary }}
                        />
                        <div 
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: theme.secondary }}
                        />
                        <div 
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: theme.tertiary }}
                        />
                      </div>
                    </div>

                    {/* Selected Indicator */}
                    {currentTheme.name === theme.name && (
                      <div className="text-green-400">
                        <FontAwesomeIcon icon={faCheck} />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10">
                <p className="text-xs text-gray-500 text-center">
                  Theme preferences are saved automatically
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSwitcher;
