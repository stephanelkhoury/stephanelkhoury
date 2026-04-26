export type MultigraphicNavItem = {
  label: string;
  anchor: string;
};

export type MultigraphicAction = {
  label: string;
  href: string;
};

export type MultigraphicBlockType =
  | 'hero'
  | 'highlights'
  | 'about'
  | 'services'
  | 'projects'
  | 'stack'
  | 'skills'
  | 'experience'
  | 'pipeline'
  | 'testimonials'
  | 'contact';

export type MultigraphicBlock = {
  id: string;
  type: MultigraphicBlockType;
  anchor: string;
  enabled: boolean;
  content: Record<string, unknown>;
};

export type MultigraphicPageContent = {
  branding: {
    symbol: string;
    name: string;
    subtitle: string;
    logoUrl: string;
  };
  nav: MultigraphicNavItem[];
  primaryAction: MultigraphicAction;
  footer: {
    brandTop: string;
    brandBottom: string;
    copyright: string;
    links: MultigraphicNavItem[];
  };
  blocks: MultigraphicBlock[];
};

export const MULTIGRAPHIC_BLOCK_TYPES: MultigraphicBlockType[] = [
  'hero',
  'highlights',
  'about',
  'services',
  'projects',
  'stack',
  'skills',
  'experience',
  'pipeline',
  'testimonials',
  'contact',
];

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') return value as Record<string, unknown>;
  return {};
}

function asArray<T>(
  value: unknown,
  mapper: (entry: Record<string, unknown>, index: number) => T | null
): T[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === 'object')
    .map((entry, index) => mapper(entry, index))
    .filter((entry): entry is T => entry !== null);
}

function normalizeBlock(value: unknown, index: number): MultigraphicBlock | null {
  const record = asRecord(value);
  const type = String(record.type || '') as MultigraphicBlockType;
  if (!MULTIGRAPHIC_BLOCK_TYPES.includes(type)) return null;

  return {
    id: String(record.id || `${type}-${index + 1}`),
    type,
    anchor: String(record.anchor || type),
    enabled: Boolean(record.enabled ?? true),
    content: asRecord(record.content),
  };
}

export function getDefaultMultigraphicPage(): MultigraphicPageContent {
  return {
    branding: {
      symbol: '♪♫♩',
      name: 'STEPHAN.EK',
      subtitle: 'MultigraphicLB',
      logoUrl: '/logo-multigraphic.lb.png',
    },
    nav: [
      { label: 'About', anchor: 'about' },
      { label: 'Services', anchor: 'services' },
      { label: 'Projects', anchor: 'projects' },
      { label: 'Skills', anchor: 'skills' },
      { label: 'Experience', anchor: 'experience' },
      { label: 'Contact', anchor: 'contact' },
    ],
    primaryAction: { label: "Let's Talk", href: '#contact' },
    footer: {
      brandTop: 'STEPHAN',
      brandBottom: '.EK',
      copyright: '© 2026 Stephan El Khoury. All rights reserved.',
      links: [
        { label: 'About', anchor: 'about' },
        { label: 'Projects', anchor: 'projects' },
        { label: 'Experience', anchor: 'experience' },
        { label: 'Contact', anchor: 'contact' },
      ],
    },
    blocks: [
      {
        id: 'hero-main',
        type: 'hero',
        anchor: 'home',
        enabled: true,
        content: {
          badge: 'Full-Stack Development • QA • SEO',
          title: 'Building Scalable Digital Solutions.',
          description:
            'Computer Engineer and Full-Stack Developer with enterprise experience in web development, quality assurance, SEO optimization, and AI-driven platforms.',
          primaryCtaLabel: 'Explore Projects',
          primaryCtaHref: '#projects',
          secondaryCtaLabel: 'View Experience',
          secondaryCtaHref: '#experience',
        },
      },
      {
        id: 'highlights-main',
        type: 'highlights',
        anchor: 'highlights',
        enabled: true,
        content: {
          items: [
            { title: 'Enterprise Delivery', desc: 'Regional & international clients' },
            { title: 'Quality Assurance', desc: 'Manual + functional + regression testing' },
            { title: 'Technical SEO', desc: 'Performance, visibility, accessibility' },
            { title: 'Cross-Industry', desc: 'SaaS, e-learning, healthcare, music tech' },
          ],
        },
      },
      {
        id: 'about-main',
        type: 'about',
        anchor: 'about',
        enabled: true,
        content: {
          kicker: 'Professional Summary',
          heading: 'Computer Engineer focused on full-stack product delivery.',
          paragraphs: [
            'I design, develop, test, and deploy scalable digital products with a strong focus on quality, performance, and maintainability.',
            'My experience spans enterprise websites, SaaS platforms, e-learning systems, healthcare products, and AI-powered applications.',
            'I collaborate with cross-functional teams to deliver measurable outcomes through engineering excellence, QA discipline, and technical SEO.',
          ],
          stats: [
            { value: '2023+', label: 'Enterprise Experience' },
            { value: '5+', label: 'Industries Served' },
            { value: 'E2E', label: 'Product Ownership' },
            { value: '19 CERTS', label: 'Certifications' },
          ],
        },
      },
      {
        id: 'services-main',
        type: 'services',
        anchor: 'services',
        enabled: true,
        content: {
          kicker: 'Capabilities',
          title: 'Services & Expertise',
          subtitle:
            'Enterprise delivery across engineering, QA, and SEO with product-minded execution.',
          items: [
            {
              title: 'Enterprise Website Development',
              description:
                'Designing and maintaining enterprise-grade websites for regional and international organizations.',
            },
            {
              title: 'Full-Stack Platform Engineering',
              description:
                'Building scalable applications with React, Next.js, Node.js, FastAPI, and robust API architecture.',
            },
            {
              title: 'QA Process Implementation',
              description:
                'Executing manual, functional, and regression testing to improve reliability and release quality.',
            },
            {
              title: 'Technical SEO Optimization',
              description:
                'Improving search visibility and page performance with audits, structured fixes, and best practices.',
            },
            {
              title: 'UX/UI Delivery',
              description:
                'Developing responsive, accessible interfaces aligned with modern UX standards and business goals.',
            },
            {
              title: 'Audit & Reporting',
              description:
                'Using Lighthouse and SEO tooling to identify bottlenecks and prioritize high-impact improvements.',
            },
            {
              title: 'AI & Music Technology Products',
              description:
                'Creating AI-driven experiences for real-time analysis, recognition, and creative workflows.',
            },
            {
              title: 'Freelance Product Leadership',
              description:
                'Managing concept, deployment, hosting, security, backups, and long-term maintenance.',
            },
          ],
        },
      },
      {
        id: 'projects-main',
        type: 'projects',
        anchor: 'projects',
        enabled: true,
        content: {
          kicker: 'Portfolio',
          title: 'Featured Work',
          subtitle:
            'A selection of digital platforms, applications, and tools engineered for performance and designed for users.',
          ctaLabel: 'View GitHub Archive',
          ctaHref: 'https://github.com/stephanelkhoury',
          items: [
            {
              title: 'Harmonix',
              category: 'AI-Powered Music Analysis Platform',
              description:
                'Built a platform for real-time chord recognition, tempo analysis, tuning support, and lyric extraction using AI-driven processing.',
              tags: ['React', 'FastAPI', 'AI Models', 'Web Audio'],
              href: '/projects/harmonix',
              linkLabel: 'View project page',
            },
            {
              title: 'SEOphobia',
              category: 'SEO & UI QA Platform',
              description:
                'Developed an automated audit platform for performance, technical SEO, and UI consistency to support quality governance at scale.',
              tags: ['Next.js', 'Node.js', 'PostgreSQL', 'Lighthouse'],
              href: '/projects/seophobia',
              linkLabel: 'View project page',
            },
            {
              title: 'Clinickable',
              category: 'Clinic Management SaaS',
              description:
                'Implemented a healthcare SaaS platform covering patient records, appointment scheduling, and secure administrative dashboards.',
              tags: ['React', 'Node.js', 'PostgreSQL', 'Admin Dashboards'],
              href: '/projects/clinickable',
              linkLabel: 'View project page',
            },
            {
              title: 'Crypto-Engineers / Cryptokers',
              category: 'E-Learning Platforms',
              description:
                'Built e-learning platforms with authentication, course delivery, payment workflows, and role-based user dashboards.',
              tags: ['Next.js', 'Node.js', 'Payments', 'Authentication'],
              href: '#',
              linkLabel: 'View project page',
            },
            {
              title: 'Enterprise CMS Delivery',
              category: 'WPP – Ogilvy Client Delivery',
              description:
                'Developed and maintained enterprise-level websites for regional and international clients with strong QA and SEO standards.',
              tags: ['Sitecore', 'Sitefinity', 'Next.js', 'SEO'],
              href: '#',
              linkLabel: 'View project page',
            },
            {
              title: 'Multigraphic.lb Client Platforms',
              category: 'Freelance Full-Stack Delivery',
              description:
                'Designed and deployed full-stack websites from concept to production with long-term maintenance, security, and optimization.',
              tags: ['WordPress', 'PHP', 'SEO', 'Hosting & Security'],
              href: '#',
              linkLabel: 'View project page',
            },
          ],
        },
      },
      {
        id: 'stack-main',
        type: 'stack',
        anchor: 'stack',
        enabled: true,
        content: {
          title: 'Platforms I Work On',
          subtitle: 'Hover to pause. Click any logo to view my experience with that platform.',
          items: ['Next.js', 'React', 'WordPress', 'Astro', 'FastAPI', 'Node.js', 'PostgreSQL', 'Docker'],
        },
      },
      {
        id: 'skills-main',
        type: 'skills',
        anchor: 'skills',
        enabled: true,
        content: {
          kicker: 'Technical Proficiency',
          title: 'Skills & Tools',
          subtitle: 'Technical proficiency',
          groups: [
            {
              title: 'Programming & Frontend',
              items: ['JavaScript', 'TypeScript', 'Python', 'PHP', 'HTML5', 'CSS3', 'React', 'Next.js', 'Astro', 'WordPress', 'Elementor'],
            },
            { title: 'Backend & APIs', items: ['Node.js', 'FastAPI', 'Laravel', 'REST APIs'] },
            { title: 'Databases & Platforms', items: ['PostgreSQL', 'MySQL', 'Headless CMS', 'Enterprise CMS'] },
            { title: 'QA & Testing', items: ['Manual QA', 'Functional Testing', 'Regression Testing', 'Lighthouse Audits'] },
            { title: 'SEO & Performance', items: ['Technical SEO', 'Page Speed Optimization', 'Accessibility (WCAG)', 'Analytics'] },
            { title: 'Design & Product Tools', items: ['Figma', 'Adobe XD', 'Photoshop', 'Illustrator', 'VS Code', 'Postman', 'Docker', 'GitHub Actions', 'Git'] },
          ],
        },
      },
      {
        id: 'experience-main',
        type: 'experience',
        anchor: 'experience',
        enabled: true,
        content: {
          kicker: 'Career Trajectory',
          title: 'Professional Experience',
          subtitle: 'Roles and impact across enterprise, freelance, and contract delivery',
          items: [
            {
              period: 'Jan 2026 - Present',
              title: 'QA Analyst',
              company: 'Ogilvy One',
              meta: 'Full-time · United Arab Emirates · Remote',
              description:
                'Responsible for ensuring the quality, stability, and performance of digital platforms and enterprise solutions across multiple clients and industries.',
              bullets: [
                'Manual and automated test case design and maintenance',
                'Functional, regression, integration, and performance testing',
                'CMS validation across Optimizely, Sitecore, WordPress, and Adobe',
                'Defect lifecycle ownership and release validation',
              ],
              tags: ['QA', 'Sitecore', 'Optimizely', 'SEO', 'AI'],
            },
            {
              period: 'Jun 2025 - Jan 2026',
              title: 'Full-stack Developer',
              company: 'Ogilvy One',
              meta: 'Full-time · United Arab Emirates · Remote',
              description:
                'Designed, developed, and maintained scalable, secure, and high-performance digital platforms and enterprise applications.',
              bullets: [
                'Frontend architecture with React, Next.js, Vue, HTML5, CSS3',
                'Backend services using Node.js, FastAPI, .NET, and PHP',
                'RBAC, API integrations, CI/CD, monitoring, and optimization',
              ],
              tags: ['React', 'Next.js', 'Node.js', 'FastAPI', 'RBAC'],
            },
            {
              period: 'Sep 2023 - Jun 2025',
              title: 'Frontend Developer',
              company: 'Ogilvy One',
              meta: 'Full-time · Dubai, United Arab Emirates · Hybrid',
              description:
                'Delivered front-end and integrated web solutions across advertising projects in collaboration with cross-functional teams.',
              bullets: [
                'Enterprise UI implementation and optimization',
                'Cross-team collaboration with design, product, and development',
                'Performance and user experience improvements',
              ],
              tags: ['Sitecore', 'Sitefinity', 'Google Ads', 'Front-End'],
            },
            {
              period: '2021 - Present',
              title: 'Founder & Lead Developer',
              company: 'Multigraphic.lb',
              meta: 'Owner',
              description:
                'Designing and building full-stack websites from concept to deployment, while managing hosting, security, backups, and maintenance.',
              bullets: ['End-to-end delivery', 'SEO optimization', 'UX/UI leadership'],
              tags: ['Full-Stack', 'SEO', 'Hosting'],
            },
            {
              period: 'Aug 2022 - May 2023',
              title: 'UX/UI Engineer & Web Development',
              company: 'InnovatorsGate',
              meta: 'Internship · Lebanon',
              description:
                'Designed and built WordPress websites with strong UX focus after requirement analysis and stakeholder alignment.',
              bullets: ['WordPress + Elementor delivery', 'UX/UI flow optimization', 'Team-based client execution'],
              tags: ['WordPress', 'Elementor', 'Figma'],
            },
            {
              period: 'Feb 2019 - Jul 2022',
              title: 'Organization Manager',
              company: 'Copycenter',
              meta: 'Full-time · Zouk Mosbeh',
              description:
                'Managed printing operations, design workflows, and multi-machine production across multiple branches.',
              bullets: ['Operations management', 'Print and design systems', 'Workflow efficiency'],
              tags: ['Operations', 'Graphic Design', 'Process Improvement'],
            },
            {
              period: 'Jun 2020 - Jun 2021',
              title: 'Web Developer',
              company: 'Sayegh 1944',
              meta: 'Part-time · Lebanon',
              description: 'Worked on converting books into animated and digital publishing experiences.',
              bullets: ['eBook workflows', 'Web publishing', 'Front-end delivery'],
              tags: ['Ebooks', 'HTML', 'JavaScript'],
            },
            {
              period: 'Jun 2017 - Jan 2018',
              title: 'Barista',
              company: "McDonald's",
              meta: 'Dbayeh',
              description: 'Handled coffee operations, customer service, and product preparation in a fast-paced environment.',
              bullets: ['Customer service', 'Operational consistency', 'Team collaboration'],
              tags: ['Customer Service', 'Coffee Shops'],
            },
          ],
        },
      },
      {
        id: 'pipeline-main',
        type: 'pipeline',
        anchor: 'pipeline',
        enabled: true,
        content: {
          kicker: 'The Pipeline',
          title: 'Execution Framework',
          items: [
            {
              status: 'Structured',
              title: 'Discovery & Planning',
              points: ['Requirements gathering', 'UX flow mapping', 'Technical scope', 'Delivery roadmap'],
            },
            {
              status: 'Scalable',
              title: 'Build & Integrate',
              points: ['Frontend implementation', 'Backend/API development', 'Database modeling', 'CMS integration'],
            },
            {
              status: 'Stable',
              title: 'QA & Reliability',
              points: ['Manual QA', 'Functional + regression testing', 'Bug triage', 'Release readiness'],
            },
            {
              status: 'Measured',
              title: 'SEO & Performance',
              points: ['Technical SEO', 'Lighthouse audits', 'Accessibility checks', 'Continuous optimization'],
            },
          ],
        },
      },
      {
        id: 'testimonials-main',
        type: 'testimonials',
        anchor: 'validation',
        enabled: true,
        content: {
          kicker: 'Trust & Validation',
          title: 'Additional Information',
          subtitle: 'Collaboration strengths',
          items: [
            {
              quote: 'Strong experience in enterprise CMS and headless architectures across real client workflows.',
              author: 'Architecture',
              role: 'Enterprise CMS',
            },
            {
              quote: 'Background in music technology and AI-driven creative platforms, with practical product implementation.',
              author: 'Innovation',
              role: 'AI + Music Tech',
            },
            {
              quote: 'Excellent communication and cross-team collaboration in agile and deadline-driven environments.',
              author: 'Collaboration',
              role: 'Cross-Functional Teams',
            },
          ],
        },
      },
      {
        id: 'contact-main',
        type: 'contact',
        anchor: 'contact',
        enabled: true,
        content: {
          kicker: 'Get in Touch',
          title: "Let's build something exceptional.",
          subtitle: 'Open to discussing project opportunities and technical consulting.',
          emailLabel: 'Email Me',
          email: 'stephanelkhoury2000@gmail.com',
          phoneLabel: 'Phone',
          phone: '+961391906',
          locationLabel: 'Location',
          location: 'Lebanon',
          socialLabel: 'Connect across platforms',
          form: {
            fullNameLabel: 'Full Name',
            fullNamePlaceholder: 'John Doe',
            emailLabel: 'Email Address',
            emailPlaceholder: 'john@example.com',
            subjectLabel: 'Subject',
            subjectPlaceholder: 'Project Inquiry',
            messageLabel: 'Message',
            messagePlaceholder: 'Tell me about your project, goals, or technical needs...',
            submitLabel: 'Send Message',
          },
        },
      },
    ],
  };
}

export function normalizeMultigraphicPage(value: unknown): MultigraphicPageContent {
  const input = asRecord(value);
  const rawPage = asRecord(input.page || input);
  const template = getDefaultMultigraphicPage();

  const branding = asRecord(rawPage.branding);
  const footer = asRecord(rawPage.footer);

  const nav = asArray(rawPage.nav, (entry) => {
    const label = String(entry.label || '');
    const anchor = String(entry.anchor || '');
    if (!label || !anchor) return null;
    return { label, anchor };
  });

  const footerLinks = asArray(footer.links, (entry) => {
    const label = String(entry.label || '');
    const anchor = String(entry.anchor || '');
    if (!label || !anchor) return null;
    return { label, anchor };
  });

  const blocks = asArray(rawPage.blocks, normalizeBlock);

  return {
    branding: {
      symbol: String(branding.symbol || template.branding.symbol),
      name: String(branding.name || template.branding.name),
      subtitle: String(branding.subtitle || template.branding.subtitle),
      logoUrl: String(branding.logoUrl || template.branding.logoUrl),
    },
    nav: nav.length ? nav : template.nav,
    primaryAction: {
      label: String(asRecord(rawPage.primaryAction).label || template.primaryAction.label),
      href: String(asRecord(rawPage.primaryAction).href || template.primaryAction.href),
    },
    footer: {
      brandTop: String(footer.brandTop || template.footer.brandTop),
      brandBottom: String(footer.brandBottom || template.footer.brandBottom),
      copyright: String(footer.copyright || template.footer.copyright),
      links: footerLinks.length ? footerLinks : template.footer.links,
    },
    blocks: blocks.length ? blocks : template.blocks,
  };
}

export function serializeMultigraphicPage(page: MultigraphicPageContent): Record<string, unknown> {
  return { page };
}
