import { tasks, runs } from '@trigger.dev/sdk';
import type { executeWorkflowRun } from '@/trigger/workflow-run';
import type { executeMeeting } from '@/trigger/meeting-run';
import { LOCAL_RUN_PREFIX, cancelLocalWorkflowRun, localWorkerEnabled, startLocalMeeting, startLocalWorkflowRun } from '@/lib/operations/local-worker';
import { isModelProviderConfigured, resolveModelProvider } from '@/lib/operations/model-provider';

export function workflowWorkerConfigured() {
  return localWorkerEnabled() || Boolean(process.env.TRIGGER_SECRET_KEY);
}

export function executionReadiness(modelProvider?: string | null): { connected: boolean; reason: string } {
  if (!workflowWorkerConfigured()) return { connected: false, reason: 'No workflow worker is configured (local worker or Trigger.dev).' };
  let provider;
  try { provider = resolveModelProvider(modelProvider); } catch { return { connected: false, reason: 'The agent model provider is unsupported.' }; }
  if (!isModelProviderConfigured(provider)) return { connected: false, reason: `${provider} is not configured on the server.` };
  return { connected: true, reason: `${localWorkerEnabled() ? 'Local worker' : 'Trigger.dev'} with ${provider}.` };
}

export type WorkflowDispatchResult =
  | { dispatched: true; externalRunId: string }
  | { dispatched: false; reason: string };

export async function dispatchWorkflowRun(workspaceId: string, runId: string, dispatchVersion = 0): Promise<WorkflowDispatchResult> {
  if (localWorkerEnabled()) return { dispatched: true, externalRunId: startLocalWorkflowRun(workspaceId, runId) };
  if (!process.env.TRIGGER_SECRET_KEY) {
    return { dispatched: false, reason: 'No workflow worker is configured. Set MULTIGRAPHIC_LOCAL_WORKER=1 for local runs or TRIGGER_SECRET_KEY for Trigger.dev.' };
  }

  const handle = await tasks.trigger<typeof executeWorkflowRun>(
    'multigraphic-workflow-run',
    { workspaceId, runId },
    {
      idempotencyKey: `workflow-run:${workspaceId}:${runId}:dispatch:${dispatchVersion}`,
      idempotencyKeyTTL: '30d',
      queue: 'multigraphic-workflows',
      concurrencyKey: workspaceId,
      maxAttempts: 3,
      maxDuration: 1800,
    },
  );

  return { dispatched: true, externalRunId: handle.id };
}

export async function dispatchMeeting(workspaceId: string, meetingId: string): Promise<WorkflowDispatchResult> {
  if (localWorkerEnabled()) return { dispatched: true, externalRunId: startLocalMeeting(workspaceId, meetingId) };
  if (!process.env.TRIGGER_SECRET_KEY) return { dispatched: false, reason: 'No workflow worker is configured for meetings.' };
  const handle = await tasks.trigger<typeof executeMeeting>('multigraphic-meeting-run', { workspaceId, meetingId }, { idempotencyKey: `meeting:${workspaceId}:${meetingId}`, idempotencyKeyTTL: '30d', maxAttempts: 1, maxDuration: 1800 });
  return { dispatched: true, externalRunId: handle.id };
}

export async function cancelDispatchedRun(externalRunId: string) {
  if (externalRunId.startsWith(LOCAL_RUN_PREFIX)) return cancelLocalWorkflowRun(externalRunId);
  if (!process.env.TRIGGER_SECRET_KEY) return false;
  await runs.cancel(externalRunId);
  return true;
}