export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number; storage: 'postgres' | 'memory' | 'unavailable' };

const memoryBuckets = new Map<string, { count: number; expiresAt: number }>();
let memoryCleanupCounter = 0;

export function consumeMemoryRateLimit(key: string, limit: number, windowMs: number, now = Date.now()): RateLimitResult {
  const existing = memoryBuckets.get(key);
  const bucket = !existing || existing.expiresAt <= now
    ? { count: 0, expiresAt: now + windowMs }
    : existing;
  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.expiresAt - now) / 1000)), storage: 'memory' };
  }
  bucket.count += 1;
  memoryBuckets.set(key, bucket);
  memoryCleanupCounter += 1;
  if (memoryCleanupCounter % 100 === 0) {
    for (const [bucketKey, value] of memoryBuckets) if (value.expiresAt <= now) memoryBuckets.delete(bucketKey);
  }
  return { allowed: true, retryAfterSeconds: 0, storage: 'memory' };
}

export function rateLimitClientKey(request: Request, scope: string, trustedHeader = process.env.RATE_LIMIT_TRUSTED_IP_HEADER?.toLowerCase()) {
  if (!trustedHeader || !['x-real-ip', 'x-forwarded-for'].includes(trustedHeader)) return `${scope}:shared`;
  const rawAddress = request.headers.get(trustedHeader);
  const address = trustedHeader === 'x-forwarded-for' ? rawAddress?.split(',')[0]?.trim() : rawAddress?.trim();
  return `${scope}:${address || 'shared'}`;
}