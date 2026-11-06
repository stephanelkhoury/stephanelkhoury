import type { Metadata } from 'next';
import MeetingsWorkspace from '@/components/operations/MeetingsWorkspace';

export const metadata: Metadata = { title: 'Meetings | Multigraphic AI' };

export default function MeetingsPage() {
  return <MeetingsWorkspace />;
}
