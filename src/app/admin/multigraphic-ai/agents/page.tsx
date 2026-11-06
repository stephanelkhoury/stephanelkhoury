import type { Metadata } from 'next';
import AgentRegistry from '@/components/operations/AgentRegistry';

export const metadata: Metadata = { title: 'Agent Registry' };

export default function AgentRegistryPage() {
  return <AgentRegistry />;
}