export type HeroContent = {
  badge?: string;
  headingPrimary?: string;
  headingAccent?: string;
  headingSuffix?: string;
  description?: string;
  ctaPrimaryLabel?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
  highlights?: Array<{ title: string; desc: string }>;
};

export type AboutContent = {
  kicker?: string;
  headline?: string;
  headlineAccent?: string;
  paragraphs?: string[];
  stats?: Array<{ value: string; label: string }>;
};

export type ServicesContent = {
  title?: string;
  subtitle?: string;
  items?: Array<{ icon: string; title: string; desc: string; iconColor?: string }>;
};

export type SkillsContent = {
  title?: string;
  subtitle?: string;
  categories?: Array<{ icon: string; title: string; skills: string[] }>;
};

export type ExperienceContent = {
  title?: string;
  subtitle?: string;
  items?: Array<{
    year: string;
    title: string;
    company: string;
    description: string;
    metrics: string[];
  }>;
};

export type ArchitectureContent = {
  title?: string;
  subtitle?: string;
  pipeline?: Array<{
    icon: string;
    title: string;
    details: string[];
    status: string;
  }>;
};

export type TestimonialsContent = {
  title?: string;
  subtitle?: string;
  items?: Array<{ quote: string; author: string; role: string }>;
};

export type ContactContent = {
  title?: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  x?: string;
};
