import { z } from 'zod';
import { profileDeskRooms } from './company-catalog.ts';

const color = z.string().regex(/^#[0-9a-f]{6}$/i);
export const characterProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(100),
  jobTitle: z.string().trim().min(2).max(120),
  department: z.string().trim().min(2).max(100),
  communicationStyle: z.string().trim().max(2000),
  roomKey: z.string().max(80),
  deskKey: z.string().max(80),
  appearance: z.object({
    skinTone: color, hairColor: color, clothingColor: color, accentColor: color,
    hairStyle: z.enum(['short-wavy', 'curly-bob', 'side-swept', 'short-coils', 'long-braid', 'wavy-medium']),
    accessory: z.enum(['none', 'glasses', 'headset', 'headphones', 'tablet', 'notebook', 'pencil']),
  }).strict(),
}).strict().refine(value => profileDeskRooms[value.deskKey] === value.roomKey, { message: 'Choose a desk in the selected room.', path: ['deskKey'] });
