import type { Metadata } from 'next';
import OperationsProjectWorkspace from '@/components/operations/OperationsProjectWorkspace';

export const metadata: Metadata = { title: 'New Operations Project' };

export default function NewOperationsProjectPage() {
  return <OperationsProjectWorkspace mode="new" />;
}