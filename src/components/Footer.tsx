'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { 
  faLinkedin, 
  faGithub, 
  faTwitter 
} from '@fortawesome/free-brands-svg-icons';
import { AnimatedLink } from './animations';

const Footer: React.FC = () => {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);
  return (
    <footer className="bg-main-dark py-12 px-6 md:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">
              <span className="gradient-text">
                Stephan El Khoury
              </span>
            </h3>
            <p className="text-gray-400">
              Computer Engineer, Full Stack Developer, and Musician based in Lebanon.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><AnimatedLink href="#about">About</AnimatedLink></li>
              <li><AnimatedLink href="#projects">Projects</AnimatedLink></li>
              <li><AnimatedLink href="#experience">Experience</AnimatedLink></li>
              <li><AnimatedLink href="#blog">Blog</AnimatedLink></li>
              <li><AnimatedLink href="#contact">Contact</AnimatedLink></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Expertise</h4>
            <ul className="space-y-2">
              <li><AnimatedLink href="#full-stack">Full Stack Development</AnimatedLink></li>
              <li><AnimatedLink href="#cloud">Cloud Architecture</AnimatedLink></li>
              <li><AnimatedLink href="#devops">DevOps & CI/CD</AnimatedLink></li>
              <li><AnimatedLink href="#tech-lead">Technical Leadership</AnimatedLink></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <div className="flex space-x-4">
              <SocialIcon href="https://github.com/stephanelkhoury" icon={faGithub} label="GitHub" />
              <SocialIcon href="https://www.linkedin.com/in/stephanelkhoury/" icon={faLinkedin} label="LinkedIn" />
              <SocialIcon href="https://twitter.com/stephanelkhoury" icon={faTwitter} label="Twitter" />
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-gray-400">
          <p>© {currentYear || '2024'} Stephan El Khoury. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon: React.FC<{ href: string; icon: IconDefinition; label: string }> = ({
  href,
  icon,
  label
}) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ y: -3 }}
    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
    aria-label={label}
  >
    <FontAwesomeIcon icon={icon} className="text-lg" />
  </motion.a>
);

export default Footer;
