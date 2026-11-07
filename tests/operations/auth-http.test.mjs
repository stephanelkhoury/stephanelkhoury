import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { PrismaClient } from '@prisma/client';
import { currentTotp } from '../../src/lib/auth/totp.ts';
import { unseal } from '../../src/lib/auth/crypto.ts';

const base = process.env.OPERATIONS_TEST_BASE_URL;
const database = process.env.OPERATIONS_TEST_DATABASE_URL;
const token = process.env.OPERATIONS_TEST_ADMIN_TOKEN ?? 'local-operations-test-token';
if (base && !['127.0.0.1', 'localhost'].includes(new URL(base).hostname)) throw new Error('HTTP checks require a local server.');
if (database && (!['127.0.0.1', 'localhost'].includes(new URL(database).hostname) || !new URL(database).pathname.startsWith('/multigraphic_ai_validation_'))) throw new Error('Checks require a disposable local validation database.');
process.env.ADMIN_DASHBOARD_TOKEN = token;
const enabled = Boolean(base && database);
const options = { skip: enabled ? false : 'Set OPERATIONS_TEST_BASE_URL and OPERATIONS_TEST_DATABASE_URL.' };
const origin = base;

async function http(path, { method = 'GET', body, cookie, bearer = false, headers = {}, withOrigin = true } = {}) {
  const response = await fetch(`${base}${path}`, {
    method,
    redirect: 'manual',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...(bearer ? { Authorization: `Bearer ${token}` } : {}),
      ...(withOrigin && method !== 'GET' ? { Origin: origin } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  let data = null;
  try { data = JSON.parse(text); } catch { data = null; }
  return { status: response.status, data, setCookie: response.headers.get('set-cookie') ?? '', location: response.headers.get('location') ?? '' };
}

const cookieOf = result => (result.setCookie.match(/admin_session=[^;]+/) ?? [''])[0];
const PASSWORD = 'Correct-Horse-9battery';

async function invite(role) {
  const email = `auth-${randomUUID().slice(0, 8)}@example.test`;
  const created = await http('/api/admin/team', { method: 'POST', bearer: true, body: { name: 'Auth Test', email, role } });
  assert.equal(created.status, 201, JSON.stringify(created.data));
  const inviteToken = new URL(created.data.setupUrl).searchParams.get('token');
  const reset = await http('/api/admin/auth/reset', { method: 'POST', body: { token: inviteToken, password: PASSWORD } });
  assert.equal(reset.status, 200, JSON.stringify(reset.data));
  return { email, inviteToken, id: created.data.user.id };
}

test('email and password sign-in creates a revocable session', options, async () => {
  const prisma = new PrismaClient({ datasources: { db: { url: database } } });
  try {
    await prisma.rateLimitBucket.deleteMany();
    const member = await invite('MEMBER');

    assert.equal((await http('/api/admin/auth/login', { method: 'POST', body: { email: member.email, password: 'wrong-password-1' } })).status, 401);
    assert.equal((await http('/api/admin/auth/login', { method: 'POST', body: { email: 'nobody@example.test', password: PASSWORD } })).status, 401, 'unknown email must look the same as a wrong password');
    assert.equal((await http('/api/admin/auth/login', { method: 'POST', body: { email: member.email, password: PASSWORD }, withOrigin: false })).status, 403, 'cross-origin sign-in is refused');
    assert.equal((await http('/api/admin/auth/login', { method: 'POST', body: { password: PASSWORD } })).status, 400, 'a password alone is no longer enough');

    const login = await http('/api/admin/auth/login', { method: 'POST', body: { email: member.email, password: PASSWORD } });
    assert.equal(login.status, 200);
    assert.equal(login.data.user.role, 'MEMBER');
    assert.match(login.setCookie, /HttpOnly/i);
    const cookie = cookieOf(login);
    assert.ok(cookie);

    const session = await http('/api/admin/auth/session', { cookie });
    assert.equal(session.status, 200);
    assert.equal(session.data.user.email, member.email);

    assert.equal((await http('/api/admin/operations/agents', { cookie })).status, 200, 'members can use the operations workspace');
    assert.equal((await http('/api/admin/team', { cookie })).status, 403, 'members cannot manage the team');
    assert.equal((await http('/api/admin/projects', { cookie })).status, 401, 'members cannot use the website CMS');

    const page = await http('/admin/multigraphic-ai/overview', { cookie });
    assert.equal(page.status, 200);
    assert.equal((await http('/admin/multigraphic-ai/overview')).status, 307, 'signed-out visitors are redirected');

    assert.equal((await http('/api/admin/auth/logout', { method: 'POST', cookie })).status, 200);
    assert.equal((await http('/api/admin/auth/session', { cookie })).status, 401, 'a signed-out cookie stops working at once');
  } finally {
    await prisma.$disconnect();
  }
});

test('failed attempts lock the account and a reset link unlocks it', options, async () => {
  const prisma = new PrismaClient({ datasources: { db: { url: database } } });
  try {
    await prisma.rateLimitBucket.deleteMany();
    const member = await invite('MEMBER');
    for (let attempt = 0; attempt < 5; attempt += 1) await http('/api/admin/auth/login', { method: 'POST', body: { email: member.email, password: 'wrong-password-1' } });
    assert.equal((await http('/api/admin/auth/login', { method: 'POST', body: { email: member.email, password: PASSWORD } })).status, 423, 'locked even with the right password');

    const reset = await http(`/api/admin/team/${member.id}`, { method: 'POST', bearer: true, body: { action: 'reset-link' } });
    assert.equal(reset.status, 200);
    const resetToken = new URL(reset.data.setupUrl).searchParams.get('token');
    assert.equal((await http('/api/admin/auth/reset', { method: 'POST', body: { token: resetToken, password: 'short' } })).status, 400, 'weak passwords are refused');
    assert.equal((await http('/api/admin/auth/reset', { method: 'POST', body: { token: resetToken, password: PASSWORD } })).status, 200);
    assert.equal((await http('/api/admin/auth/reset', { method: 'POST', body: { token: resetToken, password: PASSWORD } })).status, 400, 'a reset link works only once');
    assert.equal((await http('/api/admin/auth/login', { method: 'POST', body: { email: member.email, password: PASSWORD } })).status, 200);

    const forgot = await http('/api/admin/auth/forgot', { method: 'POST', body: { email: 'nobody@example.test' } });
    const forgotKnown = await http('/api/admin/auth/forgot', { method: 'POST', body: { email: member.email } });
    assert.equal(forgot.status, 200);
    assert.deepEqual(forgotKnown.data, forgot.data, 'the reset form never reveals which emails exist');
  } finally {
    await prisma.$disconnect();
  }
});

test('two-factor codes, session list and client access', options, async () => {
  const prisma = new PrismaClient({ datasources: { db: { url: database } } });
  try {
    await prisma.rateLimitBucket.deleteMany();
    const admin = await invite('ADMIN');
    const first = cookieOf(await http('/api/admin/auth/login', { method: 'POST', body: { email: admin.email, password: PASSWORD } }));
    const second = cookieOf(await http('/api/admin/auth/login', { method: 'POST', body: { email: admin.email, password: PASSWORD } }));
    assert.equal((await http('/api/admin/team', { cookie: first })).status, 200, 'admins can manage the team');

    const setup = await http('/api/admin/auth/account', { method: 'POST', cookie: first, body: { action: 'totp-setup' } });
    assert.equal(setup.status, 200);
    assert.match(setup.data.qr, /^data:image\/png;base64,/);
    assert.equal((await http('/api/admin/auth/account', { method: 'POST', cookie: first, body: { action: 'totp-enable', code: '000000' } })).status, 400);
    const stored = await prisma.user.findUniqueOrThrow({ where: { id: admin.id } });
    assert.ok(stored.totpSecret && !stored.totpSecret.includes(setup.data.secret), 'the secret is stored encrypted');
    assert.equal(unseal(stored.totpSecret), setup.data.secret);
    assert.equal((await http('/api/admin/auth/account', { method: 'POST', cookie: first, body: { action: 'totp-enable', code: currentTotp(setup.data.secret) } })).status, 200);

    const needs = await http('/api/admin/auth/login', { method: 'POST', body: { email: admin.email, password: PASSWORD } });
    assert.equal(needs.data.needsCode, true);
    assert.equal(needs.setCookie, '', 'no session before the code is entered');
    assert.equal((await http('/api/admin/auth/login', { method: 'POST', body: { email: admin.email, password: PASSWORD, code: '123456' } })).status, 401);
    const withCode = await http('/api/admin/auth/login', { method: 'POST', body: { email: admin.email, password: PASSWORD, code: currentTotp(setup.data.secret) } });
    assert.equal(withCode.status, 200);

    const list = await http('/api/admin/auth/sessions', { cookie: first });
    assert.ok(list.data.sessions.length >= 3);
    assert.equal(list.data.sessions.filter(item => item.current).length, 1);
    assert.equal((await http('/api/admin/auth/sessions', { method: 'POST', cookie: first, body: { action: 'revoke-others' } })).status, 200);
    assert.equal((await http('/api/admin/auth/session', { cookie: second })).status, 401, 'signing out everywhere ends other sessions');
    assert.equal((await http('/api/admin/auth/session', { cookie: first })).status, 200);

    const client = await invite('CLIENT');
    const clientCookie = cookieOf(await http('/api/admin/auth/login', { method: 'POST', body: { email: client.email, password: PASSWORD } }));
    assert.equal((await http('/api/admin/operations/agents', { cookie: clientCookie })).status, 403, 'clients cannot use the staff workspace');
    assert.equal((await http('/api/admin/team', { cookie: clientCookie })).status, 403);

    const disabled = await http(`/api/admin/team/${client.id}`, { method: 'POST', bearer: true, body: { action: 'disable' } });
    assert.equal(disabled.status, 200);
    assert.equal((await http('/api/admin/auth/session', { cookie: clientCookie })).status, 401, 'disabling a person ends their sessions');
    assert.equal((await http('/api/admin/auth/login', { method: 'POST', body: { email: client.email, password: PASSWORD } })).status, 401);
  } finally {
    await prisma.$disconnect();
  }
});

test('the API token still works for automation and the owner cannot be changed', options, async () => {
  assert.equal((await http('/api/admin/operations/agents', { bearer: true })).status, 200);
  const team = await http('/api/admin/team', { bearer: true });
  assert.equal(team.status, 200);
  const owner = team.data.members.find(member => member.role === 'OWNER');
  assert.ok(owner);
  assert.equal((await http(`/api/admin/team/${owner.id}`, { method: 'POST', bearer: true, body: { action: 'disable' } })).status, 403);
});
