'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { AnimatedSection, ScrollReveal, TextReveal } from './animations';
import BlogModal from './BlogModal';
import { BlogPost, blogPosts } from '../data/blogPosts';

const Blog: React.FC = () => {
  const [showAllArticles, setShowAllArticles] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const displayedPosts = showAllArticles ? blogPosts : blogPosts.slice(0, 3);

  const handlePostClick = (post: BlogPost) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
  };

  return (
    <section id="blog" className="py-20 px-6 md:px-20 bg-main-dark/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-32 right-20 w-64 h-64 bg-gradient-secondary-rgb/20 rounded-full blur-3xl floating" />
        <div className="absolute bottom-40 left-16 w-80 h-80 bg-gradient-primary-rgb/15 rounded-full blur-3xl floating" style={{ animationDelay: '3s' }} />
      </div>
      
      <AnimatedSection>
        <div className="text-center mb-16">
          <TextReveal 
            text="Latest Articles & Thoughts"
            className="text-4xl font-bold mb-6"
          />
          <ScrollReveal delay={0.3}>
            <p className="text-gray-300 max-w-3xl mx-auto text-lg leading-relaxed">
              Exploring the intersection of technology, music, and innovation through detailed articles and personal insights
            </p>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {displayedPosts.map((post, index) => (
            <ScrollReveal key={index} delay={index * 0.1} direction="up">
              <motion.article
                className={`group cursor-pointer h-full ${index === 0 && !showAllArticles ? 'lg:col-span-2 lg:row-span-1' : ''}`}
                whileHover={{ y: -12, scale: 1.02 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                onClick={() => handlePostClick(post)}
              >
                <motion.div 
                  className="glass rounded-xl overflow-hidden h-full hover-glow magnetic"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className={`relative overflow-hidden ${index === 0 && !showAllArticles ? 'h-64 lg:h-80' : 'h-48'}`}>
                    <motion.div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${post.image})` }}
                      whileHover={{ scale: 1.15 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/60 transition-all duration-500" />
                    
                    {/* Category Badge */}
                    <motion.div 
                      className="absolute top-4 left-4"
                      whileHover={{ scale: 1.1, rotate: 2 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="px-3 py-1 text-xs theme-gradient-primary-tertiary text-black rounded-full font-semibold liquid-bg">
                        {post.category}
                      </span>
                    </motion.div>
                    
                    {/* Featured Badge for first article */}
                    {index === 0 && !showAllArticles && (
                      <motion.div 
                        className="absolute top-4 right-4"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                      >
                        <span className="px-3 py-1 text-xs bg-gradient-to-r from-gradient-secondary to-gradient-tertiary text-white rounded-full font-semibold pulse">
                          Featured
                        </span>
                      </motion.div>
                    )}
                    
                    {/* Hover Arrow Icon */}
                    <motion.div
                      className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                      initial={{ opacity: 0, scale: 0, rotate: -45 }}
                      animate={{ 
                        opacity: hoveredIndex === index ? 1 : 0,
                        scale: hoveredIndex === index ? 1 : 0,
                        rotate: hoveredIndex === index ? 0 : -45
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <FontAwesomeIcon icon={faArrowRight} className="text-white text-sm" />
                    </motion.div>
                  </div>
                  
                  <div className="p-6 relative">
                    <motion.div 
                      className="flex items-center text-sm text-gray-400 mb-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gradient-primary" />
                      <span className="shimmer">{post.date}</span>
                    </motion.div>
                    
                    <motion.h3 
                      className={`font-bold mb-3 group-hover:text-gradient-primary transition-colors duration-400  ${
                        index === 0 && !showAllArticles ? 'text-2xl lg:text-3xl' : 'text-xl'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      {post.title}
                    </motion.h3>
                    
                    <motion.p 
                      className={`text-gray-300 leading-relaxed mb-4 ${
                        index === 0 && !showAllArticles ? 'text-base lg:text-lg' : 'text-sm'
                      }`}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                    >
                      {post.excerpt}
                    </motion.p>
                    
                    <motion.div 
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.4 }}
                    >
                      <motion.span 
                        className="text-gradient-primary font-semibold group-hover:text-gradient-tertiary transition-colors duration-300 flex items-center gap-2"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        Read More
                        <motion.div
                          animate={{ x: hoveredIndex === index ? 5 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                        </motion.div>
                      </motion.span>
                      
                      <motion.div
                        className="w-8 h-1 theme-gradient-primary-tertiary rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: 32 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              </motion.article>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.3}>
          <div className="text-center">
            <motion.button
              onClick={() => setShowAllArticles(!showAllArticles)}
              className="group px-8 py-4 theme-gradient-primary-tertiary text-black font-bold rounded-full hover-glow magnetic liquid-bg relative overflow-hidden"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <motion.span
                className="relative z-10 flex items-center gap-3"
                whileHover={{ x: 2 }}
              >
                {showAllArticles ? 'Show Featured Articles' : 'Explore All Articles'}
                <motion.div
                  animate={{ rotate: showAllArticles ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FontAwesomeIcon icon={faArrowRight} />
                </motion.div>
              </motion.span>
              
              {/* Button shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </motion.button>
          </div>
        </ScrollReveal>
      </AnimatedSection>

      {/* Blog Modal */}
      <BlogModal
        post={selectedPost}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </section>
  );
};

export default Blog;
