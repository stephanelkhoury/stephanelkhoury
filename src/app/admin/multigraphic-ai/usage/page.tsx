import type { Metadata } from 'next';
import UsageWorkspace from '@/components/operations/UsageWorkspace';

export const metadata: Metadata = { title: 'Usage | Multigraphic AI' };

export default function UsagePage() {
  return <UsageWorkspace />;
}