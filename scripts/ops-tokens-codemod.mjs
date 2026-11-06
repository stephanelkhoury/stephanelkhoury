// One-off codemod: hard-coded Tailwind palette and var(--ops-*) arbitrary classes -> semantic ops-* tokens.
import { readFileSync, writeFileSync } from 'node:fs';

const files = process.argv.slice(2);
const legacyName = { bg: 'bg', surface: 'surface', 'surface-raised': 'surface-raised', border: 'border', text: 'text', muted: 'muted', subtle: 'subtle', blue: 'accent', violet: 'violet', green: 'green', amber: 'amber', red: 'red' };
const statusFamily = { rose: 'red', amber: 'amber', emerald: 'green', teal: 'green' };

function tintOpacity(opacity) {
  if (!opacity) return '';
  const raw = opacity.slice(1).replace(/[[\]]/g, '');
  const value = raw.includes('.') ? Number(raw) : Number(raw) / 100;
  return value < 0.05 ? '/[0.05]' : value < 0.08 ? '/[0.08]' : opacity;
}

function mapPalette(prefix, prop, family, shade, opacity) {
  const p = prop === 'divide' ? 'divide' : prop;
  if (family === 'white') {
    if (p === 'text') return `${prefix}text-ops-text`;
    if (p === 'bg') return opacity ? `${prefix}bg-ops-text${tintOpacity(opacity)}` : `${prefix}bg-ops-surface`;
    return `${prefix}${p}-ops-text${opacity ?? '/20'}`;
  }
  if (family === 'black') return `${prefix}${p}-ops-surface-raised`;
  const n = Number(shade);
  if (family === 'slate') {
    if (p === 'text' || p === 'placeholder') return `${prefix}${p}-${n >= 950 ? 'ops-on-accent' : n <= 300 ? 'ops-text' : n === 400 ? 'ops-muted' : 'ops-subtle'}${opacity ?? ''}`;
    if (p === 'bg') return `${prefix}bg-${n >= 950 ? 'ops-bg' : n === 900 ? 'ops-surface' : 'ops-surface-raised'}${opacity ?? ''}`;
    return `${prefix}${p}-${n >= 800 ? 'ops-border' : 'ops-border-strong'}${opacity ?? ''}`;
  }
  if (family === 'teal' && n <= 400) {
    if (p === 'bg') return `${prefix}bg-ops-accent-strong${prefix.includes('hover:') ? '/90' : opacity ?? ''}`;
    return `${prefix}${p}-ops-accent${opacity ?? ''}`;
  }
  const token = statusFamily[family];
  if (p === 'text') return `${prefix}text-ops-${token}`;
  if (p === 'bg') return n >= 900 ? `${prefix}bg-ops-${token}/10` : `${prefix}bg-ops-${token}${opacity ?? ''}`;
  return `${prefix}${p}-ops-${token}/40`;
}

const palette = /(?<![\w-])((?:[a-z-]+:)*)(text|bg|border|divide|ring|accent|placeholder)-(white|black|(slate|teal|rose|amber|emerald)-(\d{2,3}))(\/(?:\d+|\[[\d.]+\]))?(?![\w-])/g;
const arbitrary = /(?<![\w-])((?:[a-z-]+:)*)(text|bg|border|divide|ring|outline|fill|stroke|accent|decoration|from|to)-\[var\(--ops-(surface-raised|bg|surface|border|text|muted|subtle|blue|violet|green|amber|red)\)\](\/(?:\d+|\[[\d.]+\]))?/g;

let total = 0;
for (const file of files) {
  const before = readFileSync(file, 'utf8');
  let count = 0;
  const after = before
    .replace(arbitrary, (_m, prefix, prop, name, opacity) => { count += 1; return `${prefix}${prop}-ops-${legacyName[name]}${opacity ?? ''}`; })
    .replace(palette, (_m, prefix, prop, whole, family, shade, opacity) => { count += 1; return mapPalette(prefix, prop, family ?? whole, shade, opacity); });
  if (after !== before) writeFileSync(file, after);
  total += count;
  console.log(`${String(count).padStart(4)}  ${file}`);
}
console.log(`total ${total}`);
