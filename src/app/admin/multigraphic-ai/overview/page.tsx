import type { Metadata } from 'next';
import OperationsDashboard from '@/components/operations/OperationsDashboard';

export const metadata: Metadata = { title: 'Multigraphic AI Overview' };

export default function OperationsOverviewPage() {
  return <OperationsDashboard />;
}