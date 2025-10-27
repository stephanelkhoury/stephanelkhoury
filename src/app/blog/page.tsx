'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faArrowRight, 
  faClock, 
  faTag,
  faSearch,
  faFilter,
  faGripVertical,
  faList,
  faTimes,
  faChevronDown,
  faSort,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost, blogPosts } from '../../data/blogPosts';

const BlogListPage: React.FC = () => {
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(blogPosts);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'category'>('date');
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['All', ...Array.from(new Set(blogPosts.map(post => post.category)))];

  useEffect(() => {
    // Simulate loading for smooth UX
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    filterPosts(category, searchTerm);
    setIsFilterOpen(false);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    filterPosts(selectedCategory, term);
  };

  const sortPosts = (posts: BlogPost[], sortType: string) => {
    return [...posts].sort((a, b) => {
      switch (sortType) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'date':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });
  };

  const filterPosts = (category: string, search: string) => {
    let filtered = blogPosts;

    if (category !== 'All') {
      filtered = filtered.filter(post => post.category === category);
    }

    if (search) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }

    const sorted = sortPosts(filtered, sortBy);
    setFilteredPosts(sorted);
  };

  useEffect(() => {
    filterPosts(selectedCategory, searchTerm);
  }, [sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-main-dark via-main-dark-secondary to-main-dark flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 border-4 border-gradient-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading articles...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-main-dark via-main-dark-secondary to-main-dark relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-32 right-20 w-64 h-64 bg-gradient-secondary-rgb/20 rounded-full blur-3xl floating" />
        <div className="absolute bottom-40 left-16 w-80 h-80 bg-gradient-primary-rgb/15 rounded-full blur-3xl floating" style={{ animationDelay: '3s' }} />
      </div>

      {/* Header */}
      <motion.header
        className="sticky top-0 z-50 backdrop-blur-lg bg-main-dark/80 border-b border-white/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 sm:gap-3 text-gradient-primary hover-text-gradient-tertiary transition-colors duration-300">
              <FontAwesomeIcon icon={faArrowRight} className="rotate-180 text-sm sm:text-base" />
              <span className="font-semibold text-sm sm:text-base">Back to Home</span>
            </Link>
            
            {/* Mobile Stats */}
            <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-400">
              <span className="hidden sm:inline">{filteredPosts.length} articles</span>
              <span className="sm:hidden">{filteredPosts.length}</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 gradient-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            All Articles
          </motion.h1>
          <motion.p
            className="text-gray-300 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Exploring the intersection of technology, music, and innovation through detailed articles and personal insights
          </motion.p>
        </motion.div>

        {/* Enhanced Filters and Search */}
        <motion.div
          className="max-w-6xl mx-auto mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {/* Search and Controls Bar */}
          <div className="glass rounded-2xl p-4 sm:p-6 mb-6 backdrop-blur-xl border border-white/10">
            {/* Mobile-First Search */}
            <div className="relative mb-4 sm:mb-6">
              <FontAwesomeIcon 
                icon={faSearch} 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" 
              />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gradient-primary/50 focus:border-gradient-primary transition-all duration-300 text-sm sm:text-base"
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-sm" />
                </button>
              )}
            </div>

            {/* Controls Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Mobile Filter Toggle */}
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="sm:hidden flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg text-sm font-medium transition-all hover:bg-white/20"
                >
                  <FontAwesomeIcon icon={faFilter} />
                  <span>Filters</span>
                  <FontAwesomeIcon icon={faChevronDown} className={`transform transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'category')}
                    className="appearance-none bg-white/10 border border-white/20 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-gradient-primary/50 cursor-pointer"
                  >
                    <option value="date" className="bg-main-dark text-white">Latest First</option>
                    <option value="title" className="bg-main-dark text-white">A-Z</option>
                    <option value="category" className="bg-main-dark text-white">Category</option>
                  </select>
                  <FontAwesomeIcon icon={faChevronDown} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center justify-center w-8 h-8 rounded-md transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-gradient-primary text-black' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FontAwesomeIcon icon={faGripVertical} className="text-sm" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center justify-center w-8 h-8 rounded-md transition-all ${
                    viewMode === 'list' 
                      ? 'bg-gradient-primary text-black' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FontAwesomeIcon icon={faList} className="text-sm" />
                </button>
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <AnimatePresence>
            <motion.div
              className={`${isFilterOpen ? 'block' : 'hidden'} sm:block`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {categories.map((category) => (
                  <motion.button
                    key={category}
                    onClick={() => handleCategoryFilter(category)}
                    className={`px-3 sm:px-4 py-2 rounded-full font-medium transition-all duration-300 text-sm sm:text-base ${
                      selectedCategory === category
                        ? 'bg-main-gradient text-black shadow-lg'
                        : 'bg-white/10 backdrop-blur-sm text-gray-300 hover:bg-white/20 hover:text-white border border-white/10'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Enhanced Articles Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredPosts.map((post, index) => (
                <motion.article
                  key={post.slug}
                  className="group cursor-pointer h-full"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className="glass rounded-xl overflow-hidden h-full hover-glow transition-all duration-500">
                      {/* Image */}
                      <div className="relative h-48 sm:h-52 overflow-hidden">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                        
                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                          <span className="px-2 sm:px-3 py-1 text-xs bg-main-gradient text-black rounded-full font-semibold shadow-lg">
                            {post.category}
                          </span>
                        </div>

                        {/* Read Time Badge */}
                        {post.readTime && (
                          <div className="absolute top-4 right-4">
                            <span className="px-2 sm:px-3 py-1 text-xs bg-black/50 backdrop-blur-sm text-white rounded-full">
                              <FontAwesomeIcon icon={faClock} className="mr-1" />
                              {post.readTime}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 sm:p-6">
                        <div className="flex items-center text-xs sm:text-sm text-gray-400 mb-3">
                          <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gradient-primary" />
                          <span>{post.date}</span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold mb-3 group-hover:text-gradient-primary transition-colors duration-400 line-clamp-2">
                          {post.title}
                        </h3>

                        <p className="text-gray-300 leading-relaxed mb-4 text-sm line-clamp-3">
                          {post.excerpt}
                        </p>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
                            {post.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-white/10 text-gray-400 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                            {post.tags.length > 2 && (
                              <span className="px-2 py-1 bg-white/10 text-gray-400 rounded text-xs">
                                +{post.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-gradient-primary font-semibold group-hover:text-gradient-tertiary transition-colors duration-300 flex items-center gap-2 text-sm">
                            Read More
                            <FontAwesomeIcon icon={faArrowRight} className="text-sm group-hover:translate-x-1 transition-transform duration-300" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4 sm:space-y-6">
              {filteredPosts.map((post, index) => (
                <motion.article
                  key={post.slug}
                  className="group cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ x: 8 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className="glass rounded-xl overflow-hidden hover-glow transition-all duration-500">
                      <div className="flex flex-col sm:flex-row">
                        {/* Image */}
                        <div className="relative w-full sm:w-48 h-48 sm:h-32 flex-shrink-0 overflow-hidden">
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                            sizes="(max-width: 768px) 100vw, 200px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/60 to-transparent" />
                          
                          {/* Category Badge */}
                          <div className="absolute top-3 left-3">
                            <span className="px-2 py-1 text-xs bg-main-gradient text-black rounded-full font-semibold">
                              {post.category}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4 sm:p-6">
                          <div className="flex items-center text-xs sm:text-sm text-gray-400 mb-2">
                            <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gradient-primary" />
                            <span>{post.date}</span>
                            {post.readTime && (
                              <>
                                <span className="mx-2">•</span>
                                <FontAwesomeIcon icon={faClock} className="mr-2 text-gradient-primary" />
                                <span>{post.readTime}</span>
                              </>
                            )}
                          </div>

                          <h3 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-gradient-primary transition-colors duration-400 line-clamp-2">
                            {post.title}
                          </h3>

                          <p className="text-gray-300 leading-relaxed mb-3 text-sm line-clamp-2 sm:line-clamp-3">
                            {post.excerpt}
                          </p>

                          {/* Tags and Read More */}
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                              {post.tags && post.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-white/10 text-gray-400 rounded text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            
                            <span className="text-gradient-primary font-semibold group-hover:text-gradient-tertiary transition-colors duration-300 flex items-center gap-2 text-sm">
                              Read More
                              <FontAwesomeIcon icon={faArrowRight} className="text-sm group-hover:translate-x-1 transition-transform duration-300" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </motion.div>

        {/* No Results */}
        {filteredPosts.length === 0 && (
          <motion.div
            className="text-center py-16 sm:py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-4xl sm:text-6xl mb-4">📝</div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-300 mb-4">No articles found</h3>
            <p className="text-gray-400 mb-6 sm:mb-8 px-4">Try adjusting your search terms or filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setFilteredPosts(blogPosts);
                setIsFilterOpen(false);
              }}
              className="px-6 py-3 bg-main-gradient text-black font-semibold rounded-full hover:shadow-lg hover:shadow-gradient-primary-rgb/25 transition-all duration-300"
            >
              Show All Articles
            </button>
          </motion.div>
        )}

        {/* Scroll to Top Button - Mobile Friendly */}
        <motion.button
          className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-main-gradient text-black rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FontAwesomeIcon icon={faArrowRight} className="rotate-[-90deg] text-sm" />
        </motion.button>

        {/* Mobile Bottom Spacing */}
        <div className="h-20 sm:h-12" />
      </main>
    </div>
  );
};

export default BlogListPage;
