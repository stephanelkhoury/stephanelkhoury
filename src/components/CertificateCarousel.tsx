'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faTimes, faExternalLinkAlt, faDownload } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';

interface Certificate {
  id: string;
  title: string;
  organization: string;
  type: string;
  filename: string;
  path: string;
  preview: string;
}

interface CertificateCarouselProps {
  certificates: Certificate[];
}

const CertificateCarousel: React.FC<CertificateCarouselProps> = ({ certificates }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const itemsPerPage = 3;
  const totalPages = Math.ceil(certificates.length / itemsPerPage);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  const getCurrentItems = () => {
    const start = currentIndex * itemsPerPage;
    return certificates.slice(start, start + itemsPerPage);
  };

  const handleCertificateClick = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setIsPopupVisible(true);
    setCountdown(5);
  };

  const closePopup = () => {
    setIsPopupVisible(false);
    setTimeout(() => setSelectedCertificate(null), 300);
  };

  // Auto-close popup after 5 seconds with countdown
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;
    let closeTimeout: NodeJS.Timeout;

    if (isPopupVisible && selectedCertificate) {
      countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setIsPopupVisible(false);
            closeTimeout = setTimeout(() => setSelectedCertificate(null), 300);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
      if (closeTimeout) clearTimeout(closeTimeout);
    };
  }, [isPopupVisible, selectedCertificate]);

  // Auto-advance carousel every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!selectedCertificate) {
        nextSlide();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedCertificate, nextSlide]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isPopupVisible) {
        if (event.key === 'Escape') {
          closePopup();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPopupVisible]);

  const handleViewCertificate = () => {
    if (selectedCertificate) {
      window.open(selectedCertificate.path, '_blank');
    }
  };

  const handleDownloadCertificate = () => {
    if (selectedCertificate) {
      const link = document.createElement('a');
      link.href = selectedCertificate.path;
      link.download = selectedCertificate.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      <div className="relative">
        {/* Carousel Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Certificates & Achievements</h3>
          <div className="flex gap-2">
            <motion.button
              onClick={prevSlide}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              disabled={totalPages <= 1}
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-white text-sm" />
            </motion.button>
            <motion.button
              onClick={nextSlide}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              disabled={totalPages <= 1}
            >
              <FontAwesomeIcon icon={faChevronRight} className="text-white text-sm" />
            </motion.button>
          </div>
        </div>

        {/* Carousel Content */}
        <div className="overflow-hidden">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {getCurrentItems().map((certificate) => (
              <motion.div
                key={certificate.id}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCertificateClick(certificate)}
                className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 cursor-pointer hover:bg-white/10 transition-all duration-300 group"
              >
                {/* Certificate Preview Image */}
                <div className="w-full h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg mb-4 overflow-hidden border border-white/10 relative">
                  <Image
                    src={certificate.preview}
                    alt={`${certificate.title} Certificate`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const placeholder = target.nextElementSibling as HTMLElement;
                      if (placeholder) placeholder.style.display = 'flex';
                    }}
                  />
                  {/* Fallback placeholder */}
                  <div 
                    className="absolute inset-0 flex items-center justify-center text-4xl text-white/60 group-hover:text-white/80 transition-colors"
                    style={{ display: 'none' }}
                  >
                    📜
                  </div>
                </div>

                {/* Certificate Info */}
                <div className="space-y-2">
                  <h4 className="text-white font-semibold text-sm leading-tight group-hover:text-blue-300 transition-colors">
                    {certificate.title}
                  </h4>
                  <p className="text-white/70 text-xs">
                    {certificate.organization}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 text-xs bg-white/10 rounded-full px-2 py-1">
                      {certificate.type}
                    </span>
                    <div className="text-white/40 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to view
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Pagination Dots */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-white scale-125'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Certificate Popup */}
      <AnimatePresence>
        {isPopupVisible && selectedCertificate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={closePopup}
          >
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
            
            {/* Popup Content */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-4xl w-full mx-4 border border-white/20 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Close Button */}
              <div className="flex-shrink-0 relative p-4 pb-0">
                <button
                  onClick={closePopup}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-colors z-10"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-white text-sm" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto modal-scrollbar p-6 pt-2">
                {/* Certificate Preview */}
                <div className="mb-6">
                {/* PDF Preview */}
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <div className="w-full h-96 rounded-lg bg-gradient-to-br from-white/90 to-gray-100 flex items-center justify-center border-2 border-gray-300 shadow-inner">
                    <div className="text-center p-8">
                      <div className="text-6xl mb-4">📜</div>
                      <h4 className="text-gray-800 font-bold text-lg mb-2">
                        {selectedCertificate.title}
                      </h4>
                      <p className="text-gray-600 mb-4">
                        {selectedCertificate.organization}
                      </p>
                      <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium inline-block">
                        {selectedCertificate.type}
                      </div>
                      <div className="mt-4 text-gray-500 text-sm">
                        Click &quot;View Certificate&quot; to open the full PDF
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Certificate Info */}
                <div className="text-center">
                  <h3 className="text-white text-xl font-bold mb-2">
                    {selectedCertificate.title}
                  </h3>
                  <p className="text-white/70 text-sm mb-1">
                  {selectedCertificate.organization}
                </p>
                <span className="inline-block text-white/50 text-xs bg-white/10 rounded-full px-3 py-1">
                  {selectedCertificate.type}
                </span>
              </div>
              </div>

              {/* Auto-close countdown */}
              <div className="mb-6">
                <div className="flex items-center justify-center gap-2 text-white/60 text-sm mb-2">
                  <span>Auto-closing in {countdown}s</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${(countdown / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleViewCertificate}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faExternalLinkAlt} className="text-sm" />
                  View Certificate
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownloadCertificate}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faDownload} className="text-sm" />
                  Download
                </motion.button>
              </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CertificateCarousel;
