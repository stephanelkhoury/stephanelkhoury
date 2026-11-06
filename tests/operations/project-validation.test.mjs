import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createOperationsProjectSchema,
  createProjectSlug,
  updateOperationsProjectSchema,
} from '../../src/lib/operations/project-validation.ts';

test('creates URL-safe slugs from project names', () => {
  const accentedName = `Cr${String.fromCharCode(0xE9)}ation / Website 2026`;
  assert.equal(createProjectSlug(accentedName), 'creation-website-2026');
  assert.equal(createProjectSlug('---'), '');
});

test('validates new projects and allows an omitted slug to be generated', () => {
  const parsed = createOperationsProjectSchema.safeParse({ name: 'Client website', brief: 'Discovery and delivery.' });
  assert.equal(parsed.success, true);
});

test('rejects invalid slugs and empty updates', () => {
  assert.equal(createOperationsProjectSchema.safeParse({ name: 'Valid name', slug: 'Not a valid slug' }).success, false);
  assert.equal(updateOperationsProjectSchema.safeParse({}).success, false);
});
