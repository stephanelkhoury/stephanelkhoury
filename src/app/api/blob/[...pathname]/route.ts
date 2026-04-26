import { get } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pathname: string[] }> }
) {
  const resolved = await params;
  const pathname = resolved.pathname.join('/');

  if (!pathname) {
    return NextResponse.json({ error: 'Missing pathname' }, { status: 400 });
  }

  const asset = await prisma.blobAsset.findUnique({ where: { pathname } });
  if (!asset || asset.source === 'health-check') {
    return new NextResponse('Not found', { status: 404 });
  }

  const result = await get(pathname, {
    access: 'private',
    ifNoneMatch: request.headers.get('if-none-match') ?? undefined,
  });

  if (!result) {
    return new NextResponse('Not found', { status: 404 });
  }

  if (result.statusCode === 304) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: result.blob.etag,
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
      },
    });
  }

  return new NextResponse(result.stream, {
    headers: {
      'Content-Type': result.blob.contentType || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      ETag: result.blob.etag,
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
    },
  });
}