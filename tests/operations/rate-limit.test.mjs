import assert from 'node:assert/strict';
import { test } from 'node:test';
import { consumeMemoryRateLimit, rateLimitClientKey } from '../../src/lib/operations/rate-limit-memory.ts';

test('memory fallback enforces a fixed window and resets after expiry', () => {
  const key = 'rate-limit-unit-window';
  assert.equal(consumeMemoryRateLimit(key, 2, 60_000, 10_000).allowed, true);
  assert.equal(consumeMemoryRateLimit(key, 2, 60_000, 20_000).allowed, true);
  const blocked = consumeMemoryRateLimit(key, 2, 60_000, 30_000);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfterSeconds, 40);
  assert.equal(consumeMemoryRateLimit(key, 2, 60_000, 70_000).allowed, true);
});

test('client rate-limit key uses the trusted real-ip header before forwarded-for', () => {
  const request = new Request('https://example.test', { headers: { 'x-real-ip': '192.0.2.4', 'x-forwarded-for': '198.51.100.3, 10.0.0.1' } });
  assert.equal(rateLimitClientKey(request, 'admin-login'), 'admin-login:shared');
  assert.equal(rateLimitClientKey(request, 'admin-login', 'x-real-ip'), 'admin-login:192.0.2.4');
  assert.equal(rateLimitClientKey(request, 'admin-login', 'x-forwarded-for'), 'admin-login:198.51.100.3');
  assert.equal(rateLimitClientKey(request, 'admin-login', 'x-forwarded-host'), 'admin-login:shared');
  assert.equal(rateLimitClientKey(new Request('https://example.test'), 'admin-login', 'x-real-ip'), 'admin-login:shared');
});
