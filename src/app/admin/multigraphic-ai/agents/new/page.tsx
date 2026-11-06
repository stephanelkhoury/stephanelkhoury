import type { Metadata } from 'next';
import AgentWorkspace from '@/components/operations/AgentWorkspace';

export const metadata: Metadata = { title: 'New Agent Definition' };

export default function NewAgentPage() {
  return <AgentWorkspace />;
}