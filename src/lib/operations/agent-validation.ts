import { z } from 'zod';

const departments = [
  'PROJECT_MANAGEMENT',
  'STRATEGY_RESEARCH',
  'BRAND_DESIGN',
  'SOFTWARE_ENGINEERING',
  'QUALITY_ASSURANCE',
  'SEO_CONTENT',
  'MEDIA_PRODUCTION',
  'BUSINESS_OPERATIONS',
  'ADVERTISING',
  'SOCIAL_MEDIA',
  'MARKETING_PERFORMANCE',
  'GRAPHIC_DESIGN',
  'MOTION_ANIMATION',
  'PHOTOGRAPHY',
  'LANGUAGE_COPY',
  'FINANCE',
] as const;

const knowledgeScopes = [
  'COMPANY',
  'OWNER_PREFERENCES',
  'CLIENT',
  'PROJECT',
  'AGENT_INSTRUCTIONS',
  'LESSONS_LEARNED',
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validJsonSchema(value: unknown, depth = 0): value is Record<string, unknown> {
  if (!isRecord(value) || depth > 16) return false;

  const types = ['object', 'array', 'string', 'number', 'integer', 'boolean', 'null'];
  const typeValue = value.type;
  if (!(typeof typeValue === 'string' && types.includes(typeValue)) &&
      !(Array.isArray(typeValue) && typeValue.length > 0 && typeValue.every((item) => typeof item === 'string' && types.includes(item)))) {
    return false;
  }

  if (value.properties !== undefined) {
    if (!isRecord(value.properties)) return false;
    if (!Object.values(value.properties).every((property) => validJsonSchema(property, depth + 1))) return false;
  }

  if (value.required !== undefined) {
    if (!Array.isArray(value.required) || !value.required.every((item) => typeof item === 'string')) return false;
    const properties = value.properties;
    if (isRecord(properties) && !value.required.every((item) => item in properties)) return false;
  }

  if (value.items !== undefined && !validJsonSchema(value.items, depth + 1)) return false;
  if (value.additionalProperties !== undefined && typeof value.additionalProperties !== 'boolean' && !validJsonSchema(value.additionalProperties, depth + 1)) return false;
  if (value.enum !== undefined && (!Array.isArray(value.enum) || value.enum.length === 0)) return false;
  if (value.format !== undefined && typeof value.format !== 'string') return false;
  if (value.minLength !== undefined && (!Number.isInteger(value.minLength) || Number(value.minLength) < 0)) return false;
  if (value.maxLength !== undefined && (!Number.isInteger(value.maxLength) || Number(value.maxLength) < 0)) return false;
  if (value.minimum !== undefined && typeof value.minimum !== 'number') return false;
  if (value.maximum !== undefined && typeof value.maximum !== 'number') return false;
  if (value.minItems !== undefined && (!Number.isInteger(value.minItems) || Number(value.minItems) < 0)) return false;
  if (value.maxItems !== undefined && (!Number.isInteger(value.maxItems) || Number(value.maxItems) < 0)) return false;

  return true;
}

export function isValidAgentOutputSchema(value: unknown) {
  return validJsonSchema(value) && value.type === 'object' && value.additionalProperties === false &&
    isRecord(value.properties) && Object.keys(value.properties).length > 0 && Array.isArray(value.required);
}

const requiredInputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  required: z.boolean(),
  description: z.string().trim().max(500).optional(),
}).strict();

const outputSchema = z.unknown().refine(isValidAgentOutputSchema, 'Output schema must be a strict JSON Schema object with valid properties and required fields.');

export const agentVersionContractSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(8).max(500),
  department: z.enum(departments),
  purpose: z.string().trim().min(10).max(4000),
  responsibilities: z.array(z.string().trim().min(3).max(500)).min(1).max(30),
  exclusions: z.array(z.string().trim().min(3).max(500)).max(30),
  requiredInputs: z.array(requiredInputSchema).min(1).max(30),
  outputSchema,
  allowedTools: z.array(z.string().trim().regex(/^[a-zA-Z0-9._:-]+$/).max(100)).max(30),
  knowledgeScopes: z.array(z.enum(knowledgeScopes)).min(1),
  instructions: z.string().trim().min(20).max(30000),
  modelProvider: z.enum(['gemini', 'anthropic', 'openai', 'ollama']).nullable(),
  modelId: z.string().trim().max(160).nullable(),
  budgetUsd: z.number().min(0).max(100),
  maxDurationSeconds: z.number().int().min(1).max(3600),
  maxToolCalls: z.number().int().min(0).max(100),
  maxOutputTokens: z.number().int().min(1).max(32000),
  maxInputCharacters: z.number().int().min(100).max(100000),
  escalationConditions: z.array(z.string().trim().min(3).max(500)).min(1).max(30),
  approvalRequirements: z.array(z.string().trim().min(3).max(500)).min(1).max(30),
  evaluationCriteria: z.array(z.string().trim().min(3).max(500)).min(1).max(30),
}).strict();

export const createAgentSchema = z.object({
  key: z.string().trim().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
}).extend(agentVersionContractSchema.shape).strict();

export type AgentVersionContractInput = z.infer<typeof agentVersionContractSchema>;
