export type SideEffectPolicy = 'READ_ONLY' | 'REVERSIBLE' | 'EXTERNAL';

export function authorizeOperationsTool(input: {
  toolName: string;
  allowedTools: readonly string[];
  sideEffectPolicy: SideEffectPolicy;
  requiresApproval: boolean;
  expectedActionHash?: string;
  approvedActionHash?: string;
}) {
  if (!input.allowedTools.includes(input.toolName)) return { allowed: false, reason: 'Tool is not allowlisted by the approved agent version.' };
  if ((input.requiresApproval || input.sideEffectPolicy === 'EXTERNAL') &&
      (!input.expectedActionHash || input.expectedActionHash !== input.approvedActionHash)) {
    return { allowed: false, reason: 'A matching approval for this exact action payload is required.' };
  }
  return { allowed: true as const };
}

export function isToolScopeAllowed(input: {
  requestedWorkspaceId: string;
  requestedProjectId: string;
  agentRunWorkspaceId: string;
  agentRunProjectId: string | null;
}) {
  return input.requestedWorkspaceId === input.agentRunWorkspaceId && input.requestedProjectId === input.agentRunProjectId;
}