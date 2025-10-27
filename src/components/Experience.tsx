'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedSection, ScrollReveal, TextReveal } from './animations';

interface Experience {
  title: string;
  company: string;
  period: string;
  description: string[];
  technologies: string[];
}

const experiences: Experience[] = [
  {
    title: 'Founder & Lead Developer',
    company: 'Multigraphic.lb',
    period: '2020 - Present',
    description: [
      'Founded and scaled a creative studio delivering full-stack web development and branding solutions',
      'Led 20+ client projects including WordPress, Shopify, and React-based applications',
      'Developed comprehensive digital strategies for startups and established businesses',
      'Built custom CMS solutions with ACF Pro, event management systems, and e-commerce platforms',
      'Created complete branding packages including business identity and UX/UI design systems',
    ],
    technologies: ['React', 'WordPress', 'Shopify', 'Next.js', 'TailwindCSS', 'ACF Pro', 'WooCommerce'],
  },
  {
    title: 'Front-End Developer & QA Engineer',
    company: 'WPP - Ogilvy',
    period: 'Sep 2023 - Present',
    description: [
      'Develop and maintain large-scale CMS platforms (Sitecore, Sitefinity) for major clients',
      'Conduct comprehensive QA testing, performance analysis, and Lighthouse audits',
      'Implement SEO optimizations and accessibility fixes across enterprise applications',
      'Manage GitHub projects with detailed markdown documentation and issue tracking',
      'Create advertising campaigns using Google Web Designer and full-stack web applications',
    ],
    technologies: ['Sitecore', 'Sitefinity', 'Google Web Designer', 'QA Testing', 'SEO', 'GitHub'],
  },
  {
    title: 'Multimedia Developer - Full Stack Developer',
    company: 'Firma Events, Qatar',
    period: 'Nov 2023 - Apr 2024',
    description: [
      'Developed and launched a modern event management website for Qatar market',
      'Implemented SEO strategies resulting in first-page rankings for key event industry terms',
      'Built responsive UI with modern animations and cross-browser compatibility',
      'Completed 6-month contract delivering all project objectives on schedule',
    ],
    technologies: ['Next.js', 'TypeScript', 'TailwindCSS', 'SEO', 'Responsive Design', 'UI/UX'],
  },
  {
    title: 'Oriental Keyboard Instructor',
    company: 'Music School & Private Lessons',
    period: 'Jan 2018 - Present',
    description: [
      'Teach oriental keyboard techniques including maqamat and occidental/oriental styles',
      'Conduct 30-45 minute sessions covering arpeggios and ear-training for chord recognition',
      'Perform regularly at high-end venues including Kempinski Hotel Qatar',
      'Accompany professional singers with extensive Arabic and Western repertoire',
    ],
    technologies: ['Music Theory', 'Performance', 'Teaching', 'Audio Production'],
  },
  {
    title: 'Multimedia Developer - UX/UI and Web Developer',
    company: 'InnovatorsGate',
    period: 'Oct 2021 - Nov 2023',
    description: [
      'Designed the platform UX/UI using Figma for the TechStans project',
      'Developed on WordPress with a focus on functionality & design',
      'Led a team of two developers to ensure project success',
    ],
    technologies: ['Figma', 'WordPress', 'UX/UI Design', 'Team Leadership'],
  },
  {
    title: 'Multimedia Developer - Web Developer - Ebook Creator',
    company: 'Sayegh 1944',
    period: 'Mar 2020 - Oct 2021',
    description: [
      'Developed eBooks and interactive content using HTML, CSS, JavaScript',
      'Utilized internal tools to digitize soft copy books efficiently',
      'Created automated solutions to streamline repetitive tasks for the team',
    ],
    technologies: ['HTML', 'CSS', 'JavaScript', 'eBooks', 'Automation'],
  },
  {
    title: 'Manager - Graphic Design',
    company: 'Aplus - ARCH Blat - GA Print Solutions',
    period: 'Jan 2018 - Dec 2021',
    description: [
      'Managed printing solutions across plotters, printers, and laser machines',
      'Handled server maintenance for three copy centers',
      'Mastered Adobe Suite: Photoshop, Illustrator, InDesign, and Dimensions',
    ],
    technologies: ['Adobe Suite', 'Print Design', 'Server Management', 'Team Leadership'],
  }
];

const Experience: React.FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  return (
    <section id="experience" className="py-20 px-6 md:px-20 bg-main-dark/30 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-primary-rgb/20 rounded-full blur-3xl floating" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-tertiary-rgb/15 rounded-full blur-3xl floating" style={{ animationDelay: '2s' }} />
      </div>
      
      <AnimatedSection>
        <TextReveal 
          text="Experience & Journey"
          className="text-4xl font-bold mb-4 text-center"
        />
        <ScrollReveal delay={0.3}>
          <p className="text-gray-300 text-center mb-16 max-w-2xl mx-auto">
            From creative studio founder to enterprise developer, my journey spans across technologies and industries
          </p>
        </ScrollReveal>
        
        <div ref={containerRef} className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-main-gradient transform md:-translate-x-px" />
          
          <div className="space-y-16">
            {experiences.map((exp, index) => (
              <ScrollReveal key={index} delay={index * 0.2} direction={index % 2 === 0 ? 'left' : 'right'}>
                <motion.div
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  } flex-col md:gap-16`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Timeline Dot */}
                  <motion.div 
                    className="absolute left-4 md:left-1/2 w-4 h-4 bg-main-gradient rounded-full transform -translate-x-2 md:-translate-x-2 z-10 pulse"
                    whileHover={{ scale: 1.5 }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Content Card */}
                  <motion.div 
                    className={`md:w-5/12 ml-8 md:ml-0 glass p-6 rounded-xl hover-glow magnetic ${
                      index % 2 === 0 ? 'md:text-right' : 'md:text-left'
                    }`}
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <motion.h3 
                        className="text-2xl font-bold mb-2  hover-lift"
                        whileHover={{ scale: 1.05 }}
                      >
                        {exp.title}
                      </motion.h3>
                      <motion.p 
                        className="text-gradient-primary font-semibold mb-1 text-lg"
                        whileHover={{ color: 'var(--gradient-tertiary)' }}
                        transition={{ duration: 0.3 }}
                      >
                        {exp.company}
                      </motion.p>
                      <p className="text-gray-400 mb-4 font-medium shimmer">{exp.period}</p>
                      
                      <motion.ul 
                        className={`space-y-2 text-gray-300 mb-6 ${
                          index % 2 === 0 ? 'md:text-right' : 'md:text-left'
                        }`}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.5, staggerChildren: 0.1 }}
                      >
                        {exp.description.map((item, i) => (
                          <motion.li 
                            key={i} 
                            className="relative pl-4 border-l-2 border-gradient-primary-rgb/30 hover:border-gradient-primary transition-colors duration-300"
                            initial={{ opacity: 0, x: index % 2 === 0 ? 20 : -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ x: index % 2 === 0 ? -5 : 5 }}
                          >
                            {item}
                          </motion.li>
                        ))}
                      </motion.ul>
                      
                      <div className={`flex flex-wrap gap-2 ${
                        index % 2 === 0 ? 'md:justify-end' : 'md:justify-start'
                      }`}>
                        {exp.technologies.map((tech, i) => (
                          <motion.span
                            key={i}
                            className="px-3 py-1 text-sm bg-gradient-to-r from-gradient-primary-rgb/20 to-gradient-tertiary-rgb/20 border border-white/10 rounded-full hover-lift magnetic liquid-bg"
                            whileHover={{ 
                              scale: 1.1, 
                              backgroundColor: 'rgba(0, 225, 255, 0.3)',
                              borderColor: 'rgba(0, 225, 255, 0.5)'
                            }}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.7 + i * 0.05, duration: 0.3 }}
                          >
                            {tech}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                  
                  {/* Spacer for the other side */}
                  <div className="hidden md:block md:w-5/12" />
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
        
        {/* Call to Action */}
        <ScrollReveal delay={0.5}>
          <motion.div 
            className="text-center mt-16"
            whileHover={{ scale: 1.02 }}
          >
            <motion.p 
              className="text-gray-300 mb-6 text-lg"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Ready to bring your next project to life?
            </motion.p>
            <motion.a
              href="#contact"
              className="inline-block px-8 py-3 bg-main-gradient text-black font-semibold rounded-full hover-glow magnetic liquid-bg"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Let&apos;s Work Together
            </motion.a>
          </motion.div>
        </ScrollReveal>
      </AnimatedSection>
    </section>
  );
};

export default Experience;
