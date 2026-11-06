import assert from 'node:assert/strict';
import { test } from 'node:test';
import { redactOperationalError } from '../../src/lib/operations/error-redaction.ts';

test('error logs redact bearer, credential assignments, URLs, and multiline details', () => {
  const result = redactOperationalError(new Error('Request failed Authorization: Bearer abc123 password=secret-value https://user:pass@example.test/path\nprivate document text'));
  assert.equal(result.includes('abc123'), false);
  assert.equal(result.includes('secret-value'), false);
  assert.equal(result.includes('user:pass'), false);
  assert.equal(result.includes('private document text'), false);
  assert.ok(result.includes('[redacted]'));
});

test('error logs are bounded and non-error values use a safe fallback', () => {
  assert.equal(redactOperationalError('unexpected'), 'Operation failed; details were redacted from activity logs.');
  assert.equal(redactOperationalError(new Error('x'.repeat(1000))).length, 320);
});
