import type { Metadata } from 'next';
import ActivityWorkspace from '@/components/operations/ActivityWorkspace';

export const metadata: Metadata = { title: 'Activity | Multigraphic AI' };

export default function ActivityPage() {
  return <ActivityWorkspace />;
}