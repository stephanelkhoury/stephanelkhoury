'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { 
  faEnvelope, 
  faPhone, 
  faPaperPlane,
  faLocationDot 
} from '@fortawesome/free-solid-svg-icons';
import { 
  faLinkedin, 
  faGithub, 
  faWhatsapp, 
  faTelegram, 
  faInstagram, 
  faFacebook, 
  faXTwitter 
} from '@fortawesome/free-brands-svg-icons';
import { AnimatedSection, ScrollReveal, TextReveal } from './animations';

const Contact: React.FC = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
      
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }, 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section id="contact" className="py-20 px-6 md:px-20 relative overflow-hidden">
      
      <AnimatedSection>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <TextReveal 
              text="Let&apos;s Create Something Amazing Together"
              className="text-4xl font-bold mb-6"
            />
            <ScrollReveal delay={0.3}>
              <p className="text-gray-300 text-xl leading-relaxed max-w-3xl mx-auto">
                Ready to bring your vision to life? Whether it&apos;s a cutting-edge web application, 
                innovative music tech, or strategic digital transformation, let&apos;s collaborate.
              </p>
            </ScrollReveal>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-12 items-start">
            {/* Contact Information - Full Width */}
            <ScrollReveal direction="left" delay={0.2}>
              <div className="lg:col-span-2 space-y-8">
                <motion.div
                  className="glass p-8 rounded-2xl hover-glow magnetic"
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.h3 
                    className="text-2xl font-bold mb-6 "
                    whileHover={{ scale: 1.05 }}
                  >
                    Get In Touch
                  </motion.h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <ContactInfo 
                      icon={faEnvelope}
                      label="Email"
                      value="stephanelkhoury2000@gmail.com"
                      href="mailto:stephanelkhoury2000@gmail.com"
                      delay={0.1}
                    />
                    <ContactInfo 
                      icon={faPhone}
                      label="Phone"
                      value="+961391906"
                      href="tel:+961391906"
                      delay={0.2}
                    />
                    <ContactInfo 
                      icon={faLocationDot}
                      label="Location"
                      value="Lebanon / Remote Worldwide"
                      delay={0.3}
                    />
                  </div>
                </motion.div>

                {/* Social Media - Full Width */}
                <motion.div
                  className="glass p-8 rounded-2xl hover-glow"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.h3 
                    className="text-xl font-semibold mb-6 text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    Connect With Me
                  </motion.h3>
                  
                  <div className="flex flex-wrap justify-center gap-4">
                    <SocialLink href="https://www.linkedin.com/in/stephanelkhoury/" icon={faLinkedin} color="#0077B5" delay={0.1} />
                    <SocialLink href="https://github.com/stephanelkhoury" icon={faGithub} color="#333" delay={0.2} />
                    <SocialLink href="https://wa.me/961391906" icon={faWhatsapp} color="#25D366" delay={0.3} />
                    <SocialLink href="https://t.me/stephanelkhoury" icon={faTelegram} color="#0088cc" delay={0.4} />
                    <SocialLink href="https://instagram.com/stephanelkhoury" icon={faInstagram} color="#E4405F" delay={0.5} />
                    <SocialLink href="https://facebook.com/stephanelkhoury" icon={faFacebook} color="#1877F2" delay={0.6} />
                    <SocialLink href="https://x.com/stephanelkhoury" icon={faXTwitter} color="#000000" delay={0.7} />
                  </div>
                </motion.div>
              </div>
            </ScrollReveal>

            {/* Contact Form */}
            <ScrollReveal direction="right" delay={0.4}>
              <motion.div
                className="glass p-8 rounded-2xl hover-glow"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.h3 
                  className="text-2xl font-bold mb-8 text-center "
                  whileHover={{ scale: 1.05 }}
                >
                  Send Me a Message
                </motion.h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1, duration: 0.5 }}
                    >
                      <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 hover-lift"
                        required
                      />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <input
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 hover-lift"
                        required
                      />
                    </motion.div>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <textarea
                      name="message"
                      placeholder="Tell me about your project..."
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 resize-none hover-lift"
                      required
                    />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full group relative px-8 py-4 bg-gradient-to-r from-[#3b82f6] to-[#10b981] text-black font-bold rounded-xl hover-glow magnetic liquid-bg overflow-hidden"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.span
                        className="relative z-10 flex items-center justify-center gap-3"
                        animate={{ 
                          opacity: isSubmitting ? 0.7 : 1,
                          x: isSubmitting ? -10 : 0 
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                            />
                            Sending...
                          </>
                        ) : submitStatus === 'success' ? (
                          <>
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-5 h-5 text-green-600"
                            >
                              ✓
                            </motion.div>
                            Message Sent!
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faPaperPlane} />
                            Send Message
                          </>
                        )}
                      </motion.span>
                      
                      {/* Button shine effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                      />
                    </motion.button>
                  </motion.div>
                </form>
              </motion.div>
            </ScrollReveal>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
};

const ContactInfo: React.FC<{
  icon: IconDefinition;
  label: string;
  value: string;
  href?: string;
  delay: number;
}> = ({ icon, label, value, href, delay }) => (
  <motion.div
    className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ x: 5, scale: 1.02 }}
  >
    <motion.div
      className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-[#3b82f6] to-[#10b981] text-black"
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ duration: 0.3 }}
    >
      <FontAwesomeIcon icon={icon} className="text-lg" />
    </motion.div>
    <div className="flex-1">
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      {href ? (
        <motion.a
          href={href}
          className="text-white font-medium hover:text-[#3b82f6] transition-colors duration-300"
          whileHover={{ scale: 1.02 }}
        >
          {value}
        </motion.a>
      ) : (
        <p className="text-white font-medium">{value}</p>
      )}
    </div>
  </motion.div>
);

const SocialLink: React.FC<{ 
  href: string; 
  icon: IconDefinition; 
  color: string;
  delay: number;
}> = ({ href, icon, color, delay }) => (
  <motion.a
    href={href}
    target={href.startsWith('mailto:') || href.startsWith('tel:') ? '_self' : '_blank'}
    rel={href.startsWith('mailto:') || href.startsWith('tel:') ? undefined : 'noopener noreferrer'}
    className="group relative w-14 h-14 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 magnetic hover-glow overflow-hidden"
    initial={{ opacity: 0, scale: 0, rotate: -180 }}
    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
    transition={{ delay, duration: 0.5, type: "spring" }}
    whileHover={{ y: -5, scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
  >
    <motion.div
      className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
      style={{ backgroundColor: color }}
    />
    <FontAwesomeIcon 
      icon={icon} 
      className="text-xl z-10 group-hover:scale-110 transition-transform duration-300" 
      style={{ color: 'white' }}
    />
    
    {/* Hover ripple effect */}
    <motion.div
      className="absolute inset-0 rounded-xl"
      style={{ backgroundColor: color }}
      initial={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.5, opacity: 0.1 }}
      transition={{ duration: 0.3 }}
    />
  </motion.a>
);

export default Contact;
