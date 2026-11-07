import type { Metadata } from 'next';
import TeamWorkspace from '@/components/operations/TeamWorkspace';

export const metadata: Metadata = { title: 'Team | Multigraphic AI' };

export default function TeamPage() {
  return <TeamWorkspace />;
}
