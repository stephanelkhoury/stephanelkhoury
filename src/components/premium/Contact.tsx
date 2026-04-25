'use client';

import { motion } from 'framer-motion';
import { Mail, Linkedin, Github, Send, MapPin, Phone } from 'lucide-react';
import type { ContactContent } from './types';

export default function PremiumContact({ content }: { content: ContactContent }) {
  return (
    <section id="contact" className="py-24 bg-white dark:bg-zinc-950 relative border-t border-zinc-200/50 dark:border-zinc-900/50">

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="space-y-12">
            <div>
              <h2 className="text-sm font-semibold text-blue-500 uppercase tracking-widest mb-2">Get in Touch</h2>
              <h3 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight mb-6">
                {content.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-200">exceptional.</span>
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-md">{content.subtitle}</p>
            </div>

            <div className="space-y-6">
              {content.email && (
              <a href={`mailto:${content.email}`} className="flex items-center gap-4 text-zinc-700 dark:text-zinc-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors group">
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 group-hover:border-blue-500/50 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-all">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-600 dark:text-zinc-500">Email Me</h4>
                  <p className="font-medium text-lg">{content.email}</p>
                </div>
              </a>
              )}

              {content.phone && (
                <a href={`tel:${content.phone}`} className="flex items-center gap-4 text-zinc-700 dark:text-zinc-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 group-hover:border-blue-500/50 flex items-center justify-center text-zinc-500 dark:text-zinc-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-all">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-zinc-600 dark:text-zinc-500">Phone</h4>
                    <p className="font-medium text-lg">{content.phone}</p>
                  </div>
                </a>
              )}

              <div className="flex items-center gap-4 text-zinc-700 dark:text-zinc-300">
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-600 dark:text-zinc-500">Location</h4>
                  <p className="font-medium text-lg">{content.location}</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-zinc-300 dark:border-zinc-800">
              <h4 className="text-sm font-medium text-zinc-600 dark:text-zinc-500 mb-6">Connect across platforms</h4>
              <div className="flex gap-4">
                <a href={content.linkedin || '#'} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 hover:border-blue-500 hover:bg-blue-600/10 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href={content.github || '#'} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 hover:border-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="bg-zinc-100/70 dark:bg-zinc-900/50 border border-zinc-300/80 dark:border-zinc-800/80 p-8 md:p-10 rounded-3xl backdrop-blur-sm">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Full Name</label>
                  <input id="name" className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Email Address</label>
                  <input id="email" type="email" className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500" placeholder="john@example.com" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Subject</label>
                <input id="subject" className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500" placeholder="Project Inquiry" />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Message</label>
                <textarea id="message" rows={6} className="w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 resize-none" placeholder="Tell me about your project, goals, or technical needs..." />
              </div>

              <button type="button" className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all">
                Send Message
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
