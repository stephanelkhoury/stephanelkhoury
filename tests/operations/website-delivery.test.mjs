import assert from 'node:assert/strict';
import { test } from 'node:test';
import { detectWebsiteScopeFlags, nextWebsiteRevision, validateWebsiteDeliveryPlan } from '../../src/lib/operations/workflow-plan.ts';
import { createWebsiteProjectFiles, websiteCopyOverridesFromOutputs } from '../../src/lib/operations/website-project.ts';
import { websiteSandboxBlocker } from '../../src/lib/operations/website-sandbox-policy.ts';

const stages = ['BRIEF_ANALYSIS', 'REQUIREMENTS', 'UX_UI', 'CONTENT_SEO', 'IMPLEMENTATION', 'VERIFICATION', 'DELIVERY'];
const availableWebsiteAgents = new Set(['project-manager', 'business-analyst', 'ux-ui-designer', 'content-specialist', 'full-stack-engineer', 'qa-engineer', 'seo-specialist']);
const assigneeByStage = { BRIEF_ANALYSIS: 'business-analyst', REQUIREMENTS: 'business-analyst', UX_UI: 'ux-ui-designer', CONTENT_SEO: 'content-specialist', IMPLEMENTATION: 'full-stack-engineer', VERIFICATION: 'qa-engineer', DELIVERY: 'project-manager' };

function makePlan(brief) {
  return {
    title: 'Marketing website delivery',
    objectives: ['Deliver a responsive marketing website.'],
    deliverables: ['Reviewed source archive and verification report.'],
    assumptions: [],
    missingInformation: [],
    requiredApprovals: [],
    tasks: stages.map((stage, index) => ({
      key: stage.toLowerCase().replaceAll('_', '-'),
      stage,
      title: `${stage} task`,
      description: `Complete the ${stage.toLowerCase()} part of the website delivery.`,
      assigneeKey: assigneeByStage[stage],
      dependencies: index ? [stages[index - 1].toLowerCase().replaceAll('_', '-')] : [],
      inputs: ['Approved fictional project brief'],
      acceptanceCriteria: ['The output is persisted and reviewable.'],
      estimatedMinutes: 30,
      estimatedCostUsd: 0.1,
      estimatedResources: { modelCalls: 1, toolCalls: 0, computeMinutes: 1 },
      requiredApprovals: stage === 'IMPLEMENTATION' ? ['website-specification'] : [],
    })),
    website: {
      businessGoals: ['Explain the fictional studio service.'],
      audiences: ['Small design teams.'],
      languages: ['en'],
      pages: [{
        path: '/',
        language: 'en',
        title: 'Home',
        purpose: 'Introduce the studio and its services.',
        sections: [{ key: 'studio', heading: 'Studio', contentRequirements: ['Describe the supplied fictional offering.'], draftCopy: 'Northstar Studio helps independent teams shape clear, accessible marketing experiences.', claimsToVerify: [], image: null, primaryAction: null }],
        metaTitle: 'Northstar Studio | Home',
        metaDescription: 'A fictional studio website used to demonstrate the service boundary.',
        internalLinks: [],
      }],
      functionality: ['RESPONSIVE_NAVIGATION', 'INTERNAL_PAGE_LINKS'],
      constraints: ['No publishing or transactions.'],
      designDirection: 'Use an editorial, responsive layout with clear typographic hierarchy.',
      visualTokens: { background: '#FFFFFF', surface: '#F2F4F7', text: '#15202B', muted: '#475569', accent: '#175CD3', border: '#D0D5DD', headingTypeface: 'SERIF', bodyTypeface: 'SANS' },
      responsiveBehavior: ['Navigation collapses to a keyboard-operable menu.','Cards reflow to one column on narrow viewports.'],
      accessibilityRequirements: ['Use semantic landmarks.','All controls have accessible names.','Maintain visible keyboard focus.'],
      structuredDataRecommendations: [],
      brandAssets: [],
      scopeFlags: detectWebsiteScopeFlags(brief),
    },
  };
}

test('requires a bounded website specification and every delivery stage', () => {
  const brief = 'Create a responsive fictional marketing website for Northstar Studio.';
  const plan = makePlan(brief);
  assert.equal(validateWebsiteDeliveryPlan(plan, availableWebsiteAgents, brief).ok, true);
  assert.equal(validateWebsiteDeliveryPlan({ ...plan, website: undefined }, availableWebsiteAgents, brief).ok, false);
  assert.equal(validateWebsiteDeliveryPlan({ ...plan, tasks: plan.tasks.slice(1) }, availableWebsiteAgents, brief).ok, false);
  assert.equal(validateWebsiteDeliveryPlan({ ...plan, website: { ...plan.website, functionality: ['CONTACT_FORM'] } }, availableWebsiteAgents, brief).ok, false);
  plan.website.visualTokens.text = '#FFFFFF';
  assert.ok(validateWebsiteDeliveryPlan(plan, availableWebsiteAgents, brief).errors.some((error) => error.includes('contrast against the background')));
});

test('flags commerce, payment, and authenticated-app needs for separate scope', () => {
  const brief = 'Create an online store with payment processing and a customer portal sign-in.';
  assert.deepEqual(detectWebsiteScopeFlags(brief).map(({ category }) => category), ['ECOMMERCE', 'PAYMENTS', 'AUTHENTICATED_APPLICATION']);
  const plan = makePlan(brief);
  plan.website.scopeFlags = plan.website.scopeFlags.filter(({ category }) => category !== 'PAYMENTS');
  const result = validateWebsiteDeliveryPlan(plan, availableWebsiteAgents, brief);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes('payments requirement')));
  assert.deepEqual(detectWebsiteScopeFlags('نريد متجر إلكتروني مع معالجة المدفوعات وتسجيل الدخول').map(({ category }) => category), ['ECOMMERCE', 'PAYMENTS', 'AUTHENTICATED_APPLICATION']);
});

test('rejects duplicate sitemap paths and links to pages not in the sitemap', () => {
  const brief = 'Create a responsive fictional marketing website for Northstar Studio.';
  const plan = makePlan(brief);
  plan.website.pages[0].internalLinks = ['/contact/'];
  const result = validateWebsiteDeliveryPlan(plan, availableWebsiteAgents, brief);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes('does not match a page')));
  plan.website.pages.push({ ...plan.website.pages[0] });
  assert.ok(validateWebsiteDeliveryPlan(plan, availableWebsiteAgents, brief).errors.some((error) => error.includes('page paths must be unique')));
});

test('requires each website delivery stage to depend on the complete prior stage', () => {
  const brief = 'Create a responsive fictional marketing website for Northstar Studio.';
  const plan = makePlan(brief);
  const uxTask = plan.tasks.find(({ stage }) => stage === 'UX_UI');
  uxTask.dependencies = [];
  const result = validateWebsiteDeliveryPlan(plan, availableWebsiteAgents, brief);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes('must depend on all requirements tasks')));
});

test('requires owner approval of the website specification before implementation', () => {
  const brief = 'Create a responsive fictional marketing website for Northstar Studio.';
  const plan = makePlan(brief);
  const implementation = plan.tasks.find(({ stage }) => stage === 'IMPLEMENTATION');
  implementation.requiredApprovals = [];
  const result = validateWebsiteDeliveryPlan(plan, availableWebsiteAgents, brief);
  assert.ok(result.errors.some((error) => error.includes('website-specification')));
});

test('renders escaped, dependency-free static pages with private asset and claim notes', () => {
  const plan = makePlan('Create a responsive fictional marketing website for Northstar Studio.');
  plan.website.pages[0].language = 'ar';
  plan.website.pages[0].sections[0].claimsToVerify = ['Confirm the service description with the owner.'];
  plan.website.brandAssets = [{ name: 'studio.png', source: 'Owner-provided project knowledge', provenance: 'OWNER_PROVIDED', licenseStatus: 'UNCERTAIN' }];
  const files = createWebsiteProjectFiles({
    projectName: 'Northstar <script>alert(1)</script>',
    website: plan.website,
    copyOverrides: { '/#studio': 'A <script> tag is treated as text.' },
  });
  const fileByPath = new Map(files.map((file) => [file.path, file.content]));
  const html = fileByPath.get('src/index.html');

  assert.ok(html.includes('lang="ar" dir="rtl"'));
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(html.includes('A &lt;script&gt; tag is treated as text.'));
  assert.equal(/<script\b/i.test(html), false);
  assert.ok(fileByPath.get('src/styles.css').includes('prefers-reduced-motion'));
  assert.equal(fileByPath.get('src/styles.css').includes('font-size:clamp'), false);
  assert.ok(fileByPath.get('package.json').includes('"dependencies"') === false);
  assert.ok(fileByPath.get('CONTENT_REVIEW.md').includes('Confirm the service description'));
  assert.ok(fileByPath.get('CONTENT_REVIEW.md').includes('All AI-generated copy remains unverified'));
  assert.ok(fileByPath.get('ASSET_PROVENANCE.md').includes('license UNCERTAIN'));
});

test('accepts copy output only for exact approved page, section, and language keys', () => {
  const website = makePlan('Create a responsive fictional marketing website for Northstar Studio.').website;
  const overrides = websiteCopyOverridesFromOutputs(website, [{ output: { content: [
    { section: '/#studio', language: 'en', text: 'Approved English copy with enough content for the selected page section.' },
    { section: '/#studio', language: 'ar', text: 'Wrong language output with enough content to be rejected safely.' },
    { section: '/#new-page', language: 'en', text: 'Unapproved page output with enough content to be rejected safely.' },
  ] } }]);
  assert.deepEqual(overrides, { '/#studio': 'Approved English copy with enough content for the selected page section.' });
});

test('bundles only explicitly referenced assets and refuses missing binaries', () => {
  const plan = makePlan('Create a responsive fictional marketing website for Northstar Studio.');
  plan.website.brandAssets = [{ name: 'studio.png', source: 'Approved project knowledge', provenance: 'OWNER_PROVIDED', licenseStatus: 'UNCERTAIN' }];
  plan.website.pages[0].sections[0].image = { name: 'studio.png', altText: 'Studio team working around a table' };
  const assetBytes = Uint8Array.from([1, 2, 3, 4]);
  const files = createWebsiteProjectFiles({ projectName: 'Northstar Studio', website: plan.website, assets: [{ name: 'studio.png', content: assetBytes }] });
  assert.deepEqual(files.find((file) => file.path === 'src/assets/studio.png').content, assetBytes);
  assert.ok(files.find((file) => file.path === 'src/index.html').content.includes('alt="Studio team working around a table"'));
  assert.throws(() => createWebsiteProjectFiles({ projectName: 'Northstar Studio', website: plan.website }), /unavailable in the scoped project knowledge/);
});

test('enforces a two-revision budget without silently permitting invalid counters', () => {
  assert.deepEqual(nextWebsiteRevision(0), { allowed: true, revisionNumber: 1 });
  assert.deepEqual(nextWebsiteRevision(1), { allowed: true, revisionNumber: 2 });
  assert.equal(nextWebsiteRevision(2).allowed, false);
  assert.equal(nextWebsiteRevision(-1).allowed, false);
});

test('requires Vercel Sandbox OIDC or a complete external credential set', () => {
  assert.ok(websiteSandboxBlocker({}));
  assert.equal(websiteSandboxBlocker({ VERCEL_OIDC_TOKEN: 'present' }), null);
  assert.equal(websiteSandboxBlocker({ VERCEL_TOKEN: 'present', VERCEL_TEAM_ID: 'present' }), 'Vercel Sandbox is not configured. Provide VERCEL_OIDC_TOKEN or the complete VERCEL_TOKEN, VERCEL_TEAM_ID, and VERCEL_PROJECT_ID set.');
  assert.equal(websiteSandboxBlocker({ VERCEL_TOKEN: 'present', VERCEL_TEAM_ID: 'present', VERCEL_PROJECT_ID: 'present' }), null);
});