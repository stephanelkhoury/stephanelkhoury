'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faTag, faArrowRight, faClock, faShare, faCheck } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import Link from 'next/link';
import Modal from './Modal';
import { BlogPost } from '../data/blogPosts';
import { OptimizedScrollContainer } from './ScrollOptimizer';

interface BlogModalProps {
  post: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
}

const BlogModal: React.FC<BlogModalProps> = ({ post, isOpen, onClose }) => {
  const [isShared, setIsShared] = useState(false);

  if (!post) return null;

  // Share functionality
  const handleShare = async () => {
    const shareData = {
      title: post.title,
      text: post.excerpt,
      url: `${window.location.origin}/blog/${post.slug}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/blog/${post.slug}`);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      }
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = `${window.location.origin}/blog/${post.slug}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setIsShared(true);
      setTimeout(() => setIsShared(false), 2000);
    }
  };

  const formatContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => {
      if (paragraph.startsWith('##')) {
        return (
          <h3 key={index} className="text-xl font-bold text-gradient-primary mt-6 mb-3">
            {paragraph.replace('## ', '')}
          </h3>
        );
      }
      if (paragraph.includes('1.') && paragraph.includes('\n')) {
        const items = paragraph.split('\n').filter(item => item.match(/^\d+\./));
        return (
          <ol key={index} className="list-decimal list-inside space-y-2 mb-4 ml-4">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="text-gray-300">
                {item.replace(/^\d+\.\s*/, '')}
              </li>
            ))}
          </ol>
        );
      }
      return (
        <p key={index} className="mb-4 last:mb-0 text-justify">
          {paragraph}
        </p>
      );
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={post.title}>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Blog Image */}
        <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 rounded-lg sm:rounded-xl overflow-hidden group">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
            priority={true}
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Overlay Info */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex justify-between items-end">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="px-2 py-1 text-xs bg-white/20 backdrop-blur-sm rounded-full">
                  {post.category}
                </span>
                {post.readTime && (
                  <span className="px-2 py-1 text-xs bg-white/20 backdrop-blur-sm rounded-full">
                    {post.readTime}
                  </span>
                )}
              </div>
              
              {/* Share Button */}
              <motion.button
                onClick={handleShare}
                className={`px-3 py-1 text-xs rounded-full font-semibold transition-all duration-300 ${
                  isShared 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isShared}
              >
                <FontAwesomeIcon 
                  icon={isShared ? faCheck : faShare} 
                  className="mr-1" 
                />
                {isShared ? 'Shared!' : 'Share'}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-8 xl:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Blog Meta */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faTag} />
                <span>{post.category}</span>
              </div>
              {post.readTime && (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faClock} />
                  <span>{post.readTime}</span>
                </div>
              )}
            </div>

            {/* Blog Content */}
            <OptimizedScrollContainer maxHeight="60vh" className="pr-2 min-h-[200px]">
              <div className="space-y-6">
                <p className="text-gray-300 leading-relaxed text-lg font-light">
                  {post.excerpt}
                </p>
                
                {post.fullContent && (
                  <div className="prose prose-invert prose-lg max-w-none">
                    <div className="text-gray-300 leading-relaxed space-y-4 text-base">
                      {formatContent(post.fullContent)}
                    </div>
                  </div>
                )}
              </div>
            </OptimizedScrollContainer>
          </div>

          {/* Sidebar */}
          <OptimizedScrollContainer maxHeight="60vh" className="lg:col-span-1 pr-2">
            <div className="space-y-8">
              {/* Tags */}
              {post.tags && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <motion.span
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        className="px-3 py-1 bg-gradient-to-r from-gradient-tertiary-rgb/20 to-gradient-secondary-rgb/20 border border-gradient-tertiary-rgb/30 rounded-full text-sm text-gradient-tertiary font-medium"
                      >
                        #{tag}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              {/* Read Full Article Button */}
              <div>
                <Link href={`/blog/${post.slug}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-gradient-tertiary to-gradient-secondary rounded-lg text-white font-medium hover:shadow-lg hover:shadow-gradient-tertiary-rgb/25 transition-all cursor-pointer"
                  >
                    Read Full Article
                    <FontAwesomeIcon icon={faArrowRight} />
                  </motion.div>
                </Link>
              </div>

              {/* Author Info */}
              {post.author && (
                <div className="border-t border-white/10 pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 theme-gradient-primary-secondary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">SE</span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{post.author}</p>
                      <p className="text-gray-400 text-sm">Computer Engineer & Full Stack Developer</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </OptimizedScrollContainer>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden space-y-4 sm:space-y-6">
          {/* Blog Meta */}
          <div className="flex flex-wrap gap-3 sm:gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-xs" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faTag} className="text-xs" />
              <span>{post.category}</span>
            </div>
            {post.readTime && (
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} className="text-xs" />
                <span>{post.readTime}</span>
              </div>
            )}
          </div>

          {/* Blog Content */}
          <OptimizedScrollContainer maxHeight="20rem" className="min-h-[200px]">
            <div className="space-y-3 sm:space-y-4 pr-2">
              <p className="text-gray-300 leading-relaxed text-sm sm:text-base lg:text-lg font-light">
                {post.excerpt}
              </p>
              
              {post.fullContent && (
                <div className="prose prose-invert max-w-none">
                  <div className="text-gray-300 leading-relaxed space-y-3 sm:space-y-4 text-sm sm:text-base">
                    {formatContent(post.fullContent)}
                  </div>
                </div>
              )}
            </div>
          </OptimizedScrollContainer>

          {/* Tags */}
          {post.tags && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Tags</h3>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {post.tags.map((tag, index) => (
                  <motion.span
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="px-2 sm:px-3 py-1 bg-gradient-to-r from-gradient-tertiary-rgb/20 to-gradient-secondary-rgb/20 border border-gradient-tertiary-rgb/30 rounded-full text-xs sm:text-sm text-gradient-tertiary font-medium"
                  >
                    #{tag}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {/* Read Full Article Button */}
          <div className="pt-2">
            <Link href={`/blog/${post.slug}`}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-6 py-3 bg-gradient-to-r from-gradient-tertiary to-gradient-secondary rounded-lg text-white font-medium hover:shadow-lg hover:shadow-gradient-tertiary-rgb/25 transition-all text-sm sm:text-base cursor-pointer"
              >
                Read Full Article
                <FontAwesomeIcon icon={faArrowRight} />
              </motion.div>
            </Link>
          </div>

          {/* Author Info */}
          {post.author && (
            <div className="border-t border-white/10 pt-4 sm:pt-6 mt-4 sm:mt-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 theme-gradient-primary-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-base sm:text-lg">SE</span>
                </div>
                <div>
                  <p className="text-white font-medium text-sm sm:text-base">{post.author}</p>
                  <p className="text-gray-400 text-xs sm:text-sm">Computer Engineer & Full Stack Developer</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default BlogModal;
