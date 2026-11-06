import { randomUUID } from 'node:crypto';

// Kept on globalThis so in-flight jobs stay cancellable across dev-server hot reloads.
const registry = globalThis as typeof globalThis & { __multigraphicLocalJobs?: Map<string, AbortController> };
const controllers = (registry.__multigraphicLocalJobs ??= new Map<string, AbortController>());

export const LOCAL_RUN_PREFIX = 'local:';

// Runs in the Next.js server process; serverless platforms would freeze it after the response.
export function localWorkerEnabled() {
  return process.env.MULTIGRAPHIC_LOCAL_WORKER === '1' && !process.env.VERCEL;
}

export function startLocalJob(label: string, job: (signal: AbortSignal, jobId: string) => Promise<void>) {
  const id = `${LOCAL_RUN_PREFIX}${randomUUID()}`;
  const controller = new AbortController();
  controllers.set(id, controller);
  setImmediate(() => {
    void job(controller.signal, id)
      .catch(error => console.error(`[local-worker] ${label} failed:`, error))
      .finally(() => controllers.delete(id));
  });
  return id;
}

export function startLocalWorkflowRun(workspaceId: string, runId: string) {
  return startLocalJob(`run ${runId}`, async (signal, jobId) => {
    const { runWorkflow, markWorkflowFailed } = await import('@/trigger/workflow-run');
    try {
      await runWorkflow({ workspaceId, runId }, { leaseOwner: jobId, signal });
    } catch (error) {
      await markWorkflowFailed({ workspaceId, runId }, error).catch(() => undefined);
      throw error;
    }
  });
}

export function startLocalMeeting(workspaceId: string, meetingId: string) {
  return startLocalJob(`meeting ${meetingId}`, async signal => {
    const { runMeeting } = await import('@/lib/operations/meetings');
    await runMeeting(workspaceId, meetingId, signal);
  });
}

export function cancelLocalJob(id: string) {
  const controller = controllers.get(id);
  controller?.abort();
  return Boolean(controller);
}

export const cancelLocalWorkflowRun = cancelLocalJob;

export function activeLocalJobCount() {
  return controllers.size;
}
