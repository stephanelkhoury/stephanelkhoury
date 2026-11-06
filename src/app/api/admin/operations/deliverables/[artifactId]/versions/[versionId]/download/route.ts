import { get } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeOperationsRequest, operationsAccessError } from '@/lib/operations/auth';

export const runtime = 'nodejs';

type RouteContext = { params: Promise<{ artifactId: string; versionId: string }> };

function safeFilename(value: string) {
  return value.replace(/[\r\n"\\/]/g, '_').slice(0, 150) || 'deliverable';
}

function fileExtension(contentType: string | null, textContent: string | null) {
  if (textContent !== null) return contentType?.includes('json') ? '.json' : '.txt';
  if (contentType === 'application/gzip') return '.tar.gz';
  if (contentType === 'image/png') return '.png';
  if (contentType === 'image/jpeg') return '.jpg';
  if (contentType === 'application/pdf') return '.pdf';
  return '';
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const access = await authorizeOperationsRequest(request);
  if (!access.ok) return operationsAccessError(access);
  const { artifactId, versionId } = await params;

  try {
    const version = await prisma.artifactVersion.findFirst({
      where: { workspaceId: access.workspaceId, artifactId, id: versionId },
      select: { storageKey: true, textContent: true, contentType: true, version: true, artifact: { select: { title: true } } },
    });
    if (!version) return new NextResponse('Not found', { status: 404 });
    const fileName = `${safeFilename(`${version.artifact.title}-v${version.version}`)}${fileExtension(version.contentType, version.textContent)}`;
    const inlineImage = request.nextUrl.searchParams.get('inline') === '1' && ['image/png', 'image/jpeg'].includes(version.contentType ?? '');
    const disposition = inlineImage ? 'inline' : 'attachment';

    if (version.textContent !== null) {
      return new NextResponse(version.textContent, {
        headers: {
          'Content-Type': version.contentType ?? 'text/plain; charset=utf-8',
          'Content-Disposition': `${disposition}; filename="${fileName}"`,
          'X-Content-Type-Options': 'nosniff',
          'Cache-Control': 'private, no-store',
        },
      });
    }
    if (!version.storageKey) return NextResponse.json({ error: 'This version has no downloadable content.' }, { status: 404 });

    const blob = await get(version.storageKey, { access: 'private', useCache: false });
    if (!blob || blob.statusCode !== 200) return new NextResponse('Not found', { status: 404 });
    return new NextResponse(blob.stream, {
      headers: {
        'Content-Type': version.contentType ?? 'application/octet-stream',
        'Content-Disposition': `${disposition}; filename="${fileName}"`,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Private deliverable could not be retrieved.' }, { status: 503 });
  }
}