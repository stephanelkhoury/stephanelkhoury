import type { Metadata } from 'next';
import HeadquartersWorkspace from '@/components/operations/HeadquartersWorkspace';

export const metadata: Metadata = { title: 'Multigraphic AI Headquarters' };

export default function HeadquartersPage() {
  return <HeadquartersWorkspace />;
}