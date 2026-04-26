import PremiumNavbar from '@/components/premium/Navbar';
import PremiumHero from '@/components/premium/Hero';
import PremiumAbout from '@/components/premium/About';
import PremiumServices from '@/components/premium/Services';
import PremiumProjects from '@/components/premium/Projects';
import PlatformLogos from '@/components/premium/PlatformLogos';
import PremiumSeoExpertise from '@/components/premium/SeoExpertise';
import PremiumSkills from '@/components/premium/Skills';
import PremiumExperience from '@/components/premium/Experience';
import PremiumArchitecture from '@/components/premium/Architecture';
import PremiumTestimonials from '@/components/premium/Testimonials';
import PremiumContact from '@/components/premium/Contact';
import PremiumFooter from '@/components/premium/Footer';
import { getPublicContent } from '@/lib/bootstrap';
import { defaultSystems } from '@/lib/default-content';
import type { Metadata } from 'next';
import type {
  HeroContent,
  AboutContent,
  ServicesContent,
  SkillsContent,
  ExperienceContent,
  ArchitectureContent,
  TestimonialsContent,
  ContactContent,
} from '@/components/premium/types';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Full-Stack Developer, SEO Expert, and AI Search Expert',
  description:
    'Explore the portfolio of Stephan El Khoury featuring full-stack projects, technical SEO, AI search optimization, client platforms, QA, and performance-driven product delivery.',
  keywords: [
    'full-stack developer Lebanon',
    'SEO expert Lebanon',
    'AI search expert',
    'AEO consultant',
    'GEO consultant',
    'technical SEO specialist',
    'Next.js SEO expert',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Stephan El Khoury | Full-Stack Developer, SEO Expert, AI Search Expert',
    description:
      'Full-stack product delivery with technical SEO, AI search optimization, performance engineering, QA, and scalable web platforms.',
    url: '/',
    type: 'website',
    images: [
      {
        url: '/images/profile/stephan-profile.jpg',
        width: 1200,
        height: 630,
        alt: 'Stephan El Khoury portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stephan El Khoury | Full-Stack Developer, SEO Expert, AI Search Expert',
    description:
      'Technical SEO, AI search optimization, QA, and full-stack engineering for high-performance digital products.',
    images: ['/images/profile/stephan-profile.jpg'],
  },
};

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }
  return {};
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

export default async function Home() {
  const { blocks, projects, systems, certificates } = await getPublicContent();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stephanelkhoury.com';
  const bySlug = Object.fromEntries(blocks.map((block) => [block.slug, block]));

  const heroBlock = bySlug['hero-main'];
  const aboutBlock = bySlug['about-main'];
  const servicesBlock = bySlug['services-main'];
  const skillsBlock = bySlug['skills-main'];
  const experienceBlock = bySlug['experience-main'];
  const architectureBlock = bySlug['architecture-main'];
  const testimonialsBlock = bySlug['testimonials-main'];
  const contactBlock = bySlug['contact-main'];

  const hero = {
    ...asRecord(heroBlock?.content),
    title: heroBlock?.title,
    subtitle: heroBlock?.subtitle,
  } as HeroContent;
  const about = {
    ...asRecord(aboutBlock?.content),
    title: aboutBlock?.title,
    subtitle: aboutBlock?.subtitle,
  } as AboutContent;
  const services = {
    ...asRecord(servicesBlock?.content),
    title: servicesBlock?.title,
    subtitle: servicesBlock?.subtitle,
  } as ServicesContent;
  const skills = {
    ...asRecord(skillsBlock?.content),
    title: skillsBlock?.title,
    subtitle: skillsBlock?.subtitle,
  } as SkillsContent;
  const experience = {
    ...asRecord(experienceBlock?.content),
    title: experienceBlock?.title,
    subtitle: experienceBlock?.subtitle,
  } as ExperienceContent;
  const architecture = {
    ...asRecord(architectureBlock?.content),
    title: architectureBlock?.title,
    subtitle: architectureBlock?.subtitle,
  } as ArchitectureContent;
  const testimonials = {
    ...asRecord(testimonialsBlock?.content),
    title: testimonialsBlock?.title,
    subtitle: testimonialsBlock?.subtitle,
  } as TestimonialsContent;
  const contact = {
    ...asRecord(contactBlock?.content),
    title: contactBlock?.title,
    subtitle: contactBlock?.subtitle,
  } as ContactContent;

  const mappedProjects = projects.map((project) => ({
    id: project.id,
    slug: project.slug,
    title: project.title,
    summary: project.summary,
    description: project.description,
    imageUrl: project.imageUrl,
    liveUrl: project.liveUrl,
    githubUrl: project.githubUrl,
    technologies: asStringArray(project.technologies),
  }));

  const hiddenPlatformSlugs = new Set(['sitecore', 'sitefinity']);

  const mergedSystems = new Map<string, { name: string; slug: string; logoUrl: string; sortOrder: number }>();

  systems
    .filter((system) => !hiddenPlatformSlugs.has(system.slug))
    .forEach((system) => {
      mergedSystems.set(system.slug, {
        name: system.name,
        slug: system.slug,
        logoUrl: system.logoUrl,
        sortOrder: system.sortOrder,
      });
    });

  defaultSystems
    .filter((system) => !hiddenPlatformSlugs.has(system.slug) && system.isActive)
    .forEach((system) => {
      if (!mergedSystems.has(system.slug)) {
        mergedSystems.set(system.slug, {
          name: system.name,
          slug: system.slug,
          logoUrl: system.logoUrl,
          sortOrder: system.sortOrder,
        });
      }
    });

  const platformLogos = Array.from(mergedSystems.values())
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((system) => ({
      name: system.name,
      slug: system.slug,
      logoUrl: system.logoUrl,
    }));

  const seoFaqs = [
    {
      question: 'What SEO services does Stephan El Khoury provide?',
      answer:
        'I deliver technical SEO audits, structured data implementation, crawl and indexation fixes, internal linking improvements, Core Web Vitals optimization, and on-page search enhancements for modern websites and applications.',
    },
    {
      question: 'What is AI search optimization?',
      answer:
        'AI search optimization improves how your brand, pages, and expertise are understood by answer engines and AI-powered results such as Google AI Overviews, ChatGPT, Gemini, and Perplexity through stronger structure, authority signals, and semantic clarity.',
    },
    {
      question: 'Do you handle AEO and GEO strategies?',
      answer:
        'Yes. I work on Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO) by improving schema coverage, entity clarity, page usefulness, content structure, and technical performance so content is easier for AI systems to extract and cite.',
    },
    {
      question: 'Can technical SEO be combined with product engineering?',
      answer:
        'Yes. My approach combines code-level implementation with SEO strategy so rendering, metadata, structured data, internal linking, page speed, accessibility, and analytics work together rather than as separate checklists.',
    },
  ];

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': `${siteUrl}/#person`,
      name: 'Stephan El Khoury',
      jobTitle: 'Full-Stack Developer, SEO Expert, AI Search Expert',
      description:
        'Full-stack developer with expertise in technical SEO, AI search optimization, QA, and high-performance digital product delivery.',
      url: siteUrl,
      image: `${siteUrl}/images/profile/stephan-profile.jpg`,
      email: 'mailto:stephanelkhoury2000@gmail.com',
      telephone: '+961391906',
      sameAs: [
        'https://github.com/stephanelkhoury',
        'https://www.linkedin.com/in/stephanelkhoury',
        'https://www.instagram.com/stephanelkhoury',
        'https://x.com/stephanelkhoury',
      ],
      knowsAbout: [
        'Next.js',
        'React',
        'Node.js',
        'Quality Assurance',
        'Technical SEO',
        'AI Search Optimization',
        'Answer Engine Optimization',
        'Generative Engine Optimization',
        'Web Performance',
      ],
      worksFor: {
        '@type': 'Organization',
        name: 'Multigraphic.lb',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      '@id': `${siteUrl}/#services`,
      name: 'Stephan El Khoury Digital Services',
      url: siteUrl,
      image: `${siteUrl}/images/profile/stephan-profile.jpg`,
      description:
        'Professional services spanning full-stack development, technical SEO, AI search optimization, QA, and performance engineering.',
      provider: {
        '@id': `${siteUrl}/#person`,
      },
      areaServed: 'Worldwide',
      serviceType: [
        'Full-Stack Development',
        'Technical SEO',
        'AI Search Optimization',
        'AEO',
        'GEO',
        'Quality Assurance',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Stephan El Khoury',
      description:
        'Portfolio website for full-stack development, SEO expertise, AI search optimization, and digital product delivery.',
      publisher: {
        '@id': `${siteUrl}/#person`,
      },
      inLanguage: 'en-US',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${siteUrl}/#faq`,
      mainEntity: seoFaqs.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      '@id': `${siteUrl}/#projects`,
      name: 'Featured Projects',
      itemListElement: mappedProjects.slice(0, 10).map((project, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${siteUrl}/projects/${project.slug}`,
        name: project.title,
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PremiumNavbar />
      <main className="min-h-screen pt-16 bg-zinc-950 text-zinc-50">
        <PremiumHero content={hero} />
        <PremiumAbout content={about} certificationsCount={certificates.length} />
        <PremiumServices content={services} />
        <PremiumSeoExpertise faqs={seoFaqs} />
        <PremiumProjects projects={mappedProjects} />
        <PlatformLogos items={platformLogos} />
        <PremiumSkills content={skills} />
        <PremiumExperience content={experience} />
        <PremiumArchitecture content={architecture} />
        <PremiumTestimonials content={testimonials} />
        <PremiumContact content={contact} />
      </main>
      <PremiumFooter />
    </>
  );
}
