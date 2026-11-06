import { Sandbox } from '@vercel/sandbox';
import type { NetworkPolicy } from '@vercel/sandbox';
import type { WebsiteProjectFile } from './website-project';
import { WebsiteSandboxUnavailableError, websiteSandboxBlocker } from './website-sandbox-policy';

const BROWSER_TOOL_INSTALL_NETWORK: NetworkPolicy = { allow: ['registry.npmjs.org'] };
const BROWSER_TOOLS_PATH = '/tmp/multigraphic-browser-tools';
const PROJECT_ROOT = '/vercel/website-project';

function credentials() {
  const blocker = websiteSandboxBlocker();
  if (blocker) throw new WebsiteSandboxUnavailableError(blocker);
  if (process.env.VERCEL_OIDC_TOKEN) return {};
  return {
    token: process.env.VERCEL_TOKEN!,
    teamId: process.env.VERCEL_TEAM_ID!,
    projectId: process.env.VERCEL_PROJECT_ID!,
  };
}

const browserCheckScript = String.raw`
const { createServer } = require('node:http');
const { createReadStream, existsSync } = require('node:fs');
const { extname, join, normalize } = require('node:path');
const { chromium: playwright } = require('playwright-core');
const chromiumModule = require('@sparticuz/chromium');
const chromium = chromiumModule.default || chromiumModule;
const root = join(process.cwd(), 'dist');
const routes = JSON.parse(process.env.WEBSITE_ROUTES || '[]');
const widths = [320, 375, 390, 768, 1280];
const failures = [];
const server = createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
  const candidate = normalize(join(root, pathname));
  const safePath = candidate === root || candidate.startsWith(root + '/');
  const file = safePath ? (existsSync(candidate) && extname(candidate) ? candidate : join(candidate, 'index.html')) : '';
  if (!file || !existsSync(file)) { response.writeHead(404); response.end('Not found'); return; }
  const types = { '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };
  const type = types[extname(file)] || 'application/octet-stream';
  response.writeHead(200, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff' });
  createReadStream(file).pipe(response);
});

(async () => {
  let browser;
  try {
    await new Promise((resolve) => server.listen(4173, '127.0.0.1', resolve));
    browser = await playwright.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: true });
    const page = await browser.newPage();
    await page.route('**/*', (route) => {
      const hostname = new URL(route.request().url()).hostname;
      if (hostname === '127.0.0.1' || hostname === 'localhost') return route.continue();
      return route.abort('blockedbyclient');
    });
    page.on('pageerror', (error) => failures.push('pageerror: ' + error.message));
    const checks = [];
    for (const routePath of routes) {
      for (const width of widths) {
        await page.setViewportSize({ width, height: 900 });
        const response = await page.goto('http://127.0.0.1:4173' + routePath, { waitUntil: 'networkidle' });
        const result = await page.evaluate(() => {
          const anchors = [...document.querySelectorAll('a[href]')];
          const unnamedLinks = anchors.filter((anchor) => !(anchor.textContent || '').trim() && !anchor.getAttribute('aria-label'));
          return {
            title: document.title,
            description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
            scrollWidth: document.documentElement.scrollWidth,
            viewportWidth: innerWidth,
            h1Count: document.querySelectorAll('h1').length,
            missingImageAlt: document.querySelectorAll('img:not([alt])').length,
            brokenImages: [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).length,
            unnamedLinks: unnamedLinks.length,
            landmarks: ['header', 'nav', 'main', 'footer'].every((name) => document.querySelector(name)),
            stylesheet: [...document.styleSheets].some((sheet) => sheet.href?.endsWith('/styles.css')),
          };
        });
        const pageFailures = [];
        if (response?.status() !== 200) pageFailures.push('HTTP ' + response?.status());
        if (!result.title) pageFailures.push('missing title');
        if (!result.description) pageFailures.push('missing description');
        if (result.h1Count !== 1) pageFailures.push('expected exactly one h1');
        if (result.scrollWidth > width) pageFailures.push('horizontal overflow at ' + width + 'px');
        if (result.missingImageAlt > 0) pageFailures.push('image missing alt text');
        if (result.brokenImages > 0) pageFailures.push('image failed to load');
        if (result.unnamedLinks > 0) pageFailures.push('link missing accessible name');
        if (!result.landmarks) pageFailures.push('missing semantic landmark');
        if (!result.stylesheet) pageFailures.push('stylesheet did not load');
        if (pageFailures.length) failures.push(routePath + ' at ' + width + 'px: ' + pageFailures.join(', '));
        checks.push({ route: routePath, width, ...result, passed: pageFailures.length === 0 });
        if (routePath === routes[0] && (width === 390 || width === 1280)) {
          await page.screenshot({ path: '/tmp/multigraphic-website-' + width + '.png', fullPage: false });
        }
        const links = await page.locator('a[href]').evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href')));
        for (const href of links) {
          if (!href || href.startsWith('#')) continue;
          if (!routes.includes(new URL(href, 'http://127.0.0.1').pathname)) failures.push(routePath + ': internal link is not in the sitemap: ' + href);
        }
      }
      await page.locator('body').click({ position: { x: 1, y: 1 } });
      await page.keyboard.press('Tab');
      const skipLinkFocused = await page.evaluate(() => document.activeElement?.classList.contains('skip-link') && getComputedStyle(document.activeElement).top === '16px');
      if (!skipLinkFocused) failures.push(routePath + ': keyboard focus did not reach the visible skip link.');
      await page.addScriptTag({ path: require.resolve('axe-core') });
      const accessibility = await page.evaluate(async () => {
        const result = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
        return result.violations.map((violation) => ({ id: violation.id, impact: violation.impact, description: violation.help, nodes: violation.nodes.length }));
      });
      if (accessibility.length) failures.push(routePath + ': axe violations: ' + JSON.stringify(accessibility));
      checks.push({ route: routePath, keyboardSkipLink: skipLinkFocused, accessibilityViolations: accessibility });
    }
    process.stdout.write(JSON.stringify({ passed: failures.length === 0, checks, failures }));
    process.exitCode = failures.length ? 1 : 0;
  } catch (error) {
    process.stderr.write(error instanceof Error ? error.stack || error.message : String(error));
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})();
`;

async function runChecked(sandbox: Sandbox, input: { cmd: string; args: string[]; cwd: string; timeoutMs: number; env?: Record<string, string>; signal?: AbortSignal }) {
  const result = await sandbox.runCommand({ ...input, env: input.env });
  if (result.exitCode !== 0) {
    throw new Error(`Isolated command ${input.cmd} ${input.args[0] ?? ''} exited with code ${result.exitCode}; command output was redacted from product activity.`.trim());
  }
  return result;
}

export type WebsiteSandboxResult = {
  archive: Buffer;
  desktopScreenshot: Buffer;
  mobileScreenshot: Buffer;
  browserReport: Record<string, unknown>;
  metrics: { sandboxDurationMs: number; dependencySetupDurationMs: number; buildDurationMs: number; browserDurationMs: number; activeCpuDurationMs: number; ingressBytes: number; egressBytes: number };
};

export async function buildAndVerifyWebsiteInSandbox(input: {
  files: WebsiteProjectFile[];
  routes: string[];
  signal?: AbortSignal;
}): Promise<WebsiteSandboxResult> {
  const auth = credentials();
  const startedAt = Date.now();
  const sandbox = await Sandbox.create({
    ...auth,
    image: 'vercel/sandbox/node:24',
    timeout: 15 * 60 * 1000,
    persistent: false,
    networkPolicy: BROWSER_TOOL_INSTALL_NETWORK,
    tags: { service: 'multigraphic-website-delivery' },
    signal: input.signal,
  });

  let output: Omit<WebsiteSandboxResult, 'metrics'> | null = null;
  let sandboxUsage = { activeCpuDurationMs: 0, ingressBytes: 0, egressBytes: 0 };
  let dependencySetupDurationMs = 0;
  let buildDurationMs = 0;
  let browserDurationMs = 0;

  try {
    await sandbox.mkDir(PROJECT_ROOT, { signal: input.signal });
    await sandbox.mkDir(`${PROJECT_ROOT}/artifacts`, { signal: input.signal });
    await sandbox.writeFiles([
      ...input.files.map((file) => ({ path: `${PROJECT_ROOT}/${file.path}`, content: file.content })),
      { path: '/tmp/multigraphic-browser-check.cjs', content: browserCheckScript },
    ], { signal: input.signal });

    const dependencySetupStarted = Date.now();
    await runChecked(sandbox, {
      cmd: 'npm',
      args: ['install', '--prefix', BROWSER_TOOLS_PATH, '--no-save', '--ignore-scripts', '--package-lock=false', '--audit=false', '--fund=false', 'playwright-core@1.65.0', '@sparticuz/chromium@153.0.0', 'axe-core@4.14.0'],
      cwd: PROJECT_ROOT,
      timeoutMs: 180_000,
      signal: input.signal,
    });
    dependencySetupDurationMs = Date.now() - dependencySetupStarted;
    await sandbox.update({ networkPolicy: 'deny-all' }, { signal: input.signal });

    const buildStarted = Date.now();
    await runChecked(sandbox, { cmd: 'npm', args: ['run', 'build'], cwd: PROJECT_ROOT, timeoutMs: 120_000, signal: input.signal });
    buildDurationMs = Date.now() - buildStarted;

    const browserStarted = Date.now();
    const browserCheck = await runChecked(sandbox, {
      cmd: 'node',
      args: ['/tmp/multigraphic-browser-check.cjs'],
      cwd: PROJECT_ROOT,
      timeoutMs: 180_000,
      env: { NODE_PATH: `${BROWSER_TOOLS_PATH}/node_modules`, WEBSITE_ROUTES: JSON.stringify(input.routes) },
      signal: input.signal,
    });
    browserDurationMs = Date.now() - browserStarted;
    const browserReport = JSON.parse(await browserCheck.stdout()) as Record<string, unknown>;
    if (browserReport.passed !== true) throw new Error('Website browser verification did not pass.');

    const archivePath = `${PROJECT_ROOT}/artifacts/website-source.tar.gz`;
    await runChecked(sandbox, {
      cmd: 'tar',
      args: ['-czf', archivePath, '-C', PROJECT_ROOT, 'package.json', 'README.md', 'ASSET_PROVENANCE.md', 'CONTENT_REVIEW.md', 'src', 'scripts'],
      cwd: PROJECT_ROOT,
      timeoutMs: 60_000,
      signal: input.signal,
    });
    const [archive, desktopScreenshot, mobileScreenshot] = await Promise.all([
      sandbox.readFileToBuffer({ path: archivePath }, { signal: input.signal }),
      sandbox.readFileToBuffer({ path: '/tmp/multigraphic-website-1280.png' }, { signal: input.signal }),
      sandbox.readFileToBuffer({ path: '/tmp/multigraphic-website-390.png' }, { signal: input.signal }),
    ]);
    if (!archive || !desktopScreenshot || !mobileScreenshot) throw new Error('Sandbox did not return the source archive and required browser screenshots.');
    output = { archive, desktopScreenshot, mobileScreenshot, browserReport };
  } finally {
    const stopped = await sandbox.stop();
    sandboxUsage = {
      activeCpuDurationMs: stopped.activeCpuDurationMs ?? 0,
      ingressBytes: stopped.networkTransfer?.ingress ?? 0,
      egressBytes: stopped.networkTransfer?.egress ?? 0,
    };
  }

  if (!output) throw new Error('Website sandbox ended without a verified deliverable.');
  return {
    ...output,
    metrics: {
      sandboxDurationMs: Date.now() - startedAt,
      dependencySetupDurationMs,
      buildDurationMs,
      browserDurationMs,
      ...sandboxUsage,
    },
  };
}
