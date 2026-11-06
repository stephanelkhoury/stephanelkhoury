import { agentVersionContractSchema } from './agent-validation.ts';

export type ContractCheck = { key: string; label: string; passed: boolean; detail: string };

// Contract lint is deterministic. It is deliberately separate from a live agent performance evaluation.
export function evaluateAgentContract(contract: unknown, registeredTools: readonly string[]) {
  const parsed = agentVersionContractSchema.safeParse(contract);
  if (!parsed.success) return { passed: false, checks: [{ key: 'schema', label: 'Complete version contract', passed: false, detail: parsed.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ').slice(0, 4000) }] };
  const value = parsed.data;
  const checks: ContractCheck[] = [
    { key: 'schema', label: 'Complete version contract', passed: true, detail: 'Required fields and output schema are valid.' },
    { key: 'provider', label: 'Supported model provider', passed: !value.modelProvider || ['gemini', 'anthropic', 'openai', 'ollama'].includes(value.modelProvider.toLowerCase()), detail: value.modelProvider || 'Uses the configured server default.' },
    { key: 'tools', label: 'Registered tool allowlist', passed: value.allowedTools.every(tool => registeredTools.includes(tool)), detail: value.allowedTools.filter(tool => !registeredTools.includes(tool)).join(', ') || 'Every declared tool is registered.' },
    { key: 'tool-budget', label: 'Tool budget matches the contract', passed: value.allowedTools.length === 0 || value.maxToolCalls > 0, detail: `${value.allowedTools.length} allowed tool(s); ${value.maxToolCalls} calls maximum.` },
    { key: 'budget', label: 'Positive model budget', passed: value.budgetUsd > 0, detail: `USD ${value.budgetUsd.toFixed(2)} contract budget.` },
    { key: 'evidence', label: 'Evidence and escalation policy', passed: value.evaluationCriteria.length > 0 && value.escalationConditions.length > 0 && value.approvalRequirements.length > 0, detail: 'Evaluation, escalation, and owner approval requirements are recorded.' },
  ];
  return { passed: checks.every(check => check.passed), checks };
}
