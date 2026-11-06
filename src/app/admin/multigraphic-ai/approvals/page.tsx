import type { Metadata } from 'next';
import ApprovalsWorkspace from '@/components/operations/ApprovalsWorkspace';

export const metadata: Metadata = { title: 'Approvals | Multigraphic AI' };

export default function ApprovalsPage() {
  return <ApprovalsWorkspace />;
}