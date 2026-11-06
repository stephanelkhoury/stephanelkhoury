import type { WebsiteDeliveryPlan } from './workflow-plan';

export type WebsiteProjectFile = { path: string; content: string | Uint8Array };

export function websiteCopyOverridesFromOutputs(
  website: WebsiteDeliveryPlan['website'],
  outputs: Array<{ output: unknown }>,
) {
  const allowedSections = new Map(website.pages.flatMap((page) => page.sections.map((section) => [`${page.path}#${section.key}`, page.language] as const)));
  const overrides: Record<string, string> = {};
  for (const { output } of outputs) {
    if (typeof output !== 'object' || output === null || !('content' in output) || !Array.isArray(output.content)) continue;
    for (const item of output.content) {
      if (typeof item !== 'object' || item === null || !('section' in item) || !('language' in item) || !('text' in item)) continue;
      if (typeof item.section !== 'string' || typeof item.language !== 'string' || typeof item.text !== 'string') continue;
      if (allowedSections.get(item.section) !== item.language || item.text.trim().length < 20 || item.text.length > 2000) continue;
      overrides[item.section] = item.text.trim();
    }
  }
  return overrides;
}

function escapeHtml(value: string) {
  const replacements: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return value.replace(/[&<>"']/g, (character) => replacements[character]!);
}

function routeFilePath(route: string) {
  if (!/^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)*$/.test(route)) throw new Error(`Unsafe website route: ${route}`);
  return route === '/' ? 'index.html' : `${route.slice(1)}index.html`;
}

function siteNameSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'marketing-site';
}

function directionFor(language: string) {
  return /^(ar|fa|he|ur)(?:-|$)/i.test(language) ? 'rtl' : 'ltr';
}

function validateColor(value: string) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(value)) throw new Error('Website visual tokens must be six-digit hexadecimal colors.');
  return value;
}

function renderPage(input: {
  projectName: string;
  page: WebsiteDeliveryPlan['website']['pages'][number];
  pages: WebsiteDeliveryPlan['website']['pages'];
  visualTokens: WebsiteDeliveryPlan['website']['visualTokens'];
  copyOverrides: Record<string, string>;
}) {
  const { projectName, page, pages, visualTokens, copyOverrides } = input;
  const nav = pages.map((item) => `<a href="${escapeHtml(item.path)}"${item.path === page.path ? ' aria-current="page"' : ''}>${escapeHtml(item.title)}</a>`).join('\n        ');
  const sections = page.sections.map((section) => {
    const copyKey = `${page.path}#${section.key}`;
    const copy = copyOverrides[copyKey]?.trim() || section.draftCopy;
    const image = section.image
      ? `<figure class="section-image"><img src="/assets/${encodeURIComponent(section.image.name)}" alt="${escapeHtml(section.image.altText)}"></figure>`
      : '';
    const action = section.primaryAction
      ? `<p class="section-action"><a class="button" href="${escapeHtml(section.primaryAction.targetPath)}">${escapeHtml(section.primaryAction.label)}</a></p>`
      : '';
    return `<section class="content-section" id="${escapeHtml(section.key)}">
      <h2>${escapeHtml(section.heading)}</h2>
      ${image}
      <p>${escapeHtml(copy)}</p>
      ${action}
    </section>`;
  }).join('\n');
  const firstSection = page.sections[0];
  const firstCopy = firstSection ? copyOverrides[`${page.path}#${firstSection.key}`]?.trim() || firstSection.draftCopy : page.purpose;
  const css = `:root{--site-bg:${validateColor(visualTokens.background)};--site-surface:${validateColor(visualTokens.surface)};--site-text:${validateColor(visualTokens.text)};--site-muted:${validateColor(visualTokens.muted)};--site-accent:${validateColor(visualTokens.accent)};--site-border:${validateColor(visualTokens.border)};--site-heading:${visualTokens.headingTypeface === 'SERIF' ? 'Georgia, "Times New Roman", serif' : 'ui-sans-serif, system-ui, sans-serif'};--site-body:${visualTokens.bodyTypeface === 'SERIF' ? 'Georgia, "Times New Roman", serif' : 'ui-sans-serif, system-ui, sans-serif'}}
*{box-sizing:border-box}html{background:var(--site-bg);color:var(--site-text);font-family:var(--site-body);line-height:1.6}body{margin:0;min-width:320px}a{color:var(--site-accent);text-underline-offset:.2em}a:focus-visible{outline:3px solid var(--site-accent);outline-offset:3px}.site-header,.site-footer{padding:1.1rem max(1.25rem,calc((100vw - 72rem)/2));border-bottom:1px solid var(--site-border)}.site-header{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap}.brand{font-family:var(--site-heading);font-size:1.2rem;font-weight:700;color:var(--site-text);text-decoration:none}.site-nav{display:flex;flex-wrap:wrap;gap:.45rem 1rem}.site-nav a{font-size:.92rem;color:var(--site-text)}.site-nav a[aria-current=page]{text-decoration-thickness:2px}.page-main{width:min(72rem,100% - 2.5rem);margin-inline:auto;padding:clamp(3rem,8vw,7rem) 0}.page-hero{max-width:54rem;padding-bottom:3rem;border-bottom:1px solid var(--site-border)}.eyebrow{margin:0 0 .75rem;color:var(--site-muted);font-size:.8rem;font-weight:700;text-transform:uppercase}.page-hero h1{max-width:16ch;margin:0;font-family:var(--site-heading);font-size:clamp(2.6rem,6vw,5.5rem);line-height:1.02}.page-hero .lead{max-width:58ch;margin:1.4rem 0 0;color:var(--site-muted);font-size:1.15rem}.section-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,22rem),1fr));gap:1px;margin-top:3rem;background:var(--site-border);border:1px solid var(--site-border)}.content-section{min-width:0;padding:clamp(1.25rem,3vw,2rem);background:var(--site-bg)}.content-section h2{margin:0 0 .8rem;font-family:var(--site-heading);font-size:1.65rem;line-height:1.15}.content-section p{max-width:62ch}.button{display:inline-flex;min-height:2.75rem;align-items:center;justify-content:center;padding:.65rem 1rem;border:1px solid var(--site-accent);background:var(--site-accent);color:#fff;font-weight:700;text-decoration:none}.button:focus-visible{outline-color:var(--site-text)}.site-footer{border-top:1px solid var(--site-border);border-bottom:0;color:var(--site-muted);font-size:.85rem}.site-footer p{margin:0}.skip-link{position:absolute;left:1rem;top:-5rem;padding:.7rem 1rem;background:var(--site-bg);color:var(--site-text);z-index:2}.skip-link:focus{top:1rem}@media(max-width:640px){.site-header{align-items:flex-start;flex-direction:column}.site-nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));width:100%;gap:.25rem .75rem}.site-nav a{padding:.35rem 0}.page-main{width:calc(100% - 2rem);padding:3rem 0}.page-hero{padding-bottom:2rem}.section-grid{grid-template-columns:minmax(0,1fr);margin-top:2rem}}@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;transition-duration:.01ms!important}}`;
  const responsiveCss = css
    .replace('font-size:clamp(2.6rem,6vw,5.5rem)', 'font-size:4rem')
    .replace('@media(max-width:640px){', '@media(max-width:640px){.page-hero h1{font-size:2.6rem}');

  const html = `<!doctype html>
<html lang="${escapeHtml(page.language)}" dir="${directionFor(page.language)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(page.metaTitle)}</title>
  <meta name="description" content="${escapeHtml(page.metaDescription)}">
  <meta property="og:title" content="${escapeHtml(page.metaTitle)}">
  <meta property="og:description" content="${escapeHtml(page.metaDescription)}">
  <meta name="color-scheme" content="light">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <a class="brand" href="/">${escapeHtml(projectName)}</a>
    <nav class="site-nav" aria-label="Primary navigation">
        ${nav}
    </nav>
  </header>
  <main class="page-main" id="main">
    <header class="page-hero">
      <p class="eyebrow">${escapeHtml(projectName)}</p>
      <h1>${escapeHtml(page.title)}</h1>
      <p class="lead">${escapeHtml(firstCopy)}</p>
    </header>
    <div class="section-grid">
      ${sections}
    </div>
  </main>
  <footer class="site-footer"><p>${escapeHtml(projectName)}</p></footer>
</body>
</html>`;
  return { html, css: responsiveCss };
}

export function createWebsiteProjectFiles(input: {
  projectName: string;
  website: WebsiteDeliveryPlan['website'];
  copyOverrides?: Record<string, string>;
  assets?: Array<{ name: string; content: Uint8Array }>;
}): WebsiteProjectFile[] {
  const { projectName, website, copyOverrides = {}, assets = [] } = input;
  const assetsByName = new Map(assets.map((asset) => [asset.name, asset]));
  const referencedAssets = website.pages.flatMap((page) => page.sections.flatMap((section) => section.image ? [section.image.name] : []));
  for (const assetName of referencedAssets) {
    if (!assetsByName.has(assetName)) throw new Error(`Approved website asset ${assetName} is unavailable in the scoped project knowledge.`);
  }
  for (const asset of assets) {
    if (!/^[A-Za-z0-9][A-Za-z0-9._ -]{0,155}\.(?:png|jpe?g|webp)$/i.test(asset.name)) throw new Error(`Unsafe or unsupported website asset filename: ${asset.name}`);
  }
  const renderedPages = website.pages.map((page) => ({
    page,
    ...renderPage({ projectName, page, pages: website.pages, visualTokens: website.visualTokens, copyOverrides }),
  }));
  const pageFiles = renderedPages.map(({ page, html }) => ({ path: `src/${routeFilePath(page.path)}`, content: html }));
  const assetNotes = website.brandAssets.length
    ? website.brandAssets.map((asset) => `- ${asset.name}: ${asset.provenance}; license ${asset.licenseStatus}; source ${asset.source}`).join('\n')
    : '- No assets were included.';
  const copyNotes = website.pages.flatMap((page) => page.sections.flatMap((section) => section.claimsToVerify.map((claim) => `- ${page.path} / ${section.heading}: ${claim}`)));
  const packageName = siteNameSlug(projectName);

  return [
    ...pageFiles,
    ...assets.map((asset) => ({ path: `src/assets/${asset.name}`, content: asset.content })),
    { path: 'src/styles.css', content: renderedPages[0]?.css ?? '' },
    { path: 'package.json', content: JSON.stringify({ name: packageName, private: true, type: 'module', scripts: { build: 'node scripts/build.mjs', preview: 'node scripts/preview.mjs' } }, null, 2) },
    { path: 'scripts/build.mjs', content: `import { cp, mkdir, rm } from 'node:fs/promises';\n\nawait rm('dist', { recursive: true, force: true });\nawait mkdir('dist', { recursive: true });\nawait cp('src', 'dist', { recursive: true });\nconsole.log('Built ${escapeHtml(projectName)} into dist/.');\n` },
    { path: 'scripts/preview.mjs', content: `import { createReadStream, existsSync } from 'node:fs';\nimport { createServer } from 'node:http';\nimport { extname, join, normalize } from 'node:path';\n\nconst root = join(process.cwd(), 'dist');\nconst types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };\ncreateServer((request, response) => {\n  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);\n  const candidate = normalize(join(root, pathname));\n  const file = candidate.startsWith(root) ? (existsSync(candidate) && extname(candidate) ? candidate : join(candidate, 'index.html')) : '';\n  if (!file || !existsSync(file)) { response.writeHead(404); response.end('Not found'); return; }\n  response.setHeader('Content-Type', types[extname(file)] ?? 'application/octet-stream');\n  createReadStream(file).pipe(response);\n}).listen(Number(process.env.PORT ?? 4173), '127.0.0.1');\n` },
    { path: 'ASSET_PROVENANCE.md', content: `# Asset provenance\n\n${assetNotes}\n\nOnly the project brief and approved project knowledge may authorize supplied assets. No external stock assets, fonts, or unverified logos are bundled by this service. Resolve any uncertain license before public use.\n` },
    { path: 'CONTENT_REVIEW.md', content: `# Content review\n\nFactual claims that still require source or owner verification:\n\n${copyNotes.length ? copyNotes.join('\n') : '- None were flagged by the accepted plan.'}\n\nAll AI-generated copy remains unverified until the owner checks it against source material. No testimonials, certifications, prices, client results, or business facts are added by the renderer.\n` },
    { path: 'README.md', content: `# ${projectName}\n\nThis is a static marketing website generated from an owner-reviewed specification. It contains no runtime dependencies.\n\n## Build\n\nRequires Node.js 20 or newer. Run npm run build to create dist/. Run npm run preview to serve the built site locally on port 4173.\n\n## Scope and provenance\n\nThis source archive does not include e-commerce, payment processing, authentication, deployment, or public publishing. See ASSET_PROVENANCE.md and CONTENT_REVIEW.md before distribution.\n` },
  ];
}