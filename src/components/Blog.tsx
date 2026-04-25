'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { AnimatedSection, ScrollReveal, TextReveal } from './animations';
import BlogModal from './BlogModal';

interface BlogPost {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
  link: string;
  fullContent?: string;
  readTime?: string;
  tags?: string[];
  author?: string;
}

const blogPosts: BlogPost[] = [
  {
    title: 'The Future of AI in Music Production',
    excerpt: 'Exploring how artificial intelligence is revolutionizing the way we create and produce music, from automated composition to intelligent mixing.',
    fullContent: 'Artificial Intelligence is transforming the music industry in unprecedented ways. From AI-powered composition tools to intelligent mixing algorithms, technology is reshaping how we create, produce, and consume music.\n\nMachine learning models can now analyze thousands of songs to understand patterns in melody, harmony, and rhythm. This enables AI systems to generate original compositions that sound remarkably human-like. Tools like OpenAI\'s MuseNet and Google\'s Magenta project are pushing the boundaries of what\'s possible.\n\nIn my work on Harmonix, I\'ve seen firsthand how AI can enhance the creative process without replacing human creativity. The key is finding the right balance between technological assistance and artistic expression.',
    date: 'May 28, 2025',
    category: 'AI & Music',
    image: '/blog/ai-music.jpg',
    link: '/blog/ai-music-production',
    readTime: '8 min read',
    tags: ['AI', 'Music Production', 'Machine Learning', 'Creative Technology'],
    author: 'Stephan El Khoury'
  },
  {
    title: 'Building Modern Web Applications with Next.js',
    excerpt: 'A comprehensive guide to creating fast, SEO-friendly web applications using Next.js 13+ with App Router and TypeScript.',
    fullContent: 'Next.js has revolutionized React development with its powerful features and developer experience. The introduction of the App Router in Next.js 13+ brings server components, improved routing, and better performance optimization.\n\nIn this portfolio project, I\'ve leveraged Next.js to create a fast, SEO-friendly website with server-side rendering, static site generation, and optimized image loading. The App Router provides a more intuitive file-based routing system while maintaining backward compatibility.\n\nKey benefits include automatic code splitting, built-in CSS support, and excellent TypeScript integration. These features make Next.js an ideal choice for modern web applications that need to be both performant and maintainable.',
    date: 'May 15, 2025',
    category: 'Web Development',
    image: '/blog/nextjs.jpg',
    link: '/blog/nextjs-modern-apps',
    readTime: '12 min read',
    tags: ['Next.js', 'React', 'TypeScript', 'Web Development', 'SSR'],
    author: 'Stephan El Khoury'
  },
  {
    title: 'The Intersection of Music and Code',
    excerpt: 'How my background in music influences my approach to software development and creates unique problem-solving perspectives.',
    date: 'May 1, 2025',
    category: 'Personal',
    image: '/blog/music-code.jpg',
    link: '/blog/music-and-code',
  },
  {
    title: 'WordPress vs Custom Development: When to Choose What',
    excerpt: 'A detailed analysis of when to use WordPress and when to build custom solutions, based on real project experiences.',
    date: 'April 20, 2025',
    category: 'Web Development',
    image: '/blog/wordpress-vs-custom.jpg',
    link: '/blog/wordpress-vs-custom',
  },
  {
    title: 'Building Scalable E-Learning Platforms',
    excerpt: 'Lessons learned from developing cryptocurrency education platforms with thousands of users and complex course structures.',
    date: 'April 10, 2025',
    category: 'E-Learning',
    image: '/blog/elearning-platforms.jpg',
    link: '/blog/scalable-elearning',
  },
  {
    title: 'From Dream Project to Real-World Application',
    excerpt: 'The journey of transforming Harmonix from a dream project into a production-ready music analysis platform.',
    date: 'March 25, 2025',
    category: 'Startup',
    image: '/blog/dream-to-production.jpg',
    link: '/blog/dream-to-production',
  },
];

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
    <section id="blog" className="py-20 px-6 md:px-20 bg-[#0B001F]/30 relative overflow-hidden">
      
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
                      <span className="px-3 py-1 text-xs bg-gradient-to-r from-[#3b82f6] to-[#10b981] text-black rounded-full font-semibold liquid-bg">
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
                        <span className="px-3 py-1 text-xs bg-gradient-to-r from-[#06b6d4] to-[#10b981] text-white rounded-full font-semibold pulse">
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
                      <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-[#3b82f6]" />
                      <span className="shimmer">{post.date}</span>
                    </motion.div>
                    
                    <motion.h3 
                      className={`font-bold mb-3 group-hover:text-[#3b82f6] transition-colors duration-400  ${
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
                        className="text-[#3b82f6] font-semibold group-hover:text-[#10b981] transition-colors duration-300 flex items-center gap-2"
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
                        className="w-8 h-1 bg-gradient-to-r from-[#3b82f6] to-[#10b981] rounded-full"
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
              className="group px-8 py-4 bg-gradient-to-r from-[#3b82f6] to-[#10b981] text-black font-bold rounded-full hover-glow magnetic liquid-bg relative overflow-hidden"
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
