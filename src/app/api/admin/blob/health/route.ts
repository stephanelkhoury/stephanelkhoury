import { NextRequest, NextResponse } from 'next/server';
import { del, get, put } from '@vercel/blob';
import { isAdminRequest } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'BLOB_READ_WRITE_TOKEN is not configured. Add it in Vercel and .env.local.' },
      { status: 500 }
    );
  }

  const startedAt = Date.now();
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const testPath = `healthchecks/admin-${stamp}.txt`;
  const payload = `blob-health-${stamp}`;

  let blobUrl = '';
  let blobPathname = '';

  try {
    const uploaded = await put(testPath, payload, {
      access: 'private',
      addRandomSuffix: true,
      contentType: 'text/plain',
    });

    blobUrl = uploaded.url;
    blobPathname = uploaded.pathname;

    const fetched = await get(blobPathname, { access: 'private' });
    const blobReadOk = fetched?.statusCode === 200;

    const meta = await prisma.blobAsset.create({
      data: {
        url: blobUrl,
        pathname: blobPathname,
        contentType: 'text/plain',
        size: payload.length,
        source: 'health-check',
      },
    });

    await prisma.blobAsset.delete({ where: { id: meta.id } });
    await del(blobUrl);

    const tookMs = Date.now() - startedAt;
    return NextResponse.json({
      ok: blobReadOk,
      checks: {
        blobWrite: true,
        blobRead: blobReadOk,
        blobDelete: true,
        neonWrite: true,
        neonDelete: true,
      },
      tookMs,
    });
  } catch (error) {
    if (blobUrl) {
      await del(blobUrl).catch(() => null);
    }

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Blob health check failed',
      },
      { status: 500 }
    );
  }
}