import type { Metadata } from 'next';
import OperationsProjectWorkspace from '@/components/operations/OperationsProjectWorkspace';

export const metadata: Metadata = { title: 'Operations Project' };

export default async function OperationsProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <OperationsProjectWorkspace mode="detail" projectId={projectId} />;
}