import type { Metadata } from 'next';
import KnowledgeWorkspace from '@/components/operations/KnowledgeWorkspace';

export const metadata: Metadata = { title: 'Knowledge Library' };

export default function KnowledgePage() {
  return <KnowledgeWorkspace />;
}