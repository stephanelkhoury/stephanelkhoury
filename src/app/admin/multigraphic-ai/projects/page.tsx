import type { Metadata } from 'next';
import OperationsProjectWorkspace from '@/components/operations/OperationsProjectWorkspace';

export const metadata: Metadata = { title: 'Projects | Multigraphic AI' };

export default function OperationsProjectsPage() {
  return <OperationsProjectWorkspace />;
}