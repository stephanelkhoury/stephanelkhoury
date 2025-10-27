'use client';

import React, { use, useState } from 'react';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faClock, 
  faTag, 
  faUser, 
  faArrowLeft,
  faBookmark,
  faLink
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost, getBlogPostBySlug } from '../../../data/blogPosts';
import ShareButton from '@/components/ShareButton';

interface BlogPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const BlogPage: React.FC<BlogPageProps> = ({ params }) => {
  const { slug } = use(params);
  const post = getBlogPostBySlug(slug);
  const [isShared, setIsShared] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!post) {
    notFound();
  }

  // Share functionality
  const handleShare = async () => {
    const shareData = {
      title: post.title,
      text: post.excerpt,
      url: window.location.href,
    };

    try {
      // Check if native sharing is supported (mobile devices)
      if (navigator.share) {
        await navigator.share(shareData);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      }
    } catch (error) {
      // Fallback: Manual copy
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setIsShared(true);
      setTimeout(() => setIsShared(false), 2000);
    }
  };

  // Save functionality (localStorage)
  const handleSave = () => {
    const savedPosts = JSON.parse(localStorage.getItem('savedBlogPosts') || '[]');
    const isCurrentlySaved = savedPosts.includes(slug);
    
    if (isCurrentlySaved) {
      // Remove from saved
      const updatedPosts = savedPosts.filter((savedSlug: string) => savedSlug !== slug);
      localStorage.setItem('savedBlogPosts', JSON.stringify(updatedPosts));
      setIsSaved(false);
    } else {
      // Add to saved
      savedPosts.push(slug);
      localStorage.setItem('savedBlogPosts', JSON.stringify(savedPosts));
      setIsSaved(true);
    }
  };

  // Check if post is already saved on component mount
  React.useEffect(() => {
    const savedPosts = JSON.parse(localStorage.getItem('savedBlogPosts') || '[]');
    setIsSaved(savedPosts.includes(slug));
  }, [slug]);

  const formatContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => {
      if (paragraph.startsWith('##')) {
        return (
          <motion.h2
            key={index}
            className="text-2xl font-bold text-gradient-primary mt-8 mb-4"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {paragraph.replace('## ', '')}
          </motion.h2>
        );
      }
      
      if (paragraph.startsWith('1.') || paragraph.startsWith('2.') || paragraph.startsWith('3.')) {
        const items = paragraph.split('\n').filter(item => item.match(/^\d+\./));
        return (
          <motion.ol
            key={index}
            className="list-decimal list-inside space-y-2 mb-6 ml-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="text-gray-300 leading-relaxed">
                {item.replace(/^\d+\.\s*/, '')}
              </li>
            ))}
          </motion.ol>
        );
      }

      return (
        <motion.p
          key={index}
          className="text-gray-300 leading-relaxed mb-6 text-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {paragraph}
        </motion.p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-main-dark via-main-dark-secondary to-main-dark relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-32 right-20 w-64 h-64 bg-gradient-secondary/20 rounded-full blur-3xl floating" />
        <div className="absolute bottom-40 left-16 w-80 h-80 bg-gradient-primary/15 rounded-full blur-3xl floating" style={{ animationDelay: '3s' }} />
      </div>

      {/* Header */}
      <motion.header
        className="sticky top-0 z-50 backdrop-blur-lg bg-main-dark/80 border-b border-white/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-6 py-4">
          <Link href="/#blog" className="inline-flex items-center gap-3 text-gradient-primary hover-text-gradient-tertiary transition-colors duration-300">
            <FontAwesomeIcon icon={faArrowLeft} />
            <span className="font-semibold">Back to Blog</span>
          </Link>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 relative z-10">
        {/* Hero Section */}
        <motion.div
          className="max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Category Badge */}
          <motion.div
            className="mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <span className="px-4 py-2 text-sm theme-gradient-primary-tertiary text-black rounded-full font-semibold">
              {post.category}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {post.title}
          </motion.h1>

          {/* Meta Information */}
          <motion.div
            className="flex flex-wrap items-center gap-6 text-gray-400 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faUser} className="text-gradient-primary" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-gradient-primary" />
              <span>{post.date}</span>
            </div>
            {post.readTime && (
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} className="text-gradient-primary" />
                <span>{post.readTime}</span>
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <ShareButton
              title={post.title}
              text={post.excerpt}
              url={typeof window !== 'undefined' ? window.location.href : `https://stephanelkhoury.com/blog/${post.slug}`}
              size="md"
            />
            <motion.button
              onClick={handleSave}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                isSaved
                  ? 'theme-gradient-tertiary-secondary text-white'
                  : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
              }`}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <FontAwesomeIcon icon={faBookmark} className="mr-2" />
              {isSaved ? 'Saved' : 'Save'}
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Featured Image */}
        <motion.div
          className="max-w-5xl mx-auto mb-12 rounded-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="relative h-[400px] md:h-[500px] lg:h-[600px]">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        </motion.div>

        {/* Article Content */}
        <motion.article
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          {/* Excerpt */}
          <motion.div
            className="mb-12 p-8 gradient-bg-subtle rounded-2xl backdrop-blur-sm border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xl text-gray-200 leading-relaxed italic">
              {post.excerpt}
            </p>
          </motion.div>

          {/* Content */}
          <div className="prose prose-lg prose-invert max-w-none">
            {post.fullContent ? formatContent(post.fullContent) : (
              <motion.p
                className="text-gray-300 leading-relaxed text-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Full content coming soon...
              </motion.p>
            )}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <motion.div
              className="mt-12 pt-8 border-t border-white/10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={faTag} className="text-gradient-primary" />
                <span className="text-gray-400 font-semibold">Tags:</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {post.tags.map((tag, index) => (
                  <motion.span
                    key={tag}
                    className="px-3 py-1 bg-white/10 backdrop-blur-sm text-gray-300 rounded-full text-sm hover:bg-white/20 transition-colors duration-300 cursor-pointer"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </motion.article>

        {/* Navigation */}
        <motion.div
          className="max-w-4xl mx-auto mt-16 pt-8 border-t border-white/10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center">
            <Link
              href="/#blog"
              className="inline-flex items-center gap-3 px-8 py-4 theme-gradient-primary-tertiary text-black font-bold rounded-full hover:shadow-lg theme-shadow-primary transition-all duration-300 transform hover:scale-105 hover:translate-y-[-2px]"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Back to All Articles
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default BlogPage;