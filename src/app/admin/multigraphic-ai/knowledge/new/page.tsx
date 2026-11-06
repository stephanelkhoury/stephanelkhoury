import type { Metadata } from 'next';
import KnowledgeWorkspace from '@/components/operations/KnowledgeWorkspace';

export const metadata: Metadata = { title: 'Add Knowledge' };

export default function NewKnowledgePage() {
  return <KnowledgeWorkspace mode="new" />;
}