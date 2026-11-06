import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

// The 3D headquarters scene draws physical materials, so its colours are intentionally literal.
const EXEMPT = new Set(['HeadquartersScene.tsx', 'HeadquartersWorkspace.tsx']);
const PALETTE = /(?<![\w-])(?:[a-z-]+:)*(?:text|bg|border|divide|ring|placeholder|accent|from|to)-(?:white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3})(?![\w-])/g;
const ARBITRARY_COLOR = /-\[(?:#[0-9a-f]{3,8}|var\(--ops-[a-z-]+\))\]/gi;

function sources(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory()
    ? (entry.name === 'headquarters' ? [] : sources(join(dir, entry.name)))
    : entry.name.endsWith('.tsx') && !EXEMPT.has(entry.name) ? [join(dir, entry.name)] : []);
}

test('dashboard components use semantic ops-* design tokens instead of hard-coded colours', () => {
  const offenders = [];
  for (const file of [...sources('src/components/operations'), ...sources('src/app/admin/multigraphic-ai')]) {
    const text = readFileSync(file, 'utf8');
    for (const match of [...text.matchAll(PALETTE), ...text.matchAll(ARBITRARY_COLOR)]) offenders.push(`${file}: ${match[0]}`);
  }
  assert.deepEqual(offenders, [], `Use ops-* tokens (bg-ops-surface, text-ops-muted, border-ops-border, bg-ops-accent-strong…):\n${offenders.join('\n')}`);
});

test('both themes define every semantic token', () => {
  const css = readFileSync('src/app/admin/multigraphic-ai/theme.css', 'utf8');
  const tokens = ['bg', 'surface', 'surface-raised', 'border', 'border-strong', 'text', 'muted', 'subtle', 'accent', 'accent-strong', 'on-accent', 'blue', 'violet', 'green', 'amber', 'red'];
  for (const theme of ['light', 'dark']) {
    const block = css.split(`.ops-app[data-theme='${theme}'] {`)[1]?.split('}')[0] ?? '';
    for (const token of tokens) assert.match(block, new RegExp(`--ops-${token}-rgb:`), `${theme} theme is missing --ops-${token}-rgb`);
  }
});
