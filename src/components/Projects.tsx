'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import GradientText from './animations/GradientText';
import { AnimatedSection, ScrollReveal } from './animations';
import ProjectModal from './ProjectModal';

interface Project {
  title: string;
  description: string;
  image: string;
  technologies: string[];
  github?: string;
  live?: string;
  category: string;
  fullDescription?: string;
  features?: string[];
  challenges?: string[];
  date?: string;
}

const projects: Project[] = [
  // Major Projects 2024-2025
  {
    title: 'Project Management Dashboard – Enterprise Edition',
    description: 'A comprehensive project management platform with real-time collaboration, task tracking, and analytics.',
    fullDescription: 'Enterprise-grade project management dashboard built with Next.js 14 and FastAPI, featuring Kanban boards, time tracking, and advanced reporting.',
    image: 'https://res.cloudinary.com/stephanelkhoury/image/upload/v1/portfolio/projects/project-management',
    technologies: ['Next.js', 'FastAPI', 'PostgreSQL', 'WebSocket', 'Docker'],
    github: 'https://github.com/stephanelkhoury/project-management-dashboard',
    category: 'Full Stack Applications',
    date: 'May 2025',
    features: [
      'Real-time collaboration with WebSocket',
      'Kanban board with drag-and-drop',
      'Time tracking and resource management',
      'Advanced analytics and reporting',
      'Role-based access control'
    ]
  },
  {
    title: 'Headless CMS Blog Platform',
    description: 'Modern headless CMS with a Next.js frontend and Strapi backend for flexible content management.',
    fullDescription: 'A flexible content management system that separates content from presentation, allowing seamless content delivery across multiple platforms.',
    image: 'https://res.cloudinary.com/stephanelkhoury/image/upload/v1/portfolio/projects/headless-cms',
    technologies: ['Next.js', 'Strapi', 'GraphQL', 'PostgreSQL', 'TypeScript'],
    github: 'https://github.com/stephanelkhoury/headless-cms-platform',
    category: 'Content Management',
    date: 'May 2025',
    features: [
      'GraphQL API for flexible queries',
      'Multi-author support',
      'Rich text editor',
      'SEO optimization',
      'Media library management'
    ]
  },
  {
    title: 'Secure Authentication System',
    description: 'Enterprise-grade authentication service with multi-factor auth and SSO support.',
    fullDescription: 'A robust authentication system implementing industry best practices for security, including OAuth2, MFA, and JWT.',
    image: 'https://res.cloudinary.com/stephanelkhoury/image/upload/v1/portfolio/projects/auth-system',
    technologies: ['Node.js', 'Express', 'MongoDB', 'JWT', 'OAuth2'],
    github: 'https://github.com/stephanelkhoury/secure-auth-system',
    category: 'Security',
    date: 'June 2025',
    features: [
      'Multi-factor authentication',
      'OAuth2 and SSO integration',
      'JWT with refresh tokens',
      'Rate limiting and brute force protection',
      'Audit logging'
    ]
  },
  {
    title: 'AI-Powered Music Analyzer',
    description: 'Real-time audio analysis platform using machine learning for music processing.',
    fullDescription: 'Advanced audio processing platform that uses AI to analyze music in real-time, detect chords, tempo, and extract features.',
    image: 'https://res.cloudinary.com/stephanelkhoury/image/upload/v1/portfolio/projects/ai-music',
    technologies: ['Python', 'TensorFlow', 'FastAPI', 'React', 'WebAssembly'],
    github: 'https://github.com/stephanelkhoury/ai-music-analyzer',
    category: 'AI & Machine Learning',
    date: 'July 2025',
    features: [
      'Real-time chord detection',
      'Tempo and beat tracking',
      'Instrument recognition',
      'Audio feature extraction',
      'WASM-powered processing'
    ]
  },
  {
    title: 'RESTful API Platform',
    description: 'Comprehensive API development and management platform with documentation and testing tools.',
    fullDescription: 'Enterprise API platform for building, testing, and managing RESTful APIs with automatic documentation and monitoring.',
    image: 'https://res.cloudinary.com/stephanelkhoury/image/upload/v1/portfolio/projects/api-platform',
    technologies: ['Node.js', 'Express', 'PostgreSQL', 'OpenAPI', 'Docker'],
    github: 'https://github.com/stephanelkhoury/restful-api-platform',
    category: 'Backend & API',
    date: 'August 2025',
    features: [
      'API key management',
      'Rate limiting',
      'Automatic documentation',
      'Usage analytics',
      'Mock server generation'
    ]
  },
  {
    title: 'Dockerized Microservices Platform',
    description: 'Cloud-native microservices architecture with Kubernetes orchestration.',
    fullDescription: 'Production-ready microservices platform with service mesh, monitoring, and automated deployment pipelines.',
    image: 'https://res.cloudinary.com/stephanelkhoury/image/upload/v1/portfolio/projects/microservices',
    technologies: ['Docker', 'Kubernetes', 'Istio', 'Prometheus', 'Terraform'],
    github: 'https://github.com/stephanelkhoury/microservices-platform',
    category: 'DevOps & Infrastructure',
    date: 'September 2025',
    features: [
      'Service mesh with Istio',
      'Kubernetes orchestration',
      'Automated CI/CD',
      'Monitoring stack',
      'Infrastructure as code'
    ]
  },
  {
    title: 'Harmonix: AI-Powered Music Analysis Platform',
    description: 'Real-time chord detection from MP3 files, tempo detection, instrument tuner, and lyric extractor.',
    fullDescription: 'Harmonix is a comprehensive AI-powered music analysis platform that revolutionizes how musicians and producers interact with audio content. The platform uses advanced machine learning algorithms to provide real-time chord detection from MP3 files, accurate tempo detection, and intelligent lyric extraction.',
    image: '/projects/harmonix.jpg',
    technologies: ['React', 'FastAPI', 'Python', 'Machine Learning', 'Audio Processing'],
    github: 'https://github.com/stephanelkhoury/harmonix',
    live: 'https://harmonix.ai',
    category: 'AI & Machine Learning',
    date: 'December 2024',
    features: [
      'Real-time chord detection with 95% accuracy',
      'Automatic tempo and BPM detection',
      'AI-powered lyric extraction and synchronization',
      'Interactive chord visualization',
      'Multi-format audio support (MP3, WAV, FLAC)',
      'Instrument tuner with multiple tuning systems'
    ],
    challenges: [
      'Optimizing real-time audio processing for web browsers',
      'Training ML models with diverse musical genres',
      'Implementing accurate chord recognition algorithms',
      'Creating responsive audio visualization components'
    ]
  },
  {
    title: 'Sancta Maria Choir Website',
    description: 'Complete CMS with ACF Pro, events management, PDF resources, admin dashboard, and media gallery. Full-featured website for professional choir with advanced content management.',
    image: '/projects/sancta-maria.jpg',
    technologies: ['WordPress', 'ACF Pro', 'PHP', 'MySQL', 'CMS', 'Event Management'],
    live: 'https://sanctamariachoir.com',
    category: 'WordPress',
  },
  {
    title: 'Guitta Tabet Portfolio Website',
    description: 'Custom WordPress website with categorized product collections, responsive design, and modern UI. Built for creative professional with advanced filtering and showcase features.',
    image: '/projects/guitta-tabet.jpg',
    technologies: ['WordPress', 'Custom PHP', 'JavaScript', 'Responsive Design', 'Portfolio'],
    live: 'https://guittatabet.com',
    category: 'WordPress',
  },
  {
    title: 'Online POS + CRM Platform',
    description: 'Full-stack enterprise solution with custom CRM tools, inventory management, and sales analytics. Dockerized architecture for scalability and performance.',
    image: '/projects/pos-crm.jpg',
    technologies: ['React', 'Node.js', 'Docker', 'PostgreSQL', 'Redux', 'Enterprise'],
    github: 'https://github.com/stephanelkhoury/pos-crm',
    category: 'Enterprise',
  },
  {
    title: 'Cryptokers E-Learning Platform',
    description: 'Comprehensive platform for cryptocurrency and blockchain education with course streaming, Telegram subscription for signals, and integrated payment gateway.',
    image: '/projects/cryptokers.jpg',
    technologies: ['PHP', 'MySQL', 'Telegram API', 'Payment Gateway', 'LMS', 'Blockchain'],
    live: 'https://cryptokers.com',
    category: 'E-Learning',
  },
  {
    title: 'Angular E-Commerce Platform',
    description: 'Fully-featured shopping system with NgRx state management, Redux flow, and comprehensive product-cart relations with schema visuals.',
    image: '/projects/angular-ecommerce.jpg',
    technologies: ['Angular', 'NgRx', 'TypeScript', 'Redux', 'E-Commerce', 'State Management'],
    github: 'https://github.com/stephanelkhoury/angular-ecommerce',
    category: 'E-Commerce',
  },
  {
    title: 'Richy\'s Entertainment Website',
    description: 'Event company website with tagline integration and visual storytelling. Modern design with booking system and portfolio showcase.',
    image: '/projects/richys-entertainment.jpg',
    technologies: ['WordPress', 'Event Management', 'Visual Storytelling', 'Booking System'],
    live: 'https://richysentertainment.com',
    category: 'WordPress',
  },
  {
    title: 'Hi-YU Lebanon Web Strategy',
    description: 'Complete website rebuild strategy and development proposal. Full-stack approach with modern design principles and performance optimization.',
    image: '/projects/hi-yu-lebanon.jpg',
    technologies: ['Strategy', 'Full-Stack Development', 'Performance Optimization', 'Modern Design'],
    category: 'Strategy',
  },
  {
    title: 'Saudi Dates Documentation',
    description: 'Comprehensive GitHub markdown wiki based on 9 functional pages. Includes use cases, user stories, and system diagrams for enterprise application.',
    image: '/projects/saudi-dates.jpg',
    technologies: ['Documentation', 'GitHub Wiki', 'System Design', 'Use Cases', 'Markdown'],
    github: 'https://github.com/stephanelkhoury/saudi-dates-docs',
    category: 'Documentation',
  },

  // Upcoming & Planned Projects
  {
    title: 'Modern E-Commerce Platform',
    description: 'Full-stack e-commerce solution with cart management, Stripe/PayPal integration, advanced filtering, and real-time inventory tracking.',
    fullDescription: 'A comprehensive e-commerce platform built with modern technologies, featuring seamless user experience, secure payment processing, and advanced product management. Includes admin dashboard, order tracking, and analytics.',
    image: '/projects/angular-ecommerce.jpg', // Reusing existing image as placeholder
    technologies: ['React', 'Node.js', 'Express', 'PostgreSQL', 'Stripe API', 'Redux', 'TypeScript'],
    category: 'Upcoming Projects',
    date: 'Q1 2025',
    features: [
      'Shopping cart with persistent storage',
      'Stripe & PayPal payment integration',
      'Advanced product filtering and search',
      'User authentication and profiles',
      'Order tracking and history',
      'Admin dashboard with analytics',
      'Real-time inventory management',
      'Responsive design for all devices'
    ],
    challenges: [
      'Implementing secure payment processing',
      'Optimizing database queries for large product catalogs',
      'Creating scalable cart and session management',
      'Building comprehensive admin interface'
    ]
  },
  {
    title: 'Real-Time Chat Application',
    description: 'Scalable messaging platform with WebSocket integration, private/group chats, message history, and real-time notifications.',
    fullDescription: 'A modern chat application built for scalability and performance, featuring real-time messaging, file sharing, and comprehensive user management. Uses WebSocket technology for instant communication.',
    image: '/projects/chord-dictionary.jpg', // Placeholder
    technologies: ['React', 'Socket.IO', 'Node.js', 'Redis', 'MongoDB', 'JWT', 'WebRTC'],
    category: 'Upcoming Projects',
    date: 'Q1 2025',
    features: [
      'Real-time messaging with Socket.IO',
      'Private and group chat rooms',
      'Message history and search',
      'File and image sharing',
      'User presence indicators',
      'Push notifications',
      'Voice and video calling',
      'Message encryption for security'
    ],
    challenges: [
      'Scaling WebSocket connections',
      'Implementing message delivery guarantees',
      'Managing real-time user presence',
      'Optimizing message storage and retrieval'
    ]
  },
  {
    title: 'Project Management Dashboard',
    description: 'Kanban-style project management tool with drag-and-drop functionality, team collaboration, and real-time updates inspired by Trello and Notion.',
    fullDescription: 'A comprehensive project management solution featuring intuitive drag-and-drop interfaces, role-based access control, and real-time collaboration tools for teams of all sizes.',
    image: '/projects/pos-crm.jpg', // Placeholder
    technologies: ['Next.js', 'FastAPI', 'PostgreSQL', 'Tailwind CSS', 'React DnD', 'WebSocket'],
    category: 'Upcoming Projects',
    date: 'Q2 2025',
    features: [
      'Drag-and-drop Kanban boards',
      'Real-time collaboration',
      'Role-based access control',
      'Task assignments and deadlines',
      'File attachments and comments',
      'Project templates',
      'Time tracking and reporting',
      'Integration with third-party tools'
    ],
    challenges: [
      'Implementing smooth drag-and-drop UX',
      'Managing real-time state synchronization',
      'Building flexible permission systems',
      'Optimizing performance for large datasets'
    ]
  },
  {
    title: 'Headless CMS Blog Platform',
    description: 'Modern content management system with headless architecture, SEO optimization, markdown support, and dynamic content rendering.',
    fullDescription: 'A powerful blogging platform built with headless CMS architecture, featuring advanced SEO capabilities, flexible content modeling, and lightning-fast performance.',
    image: '/projects/sancta-maria.jpg', // Placeholder
    technologies: ['Next.js', 'Strapi', 'GraphQL', 'Tailwind CSS', 'Markdown', 'SEO'],
    category: 'Upcoming Projects',
    date: 'Q2 2025',
    features: [
      'Headless CMS with Strapi',
      'SEO optimization and meta management',
      'Markdown content support',
      'Dynamic page generation',
      'Content versioning',
      'Multi-author support',
      'Comment system',
      'Analytics integration'
    ],
    challenges: [
      'Optimizing static generation performance',
      'Building flexible content schemas',
      'Implementing advanced SEO features',
      'Creating intuitive admin interface'
    ]
  },
  {
    title: 'Secure Authentication System',
    description: 'Comprehensive authentication service with JWT tokens, OAuth integration, two-factor authentication, and advanced security features.',
    fullDescription: 'A robust authentication system designed for modern applications, featuring multiple authentication methods, advanced security measures, and seamless user experience.',
    image: '/projects/crypto-engineers.jpg', // Placeholder
    technologies: ['Node.js', 'Express', 'MongoDB', 'JWT', 'OAuth', '2FA', 'bcrypt', 'Redis'],
    category: 'Upcoming Projects',
    date: 'Q2 2025',
    features: [
      'JWT-based authentication',
      'OAuth integration (Google, GitHub)',
      'Two-factor authentication (2FA)',
      'Password reset functionality',
      'Session management',
      'Rate limiting and security',
      'Email verification',
      'Admin user management'
    ],
    challenges: [
      'Implementing secure token handling',
      'Managing session state across devices',
      'Building robust 2FA system',
      'Ensuring GDPR compliance'
    ]
  },
  {
    title: 'AI-Powered Music Analyzer',
    description: 'Advanced music analysis application using machine learning for chord detection, tempo analysis, and intelligent music recommendations.',
    fullDescription: 'Building on Harmonix, this expanded AI platform will include advanced music analysis features, recommendation systems, and collaborative tools for musicians and producers.',
    image: '/projects/harmonix.jpg',
    technologies: ['Python', 'TensorFlow', 'FastAPI', 'React', 'Audio Processing', 'ML', 'WebAssembly'],
    category: 'Upcoming Projects',
    date: 'Q3 2025',
    features: [
      'Advanced chord progression analysis',
      'Intelligent music recommendations',
      'Real-time audio visualization',
      'Collaborative music sessions',
      'Custom ML model training',
      'Audio fingerprinting',
      'Music theory education tools',
      'API for third-party integration'
    ],
    challenges: [
      'Training models on diverse musical styles',
      'Optimizing real-time audio processing',
      'Building scalable recommendation engine',
      'Implementing collaborative features'
    ]
  },
  {
    title: 'RESTful API Platform',
    description: 'Comprehensive API-first platform with full documentation, authentication, rate limiting, and microservices architecture.',
    fullDescription: 'A production-ready API platform designed for scalability and developer experience, featuring comprehensive documentation, testing tools, and monitoring capabilities.',
    image: '/projects/erp-system.jpg', // Placeholder
    technologies: ['Node.js', 'Express', 'OpenAPI', 'Swagger', 'Docker', 'PostgreSQL', 'Redis'],
    category: 'Upcoming Projects',
    date: 'Q3 2025',
    features: [
      'RESTful API design',
      'Comprehensive OpenAPI documentation',
      'Rate limiting and throttling',
      'API versioning',
      'Authentication and authorization',
      'Request/response validation',
      'Monitoring and analytics',
      'SDK generation for multiple languages'
    ],
    challenges: [
      'Designing scalable API architecture',
      'Implementing effective rate limiting',
      'Building comprehensive documentation',
      'Ensuring API security and performance'
    ]
  },
  {
    title: 'Dockerized Microservices Platform',
    description: 'Production-ready microservices architecture with Docker, CI/CD pipelines, load balancing, and comprehensive monitoring.',
    fullDescription: 'A complete microservices ecosystem demonstrating modern DevOps practices, featuring automated deployment, service discovery, and comprehensive monitoring solutions.',
    image: '/projects/pos-crm.jpg', // Placeholder
    technologies: ['Docker', 'Kubernetes', 'GitHub Actions', 'NGINX', 'Prometheus', 'Grafana', 'Microservices'],
    category: 'Upcoming Projects',
    date: 'Q4 2025',
    features: [
      'Containerized microservices',
      'CI/CD with GitHub Actions',
      'Service discovery and load balancing',
      'Centralized logging',
      'Monitoring and alerting',
      'Auto-scaling capabilities',
      'Health checks and circuit breakers',
      'Blue-green deployments'
    ],
    challenges: [
      'Orchestrating service communication',
      'Implementing distributed tracing',
      'Managing service dependencies',
      'Building robust deployment pipelines'
    ]
  },
  {
    title: 'Streaming Platform Clone',
    description: 'Full-featured streaming platform inspired by Spotify, with music streaming, playlists, social features, and recommendation engine.',
    fullDescription: 'A comprehensive music streaming platform featuring advanced audio streaming, social interactions, and AI-powered music discovery to demonstrate full-stack capabilities.',
    image: '/projects/harmonix.jpg', // Related to music
    technologies: ['React', 'Node.js', 'MongoDB', 'Redis', 'WebRTC', 'Audio Streaming', 'ML Recommendations'],
    category: 'Upcoming Projects',
    date: 'Q4 2025',
    features: [
      'High-quality audio streaming',
      'Playlist creation and sharing',
      'Social features and following',
      'AI-powered recommendations',
      'Offline playback capability',
      'Artist dashboard and analytics',
      'Search and discovery',
      'Mobile-responsive design'
    ],
    challenges: [
      'Implementing efficient audio streaming',
      'Building recommendation algorithms',
      'Managing large media files',
      'Creating smooth user experience'
    ]
  },
  {
    title: 'Business Analytics Dashboard',
    description: 'Advanced analytics platform with interactive charts, real-time data visualization, role-based access, and comprehensive reporting tools.',
    fullDescription: 'A powerful business intelligence platform featuring interactive dashboards, real-time analytics, and comprehensive reporting capabilities for data-driven decision making.',
    image: '/projects/pos-crm.jpg', // Business-related
    technologies: ['React', 'D3.js', 'Chart.js', 'NestJS', 'PostgreSQL', 'Redis', 'WebSocket'],
    category: 'Upcoming Projects',
    date: 'Q4 2025',
    features: [
      'Interactive data visualizations',
      'Real-time analytics updates',
      'Custom dashboard creation',
      'Role-based access control',
      'Export and reporting tools',
      'Data filtering and drilling',
      'Performance monitoring',
      'Integration with multiple data sources'
    ],
    challenges: [
      'Optimizing large dataset visualization',
      'Building flexible charting system',
      'Implementing real-time data updates',
      'Creating intuitive user interface'
    ]
  },
];

const Projects: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category)))];
  
  const filteredProjects = selectedCategory === 'All' 
    ? projects 
    : projects.filter(p => p.category === selectedCategory);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  return (
    <section id="projects" className="py-20 px-6 md:px-20">
      <AnimatedSection>
        <GradientText
          text="Featured Projects"
          className="text-3xl font-semibold mb-8"
        />
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-12 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-main-gradient text-black'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <ScrollReveal key={index} delay={index * 0.1} direction="up">
              <motion.div
                className="group relative bg-gradient-to-br from-gradient-primary-rgb/10 to-gradient-tertiary-rgb/10 rounded-xl overflow-hidden border border-white/10 hover-glow glass shimmer cursor-pointer h-full flex flex-col"
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                onClick={() => handleProjectClick(project)}
              >
                <div className="aspect-w-16 aspect-h-9 h-48 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${project.image})` }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  />
                  <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-300" />
                  
                  {/* Category Badge */}
                  <motion.div 
                    className="absolute top-4 left-4"
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="px-3 py-1 text-xs bg-main-gradient text-black rounded-full font-medium liquid-bg">
                      {project.category}
                    </span>
                  </motion.div>

                  {/* Click to view overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1 }}
                      className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white font-medium"
                    >
                      Click to view details
                    </motion.div>
                  </div>
                </div>
                
                <div className="relative p-6 flex-1 flex flex-col">
                  <motion.h3 
                    className="text-xl font-semibold mb-2 group-hover:text-gradient-primary transition-colors duration-300"
                    whileHover={{ scale: 1.05 }}
                  >
                    {project.title}
                  </motion.h3>
                  <p className="text-gray-300 mb-4 text-sm leading-relaxed flex-1">
                    {project.description}
                  </p>
                  
                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.slice(0, 4).map((tech, techIndex) => (
                      <motion.span
                        key={techIndex}
                        className="px-2 py-1 text-xs bg-white/10 rounded-full text-gray-300 hover-lift magnetic"
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(0, 225, 255, 0.2)' }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: techIndex * 0.1, duration: 0.3 }}
                      >
                        {tech}
                      </motion.span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="px-2 py-1 text-xs bg-white/10 rounded-full text-gray-400">
                        +{project.technologies.length - 4} more
                      </span>
                    )}
                </div>
                
                {/* Links */}
                <div className="flex gap-3 mt-auto">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors duration-300"
                    >
                      <FontAwesomeIcon icon={faGithub} />
                      Code
                    </a>
                  )}
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 px-3 py-2 bg-main-gradient text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity duration-300"
                    >
                      <FontAwesomeIcon icon={faExternalLinkAlt} />
                      Live Demo
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
            </ScrollReveal>
          ))}
        </div>
        
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No projects found in this category.</p>
          </div>
        )}
      </AnimatedSection>

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </section>
  );
};

export default Projects;
