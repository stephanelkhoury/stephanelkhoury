import type { Metadata } from 'next';
import KnowledgeWorkspace from '@/components/operations/KnowledgeWorkspace';

export const metadata: Metadata = { title: 'Knowledge Record' };

export default async function KnowledgeDetailPage({ params }: { params: Promise<{ documentId: string }> }) {
  const { documentId } = await params;
  return <KnowledgeWorkspace mode="detail" documentId={documentId} />;
}