export type TaskApprovalState = {
  actionKey: string;
  actionHash: string;
  status: string;
};

export type TaskExecutionDecision =
  | { kind: 'RUN' }
  | { kind: 'SKIP' }
  | { kind: 'BLOCKED'; reason: string }
  | { kind: 'AWAITING_INPUT'; reason: string }
  | { kind: 'AWAITING_APPROVAL'; reason: string }
  | { kind: 'CANCELED' };

export function decideTaskExecution(input: {
  planAccepted: boolean;
  cancelRequested: boolean;
  taskStatus: string;
  dependencies: string[];
  hasAssignedAgent: boolean;
  agentApproved: boolean;
  requiresIsolatedCodeExecution: boolean;
  isolatedCodeExecutionConfigured: boolean;
  requiredApprovalKeys: string[];
  approvals: TaskApprovalState[];
  estimatedSpentUsd: number;
  nextTaskEstimatedUsd: number;
  budgetCapUsd: number | null;
}): TaskExecutionDecision {
  if (input.cancelRequested) return { kind: 'CANCELED' };
  if (input.taskStatus === 'SUCCEEDED' || input.taskStatus === 'CANCELED') return { kind: 'SKIP' };
  if (!input.planAccepted) return { kind: 'BLOCKED', reason: 'The owner has not accepted this plan.' };
  if (input.taskStatus !== 'QUEUED' && input.taskStatus !== 'RUNNING') return { kind: 'SKIP' };
  if (input.dependencies.some((status) => status !== 'SUCCEEDED')) return { kind: 'BLOCKED', reason: 'A required task has not succeeded.' };
  if (!input.hasAssignedAgent) return { kind: 'AWAITING_INPUT', reason: 'Assign an approved agent before this task can run.' };
  if (!input.agentApproved) return { kind: 'BLOCKED', reason: 'The assigned agent has no enabled, approved version.' };
  if (input.requiresIsolatedCodeExecution && !input.isolatedCodeExecutionConfigured) {
    return { kind: 'AWAITING_INPUT', reason: 'Code execution requires a configured isolated sandbox.' };
  }

  if (input.approvals.some((approval) => input.requiredApprovalKeys.includes(approval.actionKey) && ['REJECTED', 'CHANGES_REQUESTED'].includes(approval.status))) {
    return { kind: 'BLOCKED', reason: 'A required exact-action approval was rejected or needs revision.' };
  }

  const approvalsSatisfied = input.requiredApprovalKeys.every((actionKey) => input.approvals.some((approval) =>
    approval.actionKey === actionKey && approval.status === 'APPROVED' && /^[a-f0-9]{64}$/.test(approval.actionHash),
  ));
  if (!approvalsSatisfied) return { kind: 'AWAITING_APPROVAL', reason: 'A required exact-action approval is still pending.' };

  if (input.budgetCapUsd !== null && input.estimatedSpentUsd + input.nextTaskEstimatedUsd > input.budgetCapUsd) {
    return { kind: 'BLOCKED', reason: 'The next task would exceed the accepted run budget.' };
  }
  return { kind: 'RUN' };
}

export function workflowDispatchIdempotencyKey(workspaceId: string, runId: string, dispatchVersion: number) {
  return `workflow-run:${workspaceId}:${runId}:dispatch:${dispatchVersion}`;
}

export function workflowLeaseClaimConditions(leaseOwner: string, now: Date) {
  return [
    { status: 'QUEUED' as const },
    { status: 'RUNNING' as const, leaseOwner },
    { status: 'RUNNING' as const, leaseExpiresAt: { lt: now } },
  ];
}