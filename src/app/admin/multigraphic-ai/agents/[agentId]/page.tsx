import type { Metadata } from 'next';
import AgentWorkspace from '@/components/operations/AgentWorkspace';

export const metadata: Metadata = { title: 'Agent Definition' };

export default async function AgentDetailPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params;
  return <AgentWorkspace agentId={agentId} />;
}