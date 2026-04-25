import { z } from 'zod';

export const blockSchema = z.object({
  id: z.string().optional(),
  slug: z.string(),
  type: z.enum(['HERO', 'ABOUT', 'EXPERIENCE', 'CONTACT']),
  title: z.string(),
  subtitle: z.string().nullable().optional(),
  content: z.any(),
  sortOrder: z.number().int().nonnegative(),
  isActive: z.boolean(),
});

export const screenshotSchema = z.object({
  url: z.string(),
  type: z.enum(['desktop', 'mobile']),
  caption: z.string().optional(),
});

export const performanceMetricsSchema = z.object({
  performance: z.number().min(0).max(100),
  accessibility: z.number().min(0).max(100),
  bestPractices: z.number().min(0).max(100),
  seo: z.number().min(0).max(100),
  testedAt: z.string().optional(),
});

export const projectSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  slug: z.string(),
  summary: z.string(),
  description: z.string(),
  imageUrl: z.string().nullable().optional(),
  githubUrl: z.string().nullable().optional(),
  liveUrl: z.string().nullable().optional(),
  technologies: z.array(z.string()),
  category: z.string(),
  date: z.string().nullable().optional(),
  features: z.array(z.string()).default([]),
  challenges: z.array(z.string()).default([]),
  screenshots: z.array(screenshotSchema).default([]),
  performanceMetrics: performanceMetricsSchema.nullable().optional(),
  sortOrder: z.number().int().nonnegative(),
  isActive: z.boolean(),
});

export const systemSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  slug: z.string(),
  logoUrl: z.string(),
  shortDescription: z.string(),
  experience: z.string(),
  projectLinks: z.array(z.string()),
  certificateLinks: z.array(z.string()),
  resourceLinks: z.array(z.string()),
  sortOrder: z.number().int().nonnegative(),
  isActive: z.boolean(),
});

export const certificateSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  issuer: z.string(),
  fileUrl: z.string(),
  externalUrl: z.string().nullable().optional(),
  issuedAt: z.string().nullable().optional(),
  sortOrder: z.number().int().nonnegative(),
  isActive: z.boolean(),
});

export const blocksPayloadSchema = z.object({
  blocks: z.array(blockSchema),
});

export const projectsPayloadSchema = z.object({
  projects: z.array(projectSchema),
});

export const systemsPayloadSchema = z.object({
  systems: z.array(systemSchema),
});

export const certificatesPayloadSchema = z.object({
  certificates: z.array(certificateSchema),
});
