'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, PanInfo } from 'framer-motion';
import { AnimatedSection, TextReveal } from './animations';

interface Experience {
  id: number;
  title: string;
  company: string;
  period: string;
  location: string;
  description: string[];
  technologies: string[];
  icon: string;
  color: string;
}

const experiences: Experience[] = [
  {
    id: 1,
    title: 'Manager - Graphic Design',
    company: 'Aplus - ARCH Blat - GA Print Solutions',
    period: 'Jan 2018 - Dec 2021',
    location: 'Lebanon',
    description: [
      'Managed printing solutions across plotters, printers, and laser machines',
      'Handled server maintenance for three copy centers',
      'Mastered Adobe Suite: Photoshop, Illustrator, InDesign, and Dimensions',
    ],
    technologies: ['Adobe Suite', 'Print Design', 'Server Management', 'Team Leadership'],
    icon: '🎨',
    color: '#f97316',
  },
  {
    id: 2,
    title: 'Multimedia Developer - Web & Ebook Creator',
    company: 'Sayegh 1944',
    period: 'Mar 2020 - Oct 2021',
    location: 'Lebanon',
    description: [
      'Developed eBooks and interactive content using HTML, CSS, JavaScript',
      'Utilized internal tools to digitize soft copy books efficiently',
      'Created automated solutions to streamline repetitive tasks for the team',
    ],
    technologies: ['HTML', 'CSS', 'JavaScript', 'eBooks', 'Automation'],
    icon: '📚',
    color: '#8b5cf6',
  },
  {
    id: 3,
    title: 'Multimedia Developer - UX/UI & Web Developer',
    company: 'InnovatorsGate',
    period: 'Oct 2021 - Nov 2023',
    location: 'Remote',
    description: [
      'Designed the platform UX/UI using Figma for the TechStans project',
      'Developed on WordPress with a focus on functionality & design',
      'Led a team of two developers to ensure project success',
    ],
    technologies: ['Figma', 'WordPress', 'UX/UI Design', 'Team Leadership'],
    icon: '💡',
    color: '#06b6d4',
  },
  {
    id: 4,
    title: 'Full Stack Developer',
    company: 'Firma Events',
    period: 'Nov 2023 - Apr 2024',
    location: 'Qatar',
    description: [
      'Developed and launched a modern event management website for Qatar market',
      'Implemented SEO strategies resulting in first-page rankings for key event industry terms',
      'Built responsive UI with modern animations and cross-browser compatibility',
      'Completed 6-month contract delivering all project objectives on schedule',
    ],
    technologies: ['Next.js', 'TypeScript', 'TailwindCSS', 'SEO', 'Responsive Design'],
    icon: '🎪',
    color: '#10b981',
  },
  {
    id: 5,
    title: 'Front-End Developer & QA Engineer',
    company: 'WPP - Ogilvy',
    period: 'Sep 2023 - Present',
    location: 'Lebanon',
    description: [
      'Build and maintain enterprise CMS platforms (Sitecore, Sitefinity) for Fortune 500 clients',
      'Lead QA testing initiatives with comprehensive Lighthouse audits and performance optimization',
      'Architect SEO strategies and accessibility improvements across global web applications',
      'Develop interactive advertising campaigns using Google Web Designer for major brands',
      'Collaborate with cross-functional teams in an agile environment on high-impact projects',
    ],
    technologies: ['Sitecore', 'Sitefinity', 'React', 'Google Web Designer', 'QA/Testing', 'SEO', 'GitHub'],
    icon: '🚀',
    color: '#3b82f6',
  },
];

const Experience: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(experiences.length - 1); // Start at current role
  const [direction, setDirection] = useState(0);
  const dragX = useMotionValue(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction > 0 ? 45 : -45,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.8,
      rotateY: direction < 0 ? 45 : -45,
      transition: { duration: 0.3 },
    }),
  };

  const paginate = useCallback((newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      const next = prev + newDirection;
      if (next < 0) return experiences.length - 1;
      if (next >= experiences.length) return 0;
      return next;
    });
  }, []);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold) {
      paginate(-1);
    } else if (info.offset.x < -swipeThreshold) {
      paginate(1);
    }
  };

  const goToIndex = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const currentExp = experiences[currentIndex];

  return (
    <section id="experience" className="py-20 px-6 md:px-20 bg-[#0B001F]/30 relative overflow-hidden min-h-screen">
      
      <AnimatedSection>
        <TextReveal 
          text="Career Journey"
          className="text-4xl md:text-5xl font-bold mb-4 text-center"
        />
        <p className="text-gray-400 text-center mb-8 max-w-2xl mx-auto">
          Swipe or use arrows to explore my professional path
        </p>

        {/* Timeline Navigation */}
        <div className="relative mb-12 px-4">
          <div className="flex items-center justify-center gap-2 md:gap-4 max-w-4xl mx-auto">
            {experiences.map((exp, index) => (
              <motion.button
                key={exp.id}
                onClick={() => goToIndex(index)}
                className="relative group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Connection Line */}
                {index < experiences.length - 1 && (
                  <div 
                    className={`absolute top-1/2 left-full w-2 md:w-4 h-0.5 transition-colors duration-300 ${
                      index < currentIndex ? 'bg-gradient-to-r from-[#3b82f6] to-[#10b981]' : 'bg-gray-700'
                    }`}
                  />
                )}
                
                {/* Timeline Node */}
                <motion.div
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-xl md:text-2xl transition-all duration-300 ${
                    index === currentIndex 
                      ? 'ring-4 ring-offset-2 ring-offset-[#0a0f1a] shadow-lg' 
                      : index < currentIndex 
                        ? 'opacity-80' 
                        : 'opacity-40'
                  }`}
                  style={{ 
                    backgroundColor: index <= currentIndex ? exp.color : '#374151',
                    ['--tw-ring-color' as string]: index === currentIndex ? exp.color : 'transparent',
                  }}
                  animate={index === currentIndex ? { 
                    boxShadow: [`0 0 20px ${exp.color}50`, `0 0 40px ${exp.color}30`, `0 0 20px ${exp.color}50`]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {exp.icon}
                </motion.div>
                
                {/* Year Label */}
                <motion.span 
                  className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap transition-opacity duration-300 ${
                    index === currentIndex ? 'text-white opacity-100' : 'text-gray-500 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {exp.period.split(' - ')[0]}
                </motion.span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Main Card Container */}
        <div className="relative max-w-4xl mx-auto h-[500px] md:h-[450px] perspective-1000">
          {/* Navigation Arrows */}
          <motion.button
            onClick={() => paginate(-1)}
            className="absolute left-0 md:-left-16 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
          
          <motion.button
            onClick={() => paginate(1)}
            className="absolute right-0 md:-right-16 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.1, x: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>

          {/* Experience Card */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              style={{ x: dragX }}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
            >
              <motion.div 
                className="h-full rounded-2xl p-6 md:p-8 backdrop-blur-xl border border-white/10 overflow-hidden"
                style={{ 
                  background: `linear-gradient(135deg, ${currentExp.color}20 0%, transparent 50%, ${currentExp.color}10 100%)`,
                }}
              >
                {/* Current Badge */}
                {currentIndex === experiences.length - 1 && (
                  <motion.div 
                    className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold"
                    style={{ backgroundColor: currentExp.color }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    CURRENT
                  </motion.div>
                )}

                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <motion.div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                    style={{ backgroundColor: `${currentExp.color}30` }}
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    {currentExp.icon}
                  </motion.div>
                  <div className="flex-1">
                    <motion.h3 
                      className="text-xl md:text-2xl font-bold text-white mb-1"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {currentExp.title}
                    </motion.h3>
                    <motion.p 
                      className="text-lg font-semibold"
                      style={{ color: currentExp.color }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {currentExp.company}
                    </motion.p>
                    <motion.div 
                      className="flex items-center gap-4 text-gray-400 text-sm mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {currentExp.period}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {currentExp.location}
                      </span>
                    </motion.div>
                  </div>
                </div>

                {/* Description */}
                <motion.ul 
                  className="space-y-3 mb-6 text-gray-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {currentExp.description.map((item, i) => (
                    <motion.li 
                      key={i}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    >
                      <span 
                        className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                        style={{ backgroundColor: currentExp.color }}
                      />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </motion.ul>

                {/* Technologies */}
                <motion.div 
                  className="flex flex-wrap gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  {currentExp.technologies.map((tech, i) => (
                    <motion.span
                      key={tech}
                      className="px-3 py-1 text-sm rounded-full border"
                      style={{ 
                        backgroundColor: `${currentExp.color}20`,
                        borderColor: `${currentExp.color}40`,
                        color: currentExp.color,
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + i * 0.05 }}
                      whileHover={{ scale: 1.1, backgroundColor: `${currentExp.color}40` }}
                    >
                      {tech}
                    </motion.span>
                  ))}
                </motion.div>

                {/* Swipe Hint */}
                <motion.div 
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-500 text-sm flex items-center gap-2"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  Swipe to explore
                </motion.div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mt-8 gap-2">
          {experiences.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => goToIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'w-8' : 'w-2'
              }`}
              style={{ 
                backgroundColor: index === currentIndex ? currentExp.color : '#374151',
              }}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-gray-400 mb-4">Ready to add your project to my journey?</p>
          <motion.a
            href="#contact"
            className="inline-block px-8 py-3 bg-gradient-to-r from-[#3b82f6] to-[#10b981] text-black font-semibold rounded-full"
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(59,130,246,0.5)' }}
            whileTap={{ scale: 0.95 }}
          >
            Let&apos;s Work Together
          </motion.a>
        </motion.div>
      </AnimatedSection>
    </section>
  );
};

export default Experience;
