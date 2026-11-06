import { task } from '@trigger.dev/sdk';
import { runMeeting } from '@/lib/operations/meetings';

export const executeMeeting = task({
  id: 'multigraphic-meeting-run',
  queue: { name: 'multigraphic-meetings', concurrencyLimit: 2 },
  retry: { maxAttempts: 1 },
  maxDuration: 1800,
  run: ({ workspaceId, meetingId }: { workspaceId: string; meetingId: string }, { signal }) => runMeeting(workspaceId, meetingId, signal),
});
