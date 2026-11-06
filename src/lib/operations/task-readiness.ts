export function taskReadiness(input: {
  status: string; accepted: boolean; cancelRequested: boolean; enabled: boolean; approved: boolean;
  dependencies: Array<{ title: string; status: string }>; approvals: Array<{ status: string }>;
}) {
  if (['SUCCEEDED', 'DONE'].includes(input.status)) return { state: 'COMPLETE', reason: 'Recorded output is available.' };
  if (input.status === 'CANCELED' || input.cancelRequested) return { state: 'CANCELED', reason: 'Cancellation is recorded.' };
  if (input.status === 'RUNNING' || input.status === 'IN_PROGRESS') return { state: 'RUNNING', reason: 'Execution is recorded as in progress.' };
  if (!input.accepted) return { state: 'OWNER', reason: 'The plan needs owner acceptance.' };
  const waiting = input.dependencies.filter(task => !['SUCCEEDED', 'DONE'].includes(task.status));
  if (waiting.length) return { state: 'DEPENDENCIES', reason: `Waiting for ${waiting.map(task => task.title).join(', ')}.` };
  if (!input.enabled || !input.approved) return { state: 'CONFIGURATION', reason: 'The assigned agent needs an enabled, approved version.' };
  if (input.approvals.some(approval => ['REJECTED', 'CHANGES_REQUESTED'].includes(approval.status))) return { state: 'BLOCKED', reason: 'An owner decision requires changes.' };
  if (input.approvals.some(approval => approval.status === 'PENDING')) return { state: 'OWNER', reason: 'An exact action is awaiting owner approval.' };
  if (input.status === 'FAILED') return { state: 'FAILED', reason: 'Execution failed. Review its recorded error.' };
  if (['BLOCKED', 'AWAITING_INPUT'].includes(input.status)) return { state: 'BLOCKED', reason: 'Review the run blocker before resuming.' };
  return { state: 'READY', reason: 'Dependencies and approvals are satisfied; dispatch and runtime checks still apply.' };
}
