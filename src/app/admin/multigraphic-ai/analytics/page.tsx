import type { Metadata } from 'next';
import AnalyticsWorkspace from '@/components/operations/AnalyticsWorkspace';

export const metadata: Metadata = { title: 'Analytics | Multigraphic AI' };

export default function AnalyticsPage() {
  return <AnalyticsWorkspace />;
}
