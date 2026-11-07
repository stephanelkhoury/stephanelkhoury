import assert from 'node:assert/strict';
import { test } from 'node:test';

const base = process.env.OPERATIONS_TEST_BASE_URL;
if (base && !['localhost', '127.0.0.1', '::1'].includes(new URL(base).hostname)) throw new Error('Integration HTTP tests must use a local validation server.');
const headers = { authorization: `Bearer ${process.env.OPERATIONS_TEST_ADMIN_TOKEN ?? 'local-operations-test-token'}`, 'Content-Type': 'application/json', origin: base ?? '' };

test('integration HTTP routes enforce auth, redact secrets, validate input, and clear OAuth state', { skip: !base }, async () => {
  let response = await fetch(base + '/api/admin/operations/integrations');
  assert.equal(response.status, 401);
  response = await fetch(base + '/api/admin/operations/integrations', { headers });
  assert.equal(response.status, 200);
  const catalog = await response.json();
  assert.equal(catalog.required.filter(item => item.key === 'perplexity').length, 1);
  for (const connection of catalog.connected) assert.equal(connection.settings, undefined);
  for (const item of catalog.required) assert.equal(item.value, undefined);
  response = await fetch(base + '/api/admin/operations/integrations/research', { method: 'POST', headers, body: JSON.stringify({ provider: 'unsupported', query: 'test' }) });
  assert.equal(response.status, 400);
  response = await fetch(base + '/api/admin/operations/integrations/research', { method: 'POST', headers, body: JSON.stringify({ provider: 'firecrawl', query: 'https://127.0.0.1/private' }) });
  assert.equal(response.status, 400);
  response = await fetch(base + '/api/admin/operations/integrations/research', { method: 'POST', headers: { ...headers, origin: 'https://another.example' }, body: JSON.stringify({ provider: 'perplexity', query: 'test' }) });
  assert.equal(response.status, 403);
  response = await fetch(base + '/api/admin/operations/integrations/google/callback?state=bad&code=bad', { headers, redirect: 'manual' });
  assert.equal(response.status, 307);
  assert.ok(response.headers.get('location').includes('/admin/multigraphic-ai/integrations?google=failed'));
  assert.ok(response.headers.get('set-cookie').includes('Path=/api/admin/operations/integrations/google;'));
  assert.ok(response.headers.get('set-cookie').includes('Max-Age=0'));
});

test('research HTTP flow persists provider verification and returns source links with a mocked provider', { skip: !base || process.env.OPERATIONS_TEST_RESEARCH_FIXTURE !== '1' }, async () => {
  let response = await fetch(base + '/api/admin/operations/integrations', { method: 'POST', headers, body: JSON.stringify({ provider: 'perplexity' }) });
  assert.equal(response.status, 200); assert.equal((await response.json()).tested, true);
  response = await fetch(base + '/api/admin/operations/integrations', { headers });
  assert.ok((await response.json()).connected.some(item => item.provider === 'perplexity' && item.status === 'CONNECTED'));
  response = await fetch(base + '/api/admin/operations/integrations/research', { method: 'POST', headers, body: JSON.stringify({ provider: 'perplexity', query: 'Local fixture verification' }) });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.ok(result.text.includes('Local test fixture')); assert.equal(result.sources.length, 1);
  assert.equal(result.sources[0].url, 'https://docs.perplexity.ai/docs/agent-api/quickstart');
});
