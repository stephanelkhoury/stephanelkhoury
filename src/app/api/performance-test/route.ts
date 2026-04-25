import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Rate limiting: simple in-memory tracker
const requestLog = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 3; // max 3 tests per minute per IP

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { url } = body;

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json({ error: 'URL must use http or https' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
  }

  // Basic rate limiting
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const key = `${clientIp}:${Math.floor(now / RATE_LIMIT_WINDOW)}`;
  const count = requestLog.get(key) || 0;
  if (count >= MAX_REQUESTS) {
    return NextResponse.json({ error: 'Rate limited. Try again in a minute.' }, { status: 429 });
  }
  requestLog.set(key, count + 1);

  // Clean old entries
  for (const [k, ] of requestLog) {
    const windowKey = parseInt(k.split(':').pop() || '0');
    if (windowKey < Math.floor(now / RATE_LIMIT_WINDOW) - 1) {
      requestLog.delete(k);
    }
  }

  try {
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(parsedUrl.toString())}&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO&strategy=mobile`;

    const response = await fetch(apiUrl, {
      signal: AbortSignal.timeout(120000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Performance test failed' }, { status: 502 });
    }

    const data = await response.json();
    const categories = data.lighthouseResult?.categories;

    if (!categories) {
      return NextResponse.json({ error: 'Could not parse results' }, { status: 502 });
    }

    return NextResponse.json({
      performance: Math.round((categories.performance?.score ?? 0) * 100),
      accessibility: Math.round((categories.accessibility?.score ?? 0) * 100),
      bestPractices: Math.round((categories['best-practices']?.score ?? 0) * 100),
      seo: Math.round((categories.seo?.score ?? 0) * 100),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Test failed: ${message}` }, { status: 500 });
  }
}
