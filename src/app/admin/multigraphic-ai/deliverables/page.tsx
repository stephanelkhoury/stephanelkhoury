import type { Metadata } from 'next';
import DeliverablesWorkspace from '@/components/operations/DeliverablesWorkspace';

export const metadata: Metadata = { title: 'Deliverables | Multigraphic AI' };

export default function DeliverablesPage() {
  return <DeliverablesWorkspace />;
}