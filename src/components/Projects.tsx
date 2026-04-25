'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import GradientText from './animations/GradientText';
import { AnimatedSection, ScrollReveal } from './animations';
import ProjectModal from './ProjectModal';

export interface ScreenshotItem {
  url: string;
  type: 'desktop' | 'mobile';
  caption?: string;
}

export interface PerformanceMetrics {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  testedAt?: string;
}

export interface Project {
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
  screenshots?: ScreenshotItem[];
  performanceMetrics?: PerformanceMetrics | null;
}

// Fallback static data used when DB is empty
const staticProjects: Project[] = [
  {
    title: 'Modern E-Commerce Platform',
    description: 'Full-stack commerce platform with secure checkout, advanced product filtering, inventory management, and admin analytics.',
    fullDescription: 'A production-ready e-commerce solution with customer shopping workflows, robust admin operations, and payment integrations for scalable online retail.',
    image: '/projects/angular-ecommerce.jpg',
    technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Prisma', 'Stripe'],
    github: 'https://github.com/stephanelkhoury/stephanelkhoury/tree/main/upcoming-projects/01-modern-ecommerce-platform',
    category: 'E-Commerce',
    date: '2025',
    features: [
      'Product catalog with filtering and recommendations',
      'Persistent cart and real-time inventory checks',
      'Multi-step checkout with Stripe and PayPal support',
      'Admin dashboard for products, orders, and users',
      'Role-based access and reporting workflows'
    ],
    challenges: [
      'Designing secure payment and order flows',
      'Keeping inventory and cart state synchronized',
      'Optimizing performance for large product catalogs'
    ]
  },
  {
    title: 'Real-Time Chat Application',
    description: 'Scalable chat system with Socket.IO, private/group messaging, typing indicators, reactions, and presence tracking.',
    fullDescription: 'A modern real-time messaging platform built for reliability and speed, including rich communication features and structured conversation management.',
    image: '/projects/chord-dictionary.jpg',
    technologies: ['React', 'TypeScript', 'Socket.IO', 'Node.js', 'MongoDB', 'Redis'],
    github: 'https://github.com/stephanelkhoury/stephanelkhoury/tree/main/upcoming-projects/02-realtime-chat-application',
    category: 'Communication',
    date: '2025',
    features: [
      'Private chats and group conversations',
      'Typing indicators and read receipts',
      'File and image sharing support',
      'Presence and last-seen status tracking',
      'Searchable message history with pagination'
    ],
    challenges: [
      'Maintaining consistent real-time state',
      'Scaling socket connections and event throughput',
      'Balancing UX responsiveness with data integrity'
    ]
  },
  {
    title: 'Project Management Dashboard',
    description: 'Enterprise project operations suite with task workflows, sprint planning, collaboration tools, and advanced analytics.',
    fullDescription: 'A comprehensive dashboard for teams and organizations covering project lifecycle management, resource planning, automation, and KPI reporting.',
    image: '/projects/pos-crm.jpg',
    technologies: ['Next.js', 'TypeScript', 'NestJS', 'PostgreSQL', 'Redis', 'Docker'],
    github: 'https://github.com/stephanelkhoury/stephanelkhoury/tree/main/upcoming-projects/03-project-management-dashboard',
    category: 'Enterprise',
    date: '2025',
    features: [
      'Role-based workspaces and permission matrix',
      'Task workflows with milestones and dependencies',
      'Real-time collaboration with comments and mentions',
      'Time tracking, utilization, and approvals',
      'Exportable reports and analytics dashboards'
    ],
    challenges: [
      'Designing scalable multi-tenant architecture',
      'Implementing flexible workflow engines',
      'Ensuring performance under enterprise workload'
    ]
  },
  {
    title: 'Headless CMS Blog Platform',
    description: 'API-first CMS with multi-author publishing, content versioning, SEO tooling, and a modern blog frontend.',
    fullDescription: 'A decoupled content platform combining rich editorial workflows with fast frontend delivery, designed for modern publishing teams.',
    image: '/projects/sancta-maria.jpg',
    technologies: ['Next.js', 'Strapi', 'GraphQL', 'PostgreSQL', 'Tailwind CSS'],
    github: 'https://github.com/stephanelkhoury/stephanelkhoury/tree/main/upcoming-projects/04-headless-cms-blog-platform',
    category: 'CMS',
    date: '2025',
    features: [
      'Rich text editing and media management',
      'Drafts, scheduling, and content versioning',
      'GraphQL and REST API access patterns',
      'SEO metadata and structured content support',
      'Search, tags, categories, and author pages'
    ],
    challenges: [
      'Synchronizing CMS and frontend content models',
      'Balancing editorial flexibility with performance',
      'Building scalable, secure media pipelines'
    ]
  },
  {
    title: 'Secure Authentication System',
    description: 'Security-first authentication service with MFA, OAuth, RBAC, device tracking, and enterprise audit logging.',
    fullDescription: 'A robust auth platform designed for integration across products, featuring strong identity flows, token security, and compliance-ready controls.',
    image: '/projects/crypto-engineers.jpg',
    technologies: ['Node.js', 'TypeScript', 'Express', 'MongoDB', 'Redis', 'JWT'],
    github: 'https://github.com/stephanelkhoury/stephanelkhoury/tree/main/upcoming-projects/05-secure-authentication-system',
    category: 'Backend & Security',
    date: '2025',
    features: [
      'Email/password, OAuth, and passwordless login',
      'MFA with TOTP, SMS, and backup recovery',
      'Role-based access and permission controls',
      'Session, token, and device lifecycle management',
      'Comprehensive security audit trail'
    ],
    challenges: [
      'Hardening authentication attack surfaces',
      'Designing secure token rotation strategy',
      'Supporting flexible enterprise authorization models'
    ]
  },
  {
    title: 'AI-Powered Music Analyzer',
    description: 'Machine-learning platform for audio feature extraction, genre/mood analysis, and personalized music recommendations.',
    fullDescription: 'An advanced AI system that processes audio tracks, predicts musical characteristics, and provides recommendation insights through an interactive web interface.',
    image: '/projects/harmonix.jpg',
    technologies: ['Python', 'FastAPI', 'TensorFlow', 'Librosa', 'React', 'PostgreSQL'],
    github: 'https://github.com/stephanelkhoury/stephanelkhoury/tree/main/upcoming-projects/06-ai-powered-music-analyzer',
    category: 'AI & Machine Learning',
    date: '2025',
    features: [
      'Feature extraction for tempo, key, energy, and mood',
      'Genre prediction and similarity scoring',
      'Recommendation and playlist generation engine',
      'Batch and real-time audio analysis workflows',
      'Interactive analytics and visualization dashboard'
    ],
    challenges: [
      'Balancing model accuracy and processing speed',
      'Managing heavy audio workloads reliably',
      'Serving ML inference at scale'
    ]
  },
  {
    title: 'RESTful API Platform',
    description: 'Developer-centric API platform with OpenAPI docs, testing utilities, analytics, API keys, and rate limiting.',
    fullDescription: 'A backend platform that accelerates API lifecycle management through standards-driven design, observability, and consumer onboarding tools.',
    image: '/projects/erp-system.jpg',
    technologies: ['Node.js', 'Express', 'TypeScript', 'OpenAPI', 'PostgreSQL', 'Redis'],
    github: 'https://github.com/stephanelkhoury/stephanelkhoury/tree/main/upcoming-projects/07-restful-api-platform',
    category: 'Backend & Security',
    date: '2025',
    features: [
      'Auto-generated OpenAPI documentation',
      'Schema validation and standardized errors',
      'API key management and access controls',
      'Usage analytics and monitoring dashboards',
      'Rate limiting and caching strategies'
    ],
    challenges: [
      'Designing extensible API governance',
      'Combining performance with strict validation',
      'Building developer-friendly platform UX'
    ]
  },
  {
    title: 'Dockerized Microservices Platform',
    description: 'Cloud-native microservices ecosystem with container orchestration, service mesh, observability, and CI/CD automation.',
    fullDescription: 'An enterprise-grade architecture showcasing distributed services, resilient communication patterns, and production-level DevOps workflows.',
    image: '/projects/erp-system.jpg',
    technologies: ['Docker', 'Kubernetes', 'Terraform', 'Istio', 'Prometheus', 'Grafana'],
    github: 'https://github.com/stephanelkhoury/stephanelkhoury/tree/main/upcoming-projects/08-dockerized-microservices-platform',
    category: 'DevOps',
    date: '2025',
    features: [
      'Containerized multi-service architecture',
      'Kubernetes orchestration and autoscaling',
      'Service mesh traffic and resilience controls',
      'Observability with logs, metrics, and tracing',
      'Automated CI/CD and GitOps-ready delivery'
    ],
    challenges: [
      'Operating distributed services reliably',
      'Managing multi-environment configuration securely',
      'Reducing deployment risk with zero-downtime rollout'
    ]
  },
  {
    title: 'Streaming Platform Clone',
    description: 'Feature-rich streaming platform with adaptive video delivery, creator tools, subscription models, and personalized recommendations.',
    fullDescription: 'A full-stack media platform inspired by modern streaming ecosystems, including video processing pipelines, social interactions, and monetization flows.',
    image: '/projects/cryptokers.jpg',
    technologies: ['Next.js', 'Node.js', 'PostgreSQL', 'Redis', 'FFmpeg', 'AWS'],
    github: 'https://github.com/stephanelkhoury/stephanelkhoury/tree/main/upcoming-projects/09-streaming-platform-clone',
    category: 'Media & Streaming',
    date: '2025',
    features: [
      'Adaptive streaming with multi-resolution processing',
      'Custom player with subtitles and accessibility options',
      'Watch history, personalization, and recommendations',
      'Creator dashboard with analytics and monetization',
      'Subscription and premium content workflows'
    ],
    challenges: [
      'Building efficient transcoding pipelines',
      'Delivering low-latency playback across networks',
      'Scaling storage and CDN distribution strategy'
    ]
  },
  {
    title: 'Business Analytics Dashboard',
    description: 'Business intelligence suite with interactive dashboards, real-time analytics, ETL pipelines, and advanced reporting.',
    fullDescription: 'A data-driven platform that transforms operational data into actionable business insights through custom visualizations and automated reporting.',
    image: '/projects/saudi-dates.jpg',
    technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'D3.js', 'Redis'],
    github: 'https://github.com/stephanelkhoury/stephanelkhoury/tree/main/upcoming-projects/10-business-analytics-dashboard',
    category: 'Analytics',
    date: '2025',
    features: [
      'Interactive dashboards and drill-down analytics',
      'Custom KPI tracking and metric definitions',
      'Automated report generation and exports',
      'Real-time data ingestion and processing',
      'Advanced filtering and ad-hoc analysis tools'
    ],
    challenges: [
      'Unifying heterogeneous data sources',
      'Maintaining responsive charts on large datasets',
      'Designing reliable analytics pipelines'
    ]
  }
];

// Map DB project to frontend format
function mapDbProject(p: Record<string, unknown>): Project {
  return {
    title: (p.title as string) || '',
    description: (p.summary as string) || '',
    fullDescription: (p.description as string) || '',
    image: (p.imageUrl as string) || '/projects/placeholder.jpg',
    technologies: Array.isArray(p.technologies) ? p.technologies as string[] : [],
    github: (p.githubUrl as string) || undefined,
    live: (p.liveUrl as string) || undefined,
    category: (p.category as string) || 'Web Application',
    date: (p.date as string) || undefined,
    features: Array.isArray(p.features) ? p.features as string[] : [],
    challenges: Array.isArray(p.challenges) ? p.challenges as string[] : [],
    screenshots: Array.isArray(p.screenshots) ? p.screenshots as ScreenshotItem[] : [],
    performanceMetrics: p.performanceMetrics as PerformanceMetrics | null | undefined,
  };
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(staticProjects);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        if (data.projects && data.projects.length > 0) {
          setProjects(data.projects.map(mapDbProject));
        }
      })
      .catch(() => {
        // Keep static fallback
      });
  }, []);
  
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
                  ? 'bg-gradient-to-r from-[#3b82f6] to-[#10b981] text-black'
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
                className="group relative bg-gradient-to-br from-[#3b82f610] to-[#10b98110] rounded-xl overflow-hidden border border-white/10 hover-glow glass shimmer cursor-pointer h-full flex flex-col"
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
                    <span className="px-3 py-1 text-xs bg-gradient-to-r from-[#3b82f6] to-[#10b981] text-black rounded-full font-medium liquid-bg">
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
                    className="text-xl font-semibold mb-2 group-hover:text-[#3b82f6] transition-colors duration-300"
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
                      className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#3b82f6] to-[#10b981] text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity duration-300"
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
