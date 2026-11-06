import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canonicalJson, sha256Json } from '../../src/lib/operations/json-hash.ts';

test('canonical JSON hashes remain stable when object keys are reordered', () => {
  const first = { action: 'review', payload: { title: 'Deliverable', criteria: ['one', 'two'] } };
  const second = { payload: { criteria: ['one', 'two'], title: 'Deliverable' }, action: 'review' };
  assert.equal(canonicalJson(first), canonicalJson(second));
  assert.equal(sha256Json(first), sha256Json(second));
});