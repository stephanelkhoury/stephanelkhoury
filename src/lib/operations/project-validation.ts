import { z } from 'zod';

const projectFields = {
  name: z.string().trim().min(2, 'Project name must be at least 2 characters.').max(120),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  summary: z.string().trim().max(500).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']).optional(),
  brief: z.string().trim().max(20000).optional(),
};

export const createOperationsProjectSchema = z.object(projectFields);

export const updateOperationsProjectSchema = z.object(projectFields).partial().refine(
  (value) => Object.keys(value).length > 0,
  'Provide at least one field to update.'
);

export function createProjectSlug(name: string) {
  return name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}