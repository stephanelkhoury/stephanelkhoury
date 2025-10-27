'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShare, 
  faCheck, 
  faLink,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { 
  faTwitter, 
  faLinkedin, 
  faFacebook, 
  faWhatsapp, 
  faReddit 
} from '@fortawesome/free-brands-svg-icons';

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface ShareOption {
  name: string;
  icon: any;
  color: string;
  action: (title: string, text: string, url: string) => void;
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  title, 
  text, 
  url, 
  className = '', 
  size = 'md' 
}) => {
  const [isShared, setIsShared] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'lg':
        return 'px-8 py-4 text-lg';
      default:
        return 'px-6 py-3 text-base';
    }
  };

  const shareOptions: ShareOption[] = [
    {
      name: 'Copy Link',
      icon: faLink,
      color: 'bg-gray-600 hover:bg-gray-700',
      action: async () => {
        try {
          await navigator.clipboard.writeText(url);
          showSuccess();
        } catch (error) {
          fallbackCopy(url);
        }
      }
    },
    {
      name: 'Twitter',
      icon: faTwitter,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: (title, text, url) => {
        const tweetText = `${title} - ${text}`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`, '_blank');
        showSuccess();
      }
    },
    {
      name: 'LinkedIn',
      icon: faLinkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      action: (title, text, url) => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        showSuccess();
      }
    },
    {
      name: 'Facebook',
      icon: faFacebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: (title, text, url) => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        showSuccess();
      }
    },
    {
      name: 'WhatsApp',
      icon: faWhatsapp,
      color: 'bg-green-500 hover:bg-green-600',
      action: (title, text, url) => {
        const message = `${title} - ${text} ${url}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        showSuccess();
      }
    },
    {
      name: 'Reddit',
      icon: faReddit,
      color: 'bg-orange-600 hover:bg-orange-700',
      action: (title, text, url) => {
        window.open(`https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank');
        showSuccess();
      }
    }
  ];

  const showSuccess = () => {
    setIsShared(true);
    setShowShareMenu(false);
    setTimeout(() => setIsShared(false), 2000);
  };

  const fallbackCopy = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showSuccess();
  };

  const handleNativeShare = async () => {
    const shareData = {
      title,
      text,
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        showSuccess();
      } else {
        setShowShareMenu(true);
      }
    } catch (error) {
      setShowShareMenu(true);
    }
  };

  return (
    <div className="relative">
      <motion.button
        onClick={handleNativeShare}
        className={`${getSizeClasses()} rounded-full font-semibold transition-all duration-300 ${
          isShared 
            ? 'bg-green-500 text-white' 
            : 'gradient-primary text-white hover:shadow-lg gradient-shadow'
        } ${className}`}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.98 }}
        disabled={isShared}
      >
        <FontAwesomeIcon 
          icon={isShared ? faCheck : faShare} 
          className="mr-2" 
        />
        {isShared ? 'Shared!' : 'Share'}
      </motion.button>

      {/* Share Menu */}
      <AnimatePresence>
        {showShareMenu && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowShareMenu(false)}
            />
            
            {/* Share Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute top-full mt-2 right-0 bg-main-dark/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50 min-w-[280px]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h3 className="text-white font-semibold">Share Article</h3>
                <button
                  onClick={() => setShowShareMenu(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              {/* Share Options */}
              <div className="p-4 grid grid-cols-2 gap-3">
                {shareOptions.map((option, index) => (
                  <motion.button
                    key={option.name}
                    onClick={() => option.action(title, text, url)}
                    className={`flex items-center gap-3 p-3 rounded-lg text-white transition-all duration-200 ${option.color}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FontAwesomeIcon icon={option.icon} className="text-lg" />
                    <span className="font-medium text-sm">{option.name}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShareButton;
