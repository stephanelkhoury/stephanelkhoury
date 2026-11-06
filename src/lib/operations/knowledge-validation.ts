import { z } from 'zod';

const scopes = ['COMPANY', 'OWNER_PREFERENCES', 'CLIENT', 'PROJECT', 'AGENT_INSTRUCTIONS', 'LESSONS_LEARNED'] as const;
const evidenceStatuses = ['OWNER_CONFIRMED', 'SOURCE_SUPPORTED', 'ASSUMPTION', 'UNVERIFIED'] as const;

export const knowledgeScopeSchema = z.enum(scopes);

const optionalId = z.preprocess(
  (value) => typeof value === 'string' && value.trim() === '' ? undefined : value,
  z.string().trim().min(1).max(100).optional()
);

export const createKnowledgeRecordSchema = z.object({
  title: z.string().trim().min(2).max(180),
  scope: z.enum(scopes),
  source: z.string().trim().min(2).max(500),
  evidenceStatus: z.enum(evidenceStatuses),
  clientId: optionalId,
  projectId: optionalId,
  agentDefinitionId: optionalId,
  content: z.string().trim().max(250000).optional(),
}).strict().superRefine((record, context) => {
  if (record.scope === 'CLIENT' && !record.clientId) {
    context.addIssue({ code: 'custom', path: ['clientId'], message: 'Select a client for client-scoped knowledge.' });
  }
  if (record.scope === 'PROJECT' && !record.projectId) {
    context.addIssue({ code: 'custom', path: ['projectId'], message: 'Select a project for project-scoped knowledge.' });
  }
  if (record.scope === 'AGENT_INSTRUCTIONS' && !record.agentDefinitionId) {
    context.addIssue({ code: 'custom', path: ['agentDefinitionId'], message: 'Select an agent for agent instructions.' });
  }
  if (record.scope === 'AGENT_INSTRUCTIONS' && (record.clientId || record.projectId)) {
    context.addIssue({ code: 'custom', path: ['scope'], message: 'Agent instructions cannot be attached to a client or project.' });
  }
  if (record.scope === 'LESSONS_LEARNED' && !record.clientId && !record.projectId) {
    context.addIssue({ code: 'custom', path: ['projectId'], message: 'Lessons learned must be scoped to a client or project.' });
  }
  if ((record.scope === 'COMPANY' || record.scope === 'OWNER_PREFERENCES') && (record.clientId || record.projectId || record.agentDefinitionId)) {
    context.addIssue({ code: 'custom', path: ['scope'], message: 'Company and owner knowledge cannot be attached to a client, project, or agent.' });
  }
});

export function createKnowledgeScopeFilter(input: {
  scope: typeof scopes[number];
  clientId?: string;
  projectId?: string;
  agentDefinitionId?: string;
}) {
  if (input.scope === 'CLIENT') {
    if (!input.clientId) throw new Error('Client scope requires an exact client ID.');
    return { scope: input.scope, clientId: input.clientId };
  }
  if (input.scope === 'PROJECT') {
    if (!input.projectId) throw new Error('Project scope requires an exact project ID.');
    return { scope: input.scope, projectId: input.projectId };
  }
  if (input.scope === 'AGENT_INSTRUCTIONS') {
    if (!input.agentDefinitionId) throw new Error('Agent-instruction scope requires an exact agent ID.');
    if (input.clientId || input.projectId) throw new Error('Agent instructions cannot include client or project scope.');
    return { scope: input.scope, agentDefinitionId: input.agentDefinitionId };
  }
  if (input.scope === 'LESSONS_LEARNED') {
    if (!input.clientId && !input.projectId) throw new Error('Lessons learned require an exact client or project scope.');
    return { scope: input.scope, ...(input.clientId && { clientId: input.clientId }), ...(input.projectId && { projectId: input.projectId }) };
  }
  if (input.clientId || input.projectId || input.agentDefinitionId) {
    throw new Error('This knowledge scope cannot include client, project, or agent filters.');
  }
  return { scope: input.scope };
}
