'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedSection, ScrollReveal, TextReveal } from './animations';
import CertificateCarousel from './CertificateCarousel';

const About: React.FC = () => {
  const education = [
    {
      school: 'Antonine University Baabda',
      degree: 'Computer and Telecommunications Faculty of Engineering - Multimedia',
      period: '2017 - 2022',
    },
    {
      school: 'Notre Dames des Appotres',
      degree: 'Lebanese Baccalaureate II - Life Science',
      period: '2002 - 2017',
    },
  ];

  const languages = [
    { name: 'ENGLISH', level: 'B.2.2' },
    { name: 'FRENCH', level: 'DELF B.2.1' },
    { name: 'ARABIC', level: 'NATIVE' },
  ];

  const skills = [
    'HTML', 'CSS', 'JavaScript', 'React', 'PHP', 'Bootstrap',
    'Google Workspace (Docs, Sheets, Drive, Slides)',
    'Microsoft Office Suite',
    'Miro', 'Figma', 'AutoCAD',
    'Adobe (Photoshop, Illustrator, XD, Dimensions)'
  ];

  const certifications = [
    {
      type: 'Cisco Certificates',
      items: [
        'Cisco 1: Introduction to networks',
        'Cisco 2: Routing and Switching Essentials',
        'Cisco 3: Scaling Networks',
        'Cisco 4: Connecting Networks',
      ]
    },
    {
      type: 'Google Certificates',
      items: [
        'The Fundamentals of Digital Marketing',
        'Introduction to Generative AI'
      ]
    }
  ];

  // Certificate data for the carousel
  const certificates = [
    {
      id: '1',
      title: 'AI, Business & the Future of Work',
      organization: 'Lund dream - Coursera',
      type: 'AI & Business',
      filename: 'AI, Business & the Future of Work - Lund dream - Coursera NGNAGY4E0BWW.pdf',
      path: '/Stephan-Certificates/AI, Business & the Future of Work - Lund dream - Coursera NGNAGY4E0BWW.pdf',
      preview: '/certificate-previews/ai-business-lund.svg'
    },
    {
      id: '2',
      title: 'AI, Empathy & Ethics',
      organization: 'UC Santa Cruz - Coursera',
      type: 'AI Ethics',
      filename: 'AI, Empathy & Ethics - US SANTA CRUZ- Coursera 5FUDOMOKQJA2.pdf',
      path: '/Stephan-Certificates/AI, Empathy & Ethics - US SANTA CRUZ- Coursera 5FUDOMOKQJA2.pdf',
      preview: '/certificate-previews/ai-empathy-ethics.svg'
    },
    {
      id: '3',
      title: 'Data Literacy',
      organization: 'dream of Copenhagen - Coursera',
      type: 'Data Science',
      filename: 'Data Literacy - dream of Copehangen - Coursera 3QMWORSEKX28.pdf',
      path: '/Stephan-Certificates/Data Literacy - dream of Copehangen - Coursera 3QMWORSEKX28.pdf',
      preview: '/certificate-previews/data-literacy.svg'
    },
    {
      id: '4',
      title: 'Data Science Ethics',
      organization: 'dream of Michigan - Coursera',
      type: 'Data Science',
      filename: 'Data Science Ethics - dream of Michigan - Coursera YDM5MX379A6D.pdf',
      path: '/Stephan-Certificates/Data Science Ethics - dream of Michigan - Coursera YDM5MX379A6D.pdf',
      preview: '/certificate-previews/data-science-ethics.svg'
    },
    {
      id: '5',
      title: 'Business Implications of AI',
      organization: 'EIT Digital - Coursera',
      type: 'AI & Business',
      filename: 'EIT Digital - Business Implications of AI - Coursera SBI2CT1OEWMV.pdf',
      path: '/Stephan-Certificates/EIT Digital - Business Implications of AI - Coursera SBI2CT1OEWMV.pdf',
      preview: '/certificate-previews/business-implications-ai.svg'
    },
    {
      id: '6',
      title: 'Sustainable Digital Innovation',
      organization: 'EIT Digital - Coursera',
      type: 'Innovation',
      filename: 'EIT Digital - Sustainable Digital Innovation - Coursera KZBNU80Y584P.pdf',
      path: '/Stephan-Certificates/EIT Digital - Sustainable Digital Innovation - Coursera KZBNU80Y584P.pdf',
      preview: '/certificate-previews/sustainable-digital.svg'
    },
    {
      id: '7',
      title: 'Manage a Remote Team',
      organization: 'GitLab - Coursera',
      type: 'Management',
      filename: 'Gitlab - Manage a Remote Team - Coursera 2XUK9VFF7KPH.pdf',
      path: '/Stephan-Certificates/Gitlab - Manage a Remote Team - Coursera 2XUK9VFF7KPH.pdf',
      preview: '/certificate-previews/manage-remote-team.svg'
    },
    {
      id: '8',
      title: 'Introduction to Generative AI',
      organization: 'Google Cloud - Coursera',
      type: 'AI & ML',
      filename: 'Google Cloud- Introduction to Generative AI - Coursera HKDD5LZKHIPT.pdf',
      path: '/Stephan-Certificates/Google Cloud- Introduction to Generative AI - Coursera HKDD5LZKHIPT.pdf',
      preview: '/certificate-previews/intro-generative-ai.svg'
    },
    {
      id: '9',
      title: 'Google Docs',
      organization: 'Google - Coursera',
      type: 'Productivity',
      filename: 'Google Docs - Coursera C69GDTW4LHUA.pdf',
      path: '/Stephan-Certificates/Google Docs - Coursera C69GDTW4LHUA.pdf',
      preview: '/certificate-previews/google-docs.svg'
    },
    {
      id: '10',
      title: 'Google Drive',
      organization: 'Google - Coursera',
      type: 'Productivity',
      filename: 'Google Drive - Coursera LLSF9KU4BE0X.pdf',
      path: '/Stephan-Certificates/Google Drive - Coursera LLSF9KU4BE0X.pdf',
      preview: '/certificate-previews/google-drive.svg'
    },
    {
      id: '11',
      title: 'Google Gmail',
      organization: 'Google - Coursera',
      type: 'Productivity',
      filename: 'Google Gmail - Coursera OSV05GY1OY1K.pdf',
      path: '/Stephan-Certificates/Google Gmail - Coursera OSV05GY1OY1K.pdf',
      preview: '/certificate-previews/google-gmail.svg'
    },
    {
      id: '12',
      title: 'Google Meet',
      organization: 'Google - Coursera',
      type: 'Productivity',
      filename: 'Google Meet - Coursera RB2TKRAIH4WG.pdf',
      path: '/Stephan-Certificates/Google Meet - Coursera RB2TKRAIH4WG.pdf',
      preview: '/certificate-previews/google-meet.svg'
    },
    {
      id: '13',
      title: 'Google Sheets',
      organization: 'Google - Coursera',
      type: 'Productivity',
      filename: 'Google Sheets - Coursera 29HF7UAMYUTA.pdf',
      path: '/Stephan-Certificates/Google Sheets - Coursera 29HF7UAMYUTA.pdf',
      preview: '/certificate-previews/google-sheets.svg'
    },
    {
      id: '14',
      title: 'Google Slides',
      organization: 'Google - Coursera',
      type: 'Productivity',
      filename: 'Google Slides - Coursera VX82B1NUHWVI.pdf',
      path: '/Stephan-Certificates/Google Slides - Coursera VX82B1NUHWVI.pdf',
      preview: '/certificate-previews/google-slides.svg'
    },
    {
      id: '15',
      title: 'Innovation and Emerging Technology: Be Disruptive',
      organization: 'Macquarie dream Australia - Coursera',
      type: 'Innovation',
      filename: 'Innovation and emerging technology_ Be disruptive - Macqaire dream Austalia - Coursera LIV3PQ0WJE2X.pdf',
      path: '/Stephan-Certificates/Innovation and emerging technology_ Be disruptive - Macqaire dream Austalia - Coursera LIV3PQ0WJE2X.pdf',
      preview: '/certificate-previews/innovation-emerging-tech.svg'
    },
    {
      id: '16',
      title: 'Leading Diverse Teams',
      organization: 'UCI - Coursera',
      type: 'Leadership',
      filename: 'Leading Diverse Teams - UCI - Coursera ZC9VN37X094Z.pdf',
      path: '/Stephan-Certificates/Leading Diverse Teams - UCI - Coursera ZC9VN37X094Z.pdf',
      preview: '/certificate-previews/leading-diverse-teams.svg'
    },
    {
      id: '17',
      title: 'New Technologies for Business Leaders',
      organization: 'Rutgers - Coursera',
      type: 'Technology',
      filename: 'New Technologies for Business Leaders - Rutgers - Coursera 7T87PYBWCPW7.pdf',
      path: '/Stephan-Certificates/New Technologies for Business Leaders - Rutgers - Coursera 7T87PYBWCPW7.pdf',
      preview: '/certificate-previews/new-tech-business.svg'
    },
    {
      id: '18',
      title: 'Professionalism in an Era of Change',
      organization: 'Coursera',
      type: 'Professional Development',
      filename: 'Professionalism in an era of change - Coursera UMIH61273PJP.pdf',
      path: '/Stephan-Certificates/Professionalism in an era of change - Coursera UMIH61273PJP.pdf',
      preview: '/certificate-previews/professionalism-change.svg'
    },
    {
      id: '19',
      title: 'Managing the Company of the Future',
      organization: 'dream of London - Coursera',
      type: 'Management',
      filename: 'dream of London - Managing the Company of the Future - Coursera 3CVT7THP5LI4.pdf',
      path: '/Stephan-Certificates/dream of London - Managing the Company of the Future - Coursera 3CVT7THP5LI4.pdf',
      preview: '/certificate-previews/company-future.svg'
    }
  ];

  return (
    <>
      <section id="about" className="py-20 px-6 md:px-20 bg-main-dark/30 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 theme-gradient-primary-secondary rounded-full blur-3xl floating-animation" />
          <div className="absolute bottom-1/3 right-1/4 w-24 h-24 theme-gradient-secondary-tertiary rounded-full blur-2xl floating-animation" style={{ animationDelay: '2s' }} />
        </div>

        <AnimatedSection>
          <TextReveal
            text="About Me"
            className="text-3xl font-semibold mb-8 text-center"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <ScrollReveal direction="left" delay={0.2}>
              <div className="glass rounded-2xl p-8 hover-glow">
                <TextReveal
                  text="I'm a multimedia engineer skilled in designing and implementing innovative solutions across platforms. With expertise in multimedia technologies, I excel in fast-paced environments, delivering high-quality user experiences. Based in Lebanon, I thrive on solving complex problems and contributing to project success."
                  className="text-gray-300 mb-6"
                  delay={0.5}
                  staggerDelay={0.02}
                />

                <h3 className="text-xl font-semibold mb-4 text-white ">Education</h3>
                <div className="space-y-4 mb-8">
                  {education.map((edu, index) => (
                    <motion.div 
                      key={index} 
                      className="bg-white/5 p-4 rounded-lg hover-lift shimmer magnetic"
                      whileHover={{ scale: 1.02 }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                    >
                      <h4 className="font-semibold text-gradient-primary">{edu.school}</h4>
                      <p className="text-gray-300">{edu.degree}</p>
                      <p className="text-gray-400 text-sm">{edu.period}</p>
                    </motion.div>
                  ))}
                </div>

                <h3 className="text-xl font-semibold mb-4 text-white">Languages</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {languages.map((lang, index) => (
                    <motion.div 
                      key={index} 
                      className="bg-white/5 p-4 rounded-lg text-center hover-glow pulse-glow"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      whileHover={{ y: -5 }}
                    >
                      <h4 className="font-semibold text-gradient-primary">{lang.name}</h4>
                      <p className="text-gray-300">{lang.level}</p>
                    </motion.div>
                  ))}
                </div>
            </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.4}>
              <div className="glass rounded-2xl p-8 hover-glow">
                <h3 className="text-xl font-semibold mb-4 text-white ">Skills</h3>
                <div className="flex flex-wrap gap-2 mb-8">
                  {skills.map((skill, index) => (
                    <motion.span
                      key={index}
                      className="px-3 py-1 text-sm bg-white/10 rounded-full text-gray-300 hover-lift magnetic"
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.4 }}
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(0, 225, 255, 0.2)' }}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>

                <h3 className="text-xl font-semibold mb-4 text-white ">Certifications</h3>
                <div className="space-y-6 mb-8">
                  {certifications.map((cert, index) => (
                    <motion.div 
                      key={index} 
                      className="bg-white/5 p-4 rounded-lg shimmer hover-lift"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2, duration: 0.6 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <h4 className="font-semibold text-gradient-primary mb-2">{cert.type}</h4>
                      <ul className="list-disc list-inside text-gray-300 space-y-1">
                        {cert.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </AnimatedSection>
      </section>

      {/* Certificate Carousel Section */}
      <section className="py-16 px-6 md:px-20 bg-main-dark/20 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/3 right-1/4 w-40 h-40 theme-gradient-secondary-primary rounded-full blur-3xl floating-animation" />
          <div className="absolute bottom-1/4 left-1/3 w-28 h-28 theme-gradient-tertiary-secondary rounded-full blur-2xl floating-animation" style={{ animationDelay: '3s' }} />
        </div>

        <AnimatedSection>
          <div className="max-w-7xl mx-auto">
            <CertificateCarousel certificates={certificates} />
          </div>
        </AnimatedSection>
      </section>
    </>
  );
};

export default About;
