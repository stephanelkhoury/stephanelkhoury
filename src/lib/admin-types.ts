export type BlockType = 'HERO' | 'ABOUT' | 'EXPERIENCE' | 'CONTACT';

export type ContentBlockInput = {
  id?: string;
  slug: string;
  type: BlockType;
  title: string;
  subtitle?: string | null;
  content: Record<string, unknown>;
  sortOrder: number;
  isActive: boolean;
};

export type ScreenshotItem = {
  url: string;
  type: 'desktop' | 'mobile';
  caption?: string;
};

export type PerformanceMetrics = {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  testedAt?: string;
};

export type ProjectInput = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  imageUrl?: string | null;
  githubUrl?: string | null;
  liveUrl?: string | null;
  technologies: string[];
  category: string;
  date?: string | null;
  features: string[];
  challenges: string[];
  screenshots: ScreenshotItem[];
  performanceMetrics?: PerformanceMetrics | null;
  sortOrder: number;
  isActive: boolean;
};

export type SystemInput = {
  id?: string;
  name: string;
  slug: string;
  logoUrl: string;
  shortDescription: string;
  experience: string;
  projectLinks: string[];
  certificateLinks: string[];
  resourceLinks: string[];
  sortOrder: number;
  isActive: boolean;
};

export type CertificateInput = {
  id?: string;
  title: string;
  issuer: string;
  fileUrl: string;
  externalUrl?: string | null;
  issuedAt?: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type ChatSessionWithMessages = {
  id: string;
  visitorId: string;
  title: string | null;
  createdAt: string;
  messages: { id: string; role: string; content: string; createdAt: string }[];
};
