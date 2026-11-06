import type { Metadata } from 'next';
import IntegrationsWorkspace from '@/components/operations/IntegrationsWorkspace';

export const metadata: Metadata = { title: 'Integrations | Multigraphic AI' };

export default function IntegrationsPage() {
  return <IntegrationsWorkspace />;
}