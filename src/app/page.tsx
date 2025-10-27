'use client';

import React, { useEffect, useRef } from 'react';
import { AnimatedButton, TextReveal, ScrollReveal } from '@/components/animations';
import Navbar from '@/components/Navbar';
import About from '@/components/About';
import Projects from '@/components/Projects';
import Experience from '@/components/Experience';
import Blog from '@/components/Blog';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const parallaxRef = useRef(null);

  useEffect(() => {
    if (parallaxRef.current) {
      gsap.to(parallaxRef.current, {
        yPercent: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: parallaxRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section
          ref={parallaxRef}
          className="relative flex flex-col items-center justify-center min-h-screen px-6 overflow-hidden"
        >
          {/* Logo Animation */}
          {/* <ScrollReveal direction="up" delay={0.2}>
            <motion.div
              className="relative mb-8"
              whileHover={{ 
                scale: 1.1,
                filter: 'blur(2px) brightness(1.1)'
              }}
              transition={{
                duration: 0.3,
                ease: "easeInOut"
              }}
            >
              <Image
                src="/logo-multigraphic.lb.png"
                alt="Multigraphic.lb Logo"
                width={160}
                height={160}
                className="w-40 h-40"
                priority
              />
            </motion.div>
          </ScrollReveal> */}

          {/* Name and Title with Text Reveal */}
          <TextReveal
            text="Stephan El Khoury"
            className="text-4xl md:text-6xl font-bold mb-4"
            delay={0.5}
            staggerDelay={0.1}
          />

          <ScrollReveal direction="up" delay={0.8}>
            <h2 className="text-xl md:text-2xl text-gray-300 mb-2">
              Computer Engineer | Full Stack Developer | Musician
            </h2>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={1.0}>
            <p className="text-lg text-gray-400 max-w-2xl text-center mb-8">
              Innovating at the intersection of code, creativity, and sound
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={1.2}>
            <AnimatedButton>
              Explore My Work
            </AnimatedButton>
          </ScrollReveal>

          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-radial from-main-dark via-main-dark to-black opacity-50 -z-10" />
        </section>

        <ScrollReveal direction="up">
          <About />
        </ScrollReveal>

        {/* Projects Section */}
        <ScrollReveal direction="left">
          <Projects />
        </ScrollReveal>

        {/* Experience Section */}
        <ScrollReveal direction="right">
          <Experience />
        </ScrollReveal>

        {/* Blog Section */}
        <ScrollReveal direction="up">
          <Blog />
        </ScrollReveal>

        {/* Contact Section */}
        <ScrollReveal direction="up">
          <Contact />
        </ScrollReveal>
      </main>
      <Footer />
    </>
  );
}
