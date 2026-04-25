import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const revalidate = 60; // ISR: revalidate every 60 seconds

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ projects: [] });
  }

  try {
    const projects = await prisma.project.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ projects });
  } catch {
    return NextResponse.json({ projects: [] });
  }
}
