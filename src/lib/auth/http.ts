import { NextRequest, NextResponse } from 'next/server';
import { ZodType } from 'zod';
import { readBoundedJsonBody } from '@/lib/bounded-json-body';
import { requestOriginAllowed } from '@/lib/auth/context';
import { consumeRateLimit } from '@/lib/rate-limit';
import { rateLimitClientKey } from '@/lib/operations/rate-limit-memory';

export const fail = (error: string, status: number, headers?: HeadersInit) => NextResponse.json({ error }, { status, headers });

// Public auth endpoints must come from our own origin and stay small and rate limited.
export async function readAuthBody<T>(request: NextRequest, schema: ZodType<T>, rate: { scope: string; max: number; windowMs?: number }) {
  if (!requestOriginAllowed(request)) return { error: fail('Cross-origin requests are not allowed.', 403) } as const;
  const limit = await consumeRateLimit(rateLimitClientKey(request, rate.scope), rate.max, rate.windowMs ?? 15 * 60 * 1000);
  if (limit.storage === 'unavailable') return { error: fail('Sign-in protection is unavailable.', 503) } as const;
  if (!limit.allowed) return { error: fail('Too many attempts. Try again later.', 429, { 'Retry-After': String(limit.retryAfterSeconds) }) } as const;
  const body = await readBoundedJsonBody(request.body, 4096);
  if (!body.ok) return { error: fail(body.reason === 'too-large' ? 'Request is too large.' : 'Request body must be valid JSON.', body.reason === 'too-large' ? 413 : 400) } as const;
  const parsed = schema.safeParse(body.value);
  if (!parsed.success) return { error: fail('Check the form and try again.', 400) } as const;
  return { data: parsed.data } as const;
}
