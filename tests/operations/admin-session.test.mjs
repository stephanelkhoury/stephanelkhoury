import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ADMIN_SESSION_TTL_SECONDS, constantTimeStringEqual, createAdminSession, isAdminRequestAllowed, isAllowedAdminMutationOrigin, verifyAdminSession } from '../../src/lib/admin-session.ts';
import { verifyAdminSessionEdge } from '../../src/lib/admin-session-edge.ts';
import { readBoundedJsonBody } from '../../src/lib/bounded-json-body.ts';

test('admin sessions are signed, time-limited, and tamper-evident', async () => {
  const now = 1_800_000_000;
  const session = createAdminSession('test-only-token', now);

  assert.equal(verifyAdminSession(session.value, 'test-only-token', now), true);
  assert.equal(await verifyAdminSessionEdge(session.value, 'test-only-token', now), true);
  assert.equal(session.expiresAt, now + ADMIN_SESSION_TTL_SECONDS);
  assert.equal(verifyAdminSession(session.value, 'wrong-token', now), false);
  assert.equal(await verifyAdminSessionEdge(session.value, 'wrong-token', now), false);
  assert.equal(verifyAdminSession(session.value, 'test-only-token', session.expiresAt), false);
  assert.equal(verifyAdminSession(`${session.value}x`, 'test-only-token', now), false);
  assert.equal(await verifyAdminSessionEdge(`${session.value}x`, 'test-only-token', now), false);
  assert.equal(verifyAdminSession('test-only-token', 'test-only-token', now), false);
});

test('admin token equality rejects unequal and truncated values', () => {
  assert.equal(constantTimeStringEqual('same-token', 'same-token'), true);
  assert.equal(constantTimeStringEqual('same-token', 'same-toke'), false);
  assert.equal(constantTimeStringEqual('short', 'longer'), false);
});

test('admin cookie mutations require an exact same-origin request', () => {
  assert.equal(isAllowedAdminMutationOrigin({ origin: 'http://127.0.0.1:3333', requestHost: '127.0.0.1:3333', requestProtocol: 'http:', fetchSite: 'same-origin' }), true);
  assert.equal(isAllowedAdminMutationOrigin({ origin: 'https://evil.example', requestHost: 'example.com', requestProtocol: 'https:', fetchSite: 'same-site' }), false);
  assert.equal(isAllowedAdminMutationOrigin({ origin: null, requestHost: 'example.com', requestProtocol: 'https:', fetchSite: 'same-origin' }), false);
  assert.equal(isAllowedAdminMutationOrigin({ origin: 'https://evil.example', requestHost: 'example.com', requestProtocol: 'https:', fetchSite: 'cross-site' }), false);
});

test('invalid Bearer headers cannot bypass CSRF checks on a valid admin cookie', () => {
  const previous = process.env.ADMIN_DASHBOARD_TOKEN;
  process.env.ADMIN_DASHBOARD_TOKEN = 'admin-session-test-secret';
  const cookie = createAdminSession(process.env.ADMIN_DASHBOARD_TOKEN).value;
  try {
    const base = { token: 'admin-session-test-secret', cookieSession: cookie, method: 'POST', requestHost: 'admin.example.test', requestProtocol: 'https:', fetchSite: 'same-origin' };
    assert.equal(isAdminRequestAllowed({ ...base, origin: 'https://admin.example.test', authorization: null }), true);
    assert.equal(isAdminRequestAllowed({ ...base, origin: 'https://evil.example', fetchSite: 'cross-site', authorization: 'Bearer invalid' }), false);
    assert.equal(isAdminRequestAllowed({ ...base, cookieSession: undefined, origin: 'https://automation.example', authorization: 'Bearer admin-session-test-secret' }), true);
  } finally {
    if (previous === undefined) delete process.env.ADMIN_DASHBOARD_TOKEN;
    else process.env.ADMIN_DASHBOARD_TOKEN = previous;
  }
});

test('login JSON byte limits apply to streamed bodies without Content-Length', async () => {
  const encoder = new TextEncoder();
  const valid = await readBoundedJsonBody(new ReadableStream({ start(controller) { controller.enqueue(encoder.encode('{"password":"ok"}')); controller.close(); } }), 32);
  const oversized = await readBoundedJsonBody(new ReadableStream({ start(controller) { controller.enqueue(encoder.encode(' '.repeat(33))); controller.close(); } }), 32);
  const invalid = await readBoundedJsonBody(new ReadableStream({ start(controller) { controller.enqueue(encoder.encode('{broken')); controller.close(); } }), 32);
  assert.deepEqual(valid, { ok: true, value: { password: 'ok' } });
  assert.deepEqual(oversized, { ok: false, reason: 'too-large' });
  assert.deepEqual(invalid, { ok: false, reason: 'invalid-json' });
});
