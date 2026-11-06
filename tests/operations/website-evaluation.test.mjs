import assert from 'node:assert/strict';
import { test } from 'node:test';
import { authorizeOperationsTool } from '../../src/lib/operations/tool-policy.ts';
import { decideTaskExecution } from '../../src/lib/operations/workflow-policy.ts';
import { validateJsonSchemaValue } from '../../src/lib/operations/model-provider.ts';
import { detectWebsiteScopeFlags, nextWebsiteRevision, validateWebsiteDeliveryPlan } from '../../src/lib/operations/workflow-plan.ts';
import { createWebsiteProjectFiles } from '../../src/lib/operations/website-project.ts';

const stages = ['BRIEF_ANALYSIS', 'REQUIREMENTS', 'UX_UI', 'CONTENT_SEO', 'IMPLEMENTATION', 'VERIFICATION', 'DELIVERY'];
const assignees = { BRIEF_ANALYSIS: 'business-analyst', REQUIREMENTS: 'business-analyst', UX_UI: 'ux-ui-designer', CONTENT_SEO: 'content-specialist', IMPLEMENTATION: 'full-stack-engineer', VERIFICATION: 'qa-engineer', DELIVERY: 'project-manager' };
const agents = new Set(Object.values(assignees));

function planFor(brief) {
  return {
    title: 'Fictional studio marketing website',
    objectives: ['Explain the fictional studio offering to the stated audience.'],
    deliverables: ['Reviewed static website source, evidence, and report.'],
    assumptions: ['No owner-provided raster assets are available.'],
    missingInformation: [],
    requiredApprovals: ['website-specification'],
    tasks: stages.map((stage, index) => ({
      key: stage.toLowerCase().replaceAll('_', '-'),
      stage,
      title: `${stage} deliverable`,
      description: `Complete the ${stage.toLowerCase()} stage of this bounded marketing website.`,
      assigneeKey: assignees[stage],
      dependencies: index ? [stages[index - 1].toLowerCase().replaceAll('_', '-')] : [],
      inputs: ['Accepted fictional brief'],
      acceptanceCriteria: ['Persisted output satisfies its stage-specific acceptance criteria.'],
      estimatedMinutes: 20,
      estimatedCostUsd: 0.1,
      estimatedResources: { modelCalls: 1, toolCalls: 0, computeMinutes: stage === 'IMPLEMENTATION' ? 5 : 0 },
      requiredApprovals: stage === 'IMPLEMENTATION' ? ['website-specification'] : [],
    })),
    website: {
      businessGoals: ['Introduce the fictional studio.'],
      audiences: ['Independent creative teams.'],
      languages: ['en'],
      pages: [{
        path: '/', language: 'en', title: 'Home', purpose: 'Introduce the fictional studio and its practice.',
        sections: [{ key: 'studio', heading: 'Studio', contentRequirements: ['Describe the supplied fictional practice.'], draftCopy: 'Northstar Studio creates small-batch ceramic objects for the home.', claimsToVerify: ['Verify production location with the owner.'], image: null, primaryAction: null }],
        metaTitle: 'Northstar Studio | Home', metaDescription: 'A fictional ceramic studio website for delivery evaluation.', internalLinks: [],
      }],
      functionality: ['RESPONSIVE_NAVIGATION', 'INTERNAL_PAGE_LINKS'],
      constraints: ['Static marketing pages only.'],
      designDirection: 'Editorial layout, readable serif headings, clear content hierarchy.',
      visualTokens: { background: '#FFFFFF', surface: '#F2F4F7', text: '#15202B', muted: '#475569', accent: '#175CD3', border: '#D0D5DD', headingTypeface: 'SERIF', bodyTypeface: 'SANS' },
      responsiveBehavior: ['Navigation reflows to two columns on narrow screens.', 'Content sections become one column on mobile.'],
      accessibilityRequirements: ['Use semantic landmarks.', 'All links have accessible names.', 'Maintain visible keyboard focus.'],
      structuredDataRecommendations: [],
      brandAssets: [],
      scopeFlags: detectWebsiteScopeFlags(brief),
    },
  };
}

test('brief interpretation flags separate scope rather than planning commerce or auth', () => {
  const brief = 'Create an online store with payment processing and a customer portal sign-in.';
  assert.deepEqual(detectWebsiteScopeFlags(brief).map(({ category }) => category), ['ECOMMERCE', 'PAYMENTS', 'AUTHENTICATED_APPLICATION']);
  const plan = planFor(brief);
  assert.equal(validateWebsiteDeliveryPlan(plan, agents, brief).ok, true);
  assert.ok(plan.website.scopeFlags.every(({ reason }) => reason.length > 10));
});

test('plan validity requires all stages, acyclic ordering, specialist assignment, and implementation approval', () => {
  const brief = 'Create a static marketing website for the fictional studio.';
  const plan = planFor(brief);
  assert.equal(validateWebsiteDeliveryPlan(plan, agents, brief).ok, true);
  const implementation = plan.tasks.find(({ stage }) => stage === 'IMPLEMENTATION');
  implementation.requiredApprovals = [];
  assert.ok(validateWebsiteDeliveryPlan(plan, agents, brief).errors.some((error) => error.includes('website-specification')));
});

test('agent output schema accepts mapped claim-aware copy and rejects missing evidence flags', () => {
  const schema = { type: 'object', additionalProperties: false, required: ['content', 'claimsToVerify', 'terminologyNotes'], properties: { content: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['section', 'language', 'text'], properties: { section: { type: 'string' }, language: { type: 'string' }, text: { type: 'string' } } } }, claimsToVerify: { type: 'array', items: { type: 'string' } }, terminologyNotes: { type: 'array', items: { type: 'string' } } } };
  assert.deepEqual(validateJsonSchemaValue({ content: [{ section: '/#studio', language: 'en', text: 'Northstar Studio makes small-batch ceramic objects.' }], claimsToVerify: ['Verify production location.'], terminologyNotes: [] }, schema), []);
  assert.ok(validateJsonSchemaValue({ content: [], claimsToVerify: [] }, schema).length > 0);
});

test('tool selection allows only the approved read-only project brief tool', () => {
  assert.equal(authorizeOperationsTool({ toolName: 'operations.project.read_brief', allowedTools: ['operations.project.read_brief'], sideEffectPolicy: 'READ_ONLY', requiresApproval: false }).allowed, true);
  assert.equal(authorizeOperationsTool({ toolName: 'website.publish', allowedTools: ['operations.project.read_brief'], sideEffectPolicy: 'EXTERNAL', requiresApproval: true }).allowed, false);
});

test('content claims remain in owner review notes and renderer adds no testimonials or prices', () => {
  const plan = planFor('Create a static marketing website for the fictional studio.');
  const files = createWebsiteProjectFiles({ projectName: 'Northstar Studio (Fictional)', website: plan.website });
  const review = files.find(({ path }) => path === 'CONTENT_REVIEW.md').content;
  const html = files.find(({ path }) => path === 'src/index.html').content;
  assert.match(review, /Verify production location with the owner/);
  assert.match(review, /All AI-generated copy remains unverified/);
  assert.doesNotMatch(html, /testimonial|certified|\$\d/iu);
});

test('task acceptance waits for exact approval and blocks on budget or missing isolation', () => {
  const common = { planAccepted: true, cancelRequested: false, taskStatus: 'QUEUED', dependencies: ['SUCCEEDED'], hasAssignedAgent: true, agentApproved: true, requiresIsolatedCodeExecution: false, isolatedCodeExecutionConfigured: true, requiredApprovalKeys: ['website-specification'], estimatedSpentUsd: 0.1, nextTaskEstimatedUsd: 0.1, budgetCapUsd: 1 };
  assert.equal(decideTaskExecution({ ...common, approvals: [{ actionKey: 'website-specification', actionHash: 'pending', status: 'PENDING' }] }).kind, 'AWAITING_APPROVAL');
  assert.equal(decideTaskExecution({ ...common, approvals: [{ actionKey: 'website-specification', actionHash: 'a'.repeat(64), status: 'APPROVED' }] }).kind, 'RUN');
  assert.equal(decideTaskExecution({ ...common, approvals: [{ actionKey: 'website-specification', actionHash: 'a'.repeat(64), status: 'APPROVED' }], budgetCapUsd: 0.15 }).kind, 'BLOCKED');
  assert.equal(decideTaskExecution({ ...common, requiresIsolatedCodeExecution: true, isolatedCodeExecutionConfigured: false, approvals: [{ actionKey: 'website-specification', actionHash: 'a'.repeat(64), status: 'APPROVED' }] }).kind, 'AWAITING_INPUT');
});

test('revision, page, and asset limits are deterministic', () => {
  assert.equal(nextWebsiteRevision(0).revisionNumber, 1);
  assert.equal(nextWebsiteRevision(2).allowed, false);
  const plan = planFor('Create a static marketing website for the fictional studio.');
  plan.website.pages = Array.from({ length: 9 }, (_, index) => ({ ...plan.website.pages[0], path: `/page-${index}/` }));
  assert.equal(validateWebsiteDeliveryPlan(plan, agents, 'Create a static marketing website.').ok, false);
});
