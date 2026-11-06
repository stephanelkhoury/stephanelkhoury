import { z } from 'zod';

export const workflowPlanTaskSchema = z.object({
  key: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(8).max(4000),
  assigneeKey: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80).nullable(),
  dependencies: z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80)).max(40),
  inputs: z.array(z.string().trim().min(1).max(1000)).max(30),
  acceptanceCriteria: z.array(z.string().trim().min(3).max(500)).min(1).max(30),
  estimatedMinutes: z.number().int().min(1).max(10080),
  estimatedCostUsd: z.number().min(0).max(1000),
  estimatedResources: z.object({
    modelCalls: z.number().int().min(0).max(100),
    toolCalls: z.number().int().min(0).max(100),
    computeMinutes: z.number().min(0).max(10080),
  }).strict(),
  requiredApprovals: z.array(z.string().trim().min(3).max(120)).max(20),
}).strict();

export const workflowPlanSchema = z.object({
  title: z.string().trim().min(3).max(160),
  objectives: z.array(z.string().trim().min(3).max(1000)).min(1).max(20),
  deliverables: z.array(z.string().trim().min(3).max(1000)).min(1).max(30),
  assumptions: z.array(z.string().trim().min(3).max(1000)).max(30),
  missingInformation: z.array(z.string().trim().min(3).max(1000)).max(30),
  requiredApprovals: z.array(z.string().trim().min(3).max(120)).max(30),
  tasks: z.array(workflowPlanTaskSchema).min(1).max(40),
}).strict();

export type WorkflowPlan = z.infer<typeof workflowPlanSchema>;
export type WorkflowPlanTask = WorkflowPlan['tasks'][number];

export type WorkflowPlanValidation =
  | { ok: true; plan: WorkflowPlan; orderedTasks: WorkflowPlanTask[] }
  | { ok: false; errors: string[] };

export const websiteDeliveryStages = [
  'BRIEF_ANALYSIS',
  'REQUIREMENTS',
  'UX_UI',
  'CONTENT_SEO',
  'IMPLEMENTATION',
  'VERIFICATION',
  'DELIVERY',
] as const;

const websiteStageAssignees: Record<typeof websiteDeliveryStages[number], string[]> = {
  BRIEF_ANALYSIS: ['business-analyst', 'project-manager'],
  REQUIREMENTS: ['business-analyst', 'project-manager'],
  UX_UI: ['ux-ui-designer'],
  CONTENT_SEO: ['content-specialist', 'seo-specialist'],
  IMPLEMENTATION: ['full-stack-engineer'],
  VERIFICATION: ['qa-engineer'],
  DELIVERY: ['project-manager'],
};

const websitePageSchema = z.object({
  path: z.string().regex(/^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)*$/).max(120),
  language: z.string().regex(/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/).max(35),
  title: z.string().trim().min(2).max(120),
  purpose: z.string().trim().min(8).max(500),
  sections: z.array(z.object({
    key: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(60),
    heading: z.string().trim().min(2).max(120),
    contentRequirements: z.array(z.string().trim().min(3).max(300)).min(1).max(12),
    draftCopy: z.string().trim().min(20).max(2000),
    claimsToVerify: z.array(z.string().trim().min(3).max(300)).max(12),
    image: z.object({ name: z.string().trim().min(2).max(160), altText: z.string().trim().min(3).max(240) }).strict().nullable(),
    primaryAction: z.object({ label: z.string().trim().min(2).max(80), targetPath: z.string().regex(/^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)*$/).max(120) }).strict().nullable(),
  }).strict()).min(1).max(12),
  metaTitle: z.string().trim().min(5).max(70),
  metaDescription: z.string().trim().min(20).max(180),
  internalLinks: z.array(z.string().regex(/^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)*$/).max(120)).max(12),
}).strict();

const websiteScopeFlagSchema = z.object({
  category: z.enum(['ECOMMERCE', 'PAYMENTS', 'AUTHENTICATED_APPLICATION']),
  matchedRequirement: z.string().trim().min(3).max(240),
  reason: z.string().trim().min(10).max(400),
}).strict();

export const websiteSpecificationSchema = z.object({
  businessGoals: z.array(z.string().trim().min(3).max(500)).min(1).max(10),
  audiences: z.array(z.string().trim().min(2).max(300)).min(1).max(10),
  languages: z.array(z.string().regex(/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/).max(35)).min(1).max(8),
  pages: z.array(websitePageSchema).min(1).max(8),
  functionality: z.array(z.enum(['RESPONSIVE_NAVIGATION', 'INTERNAL_PAGE_LINKS', 'STATIC_CONTACT_DETAILS', 'DECORATIVE_RASTER_IMAGES'])).max(10),
  constraints: z.array(z.string().trim().min(3).max(500)).max(20),
  designDirection: z.string().trim().min(20).max(2000),
  visualTokens: z.object({
    background: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    surface: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    text: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    muted: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    border: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    headingTypeface: z.enum(['SERIF', 'SANS']),
    bodyTypeface: z.enum(['SERIF', 'SANS']),
  }).strict(),
  responsiveBehavior: z.array(z.string().trim().min(5).max(400)).min(2).max(16),
  accessibilityRequirements: z.array(z.string().trim().min(5).max(400)).min(3).max(20),
  structuredDataRecommendations: z.array(z.string().trim().min(5).max(300)).max(8),
  brandAssets: z.array(z.object({
    name: z.string().trim().regex(/^[A-Za-z0-9][A-Za-z0-9._ -]{0,155}\.(?:png|jpe?g|webp)$/i),
    source: z.string().trim().min(2).max(500),
    provenance: z.enum(['OWNER_PROVIDED', 'UNKNOWN']),
    licenseStatus: z.enum(['OWNER_CONFIRMED', 'UNCERTAIN', 'NOT_APPLICABLE']),
  }).strict()).max(30),
  scopeFlags: z.array(websiteScopeFlagSchema).max(12),
}).strict();

const websiteTaskSchema = workflowPlanTaskSchema.extend({ stage: z.enum(websiteDeliveryStages) });

export const websiteDeliveryPlanSchema = workflowPlanSchema.extend({
  tasks: z.array(websiteTaskSchema).min(7).max(40),
  website: websiteSpecificationSchema,
}).strict();

export type WebsiteDeliveryPlan = z.infer<typeof websiteDeliveryPlanSchema>;
export const WEBSITE_REVISION_LIMIT = 2;

export function nextWebsiteRevision(current: number) {
  if (!Number.isInteger(current) || current < 0) return { allowed: false as const, reason: 'The stored website revision count is invalid.' };
  if (current >= WEBSITE_REVISION_LIMIT) return { allowed: false as const, reason: `The ${WEBSITE_REVISION_LIMIT}-revision workflow budget is exhausted. Escalate additional changes as a new project scope.` };
  return { allowed: true as const, revisionNumber: current + 1 };
}

const outOfScopeRules = [
  {
    category: 'ECOMMERCE' as const,
    pattern: /\b(?:e[ -]?commerce|online store|storefront|shopping cart|cart checkout|product checkout|sell(?:ing)? online)\b|متجر إلكتروني|سلة التسوق/i,
    reason: 'Storefront, cart, and transactional product sales require a separately scoped commerce service.',
  },
  {
    category: 'PAYMENTS' as const,
    pattern: /\b(?:payment(?:s)? processing|collect payments|accept payments|subscription billing|process payments|checkout payment|stripe integration)\b|معالجة المدفوعات|الدفع الإلكتروني/i,
    reason: 'Payment processing, billing, and handling financial transactions are outside this marketing-site workflow.',
  },
  {
    category: 'AUTHENTICATED_APPLICATION' as const,
    pattern: /\b(?:authenticated application|user accounts?|sign[ -]?in|log[ -]?in|customer portal|admin portal|account dashboard|member dashboard)\b|تسجيل الدخول|حساب المستخدم|بوابة العملاء/i,
    reason: 'Authentication, account-specific data, and application portals require a separately scoped application service.',
  },
];

export function detectWebsiteScopeFlags(brief: string) {
  return outOfScopeRules.flatMap(({ category, pattern, reason }) => {
    const match = pattern.exec(brief);
    if (!match) return [];
    const start = Math.max(0, match.index - 90);
    const matchedRequirement = brief.slice(start, Math.min(brief.length, match.index + match[0].length + 90)).replace(/\s+/g, ' ').trim().slice(0, 240);
    return [{ category, matchedRequirement, reason }];
  });
}

function contrastRatio(first: string, second: string) {
  const luminance = (color: string) => {
    const channels = [1, 3, 5].map((index) => Number.parseInt(color.slice(index, index + 2), 16) / 255)
      .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const firstLuminance = luminance(first);
  const secondLuminance = luminance(second);
  return (Math.max(firstLuminance, secondLuminance) + 0.05) / (Math.min(firstLuminance, secondLuminance) + 0.05);
}

export function validateWebsiteDeliveryPlan(value: unknown, availableAgentKeys: ReadonlySet<string>, brief: string) {
  const parsed = websiteDeliveryPlanSchema.safeParse(value);
  if (!parsed.success) {
    return { ok: false as const, errors: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`) };
  }

  const plan = parsed.data;
  const { website, tasks, ...baseFields } = plan;
  const basePlan = { ...baseFields, tasks: tasks.map((task) => {
    const baseTask: Record<string, unknown> = { ...task };
    delete baseTask.stage;
    return baseTask;
  }) };
  const baseValidation = validateWorkflowPlan(basePlan, availableAgentKeys);
  if (!baseValidation.ok) return baseValidation;

  const errors: string[] = [];
  const detectedFlags = detectWebsiteScopeFlags(brief);
  const declaredCategories = new Set(website.scopeFlags.map((flag) => flag.category));
  for (const flag of detectedFlags) {
    if (!declaredCategories.has(flag.category)) errors.push(`website.scopeFlags: the brief contains a ${flag.category.toLowerCase()} requirement that must be flagged for separate scope.`);
  }

  const pagePaths = website.pages.map((page) => page.path);
  const { visualTokens } = website;
  if (contrastRatio(visualTokens.text, visualTokens.background) < 4.5) errors.push('website.visualTokens.text: contrast against the background must be at least 4.5:1.');
  if (contrastRatio(visualTokens.muted, visualTokens.background) < 4.5) errors.push('website.visualTokens.muted: contrast against the background must be at least 4.5:1.');
  if (contrastRatio(visualTokens.accent, visualTokens.background) < 3) errors.push('website.visualTokens.accent: contrast against the background must be at least 3:1.');
  if (contrastRatio(visualTokens.accent, '#FFFFFF') < 4.5) errors.push('website.visualTokens.accent: contrast against white button text must be at least 4.5:1.');
  if (new Set(pagePaths).size !== pagePaths.length) errors.push('website.pages: page paths must be unique.');
  for (const page of website.pages) {
    for (const target of page.internalLinks) {
      if (!pagePaths.includes(target)) errors.push(`website.pages.${page.path}.internalLinks: ${target} does not match a page in the sitemap.`);
    }
    for (const section of page.sections) {
      if (section.image && !website.brandAssets.some((asset) => asset.name === section.image?.name)) {
        errors.push(`website.pages.${page.path}.sections.${section.key}.image: the referenced asset is not in the approved asset inventory.`);
      }
      if (section.primaryAction && !pagePaths.includes(section.primaryAction.targetPath)) {
        errors.push(`website.pages.${page.path}.sections.${section.key}.primaryAction: target path is not in the sitemap.`);
      }
    }
    if (new Set(page.sections.map(({ key }) => key)).size !== page.sections.length) {
      errors.push(`website.pages.${page.path}.sections: section keys must be unique within a page.`);
    }
  }

  const includedStages = new Set(tasks.map((task) => task.stage));
  for (const stage of websiteDeliveryStages) {
    if (!includedStages.has(stage)) errors.push(`tasks: the ${stage.toLowerCase().replaceAll('_', ' ')} stage is required.`);
  }
  for (const task of tasks) {
    if (!task.assigneeKey || !websiteStageAssignees[task.stage].includes(task.assigneeKey)) {
      errors.push(`tasks.${task.key}: the ${task.stage.toLowerCase().replaceAll('_', ' ')} stage requires an enabled, approved agent from ${websiteStageAssignees[task.stage].join(' or ')}.`);
    }
    if (task.stage === 'IMPLEMENTATION' && !task.requiredApprovals.includes('website-specification')) {
      errors.push(`tasks.${task.key}: implementation requires the exact owner approval website-specification before work begins.`);
    }
  }
  for (const [index, stage] of websiteDeliveryStages.entries()) {
    if (index === 0) continue;
    const previousStageKeys = tasks.filter((task) => task.stage === websiteDeliveryStages[index - 1]).map((task) => task.key);
    for (const task of tasks.filter((item) => item.stage === stage)) {
      if (previousStageKeys.some((key) => !task.dependencies.includes(key))) {
        errors.push(`tasks.${task.key}: every task must depend on all ${websiteDeliveryStages[index - 1].toLowerCase().replaceAll('_', ' ')} tasks before entering the ${stage.toLowerCase().replaceAll('_', ' ')} stage.`);
      }
    }
  }

  if (errors.length > 0) return { ok: false as const, errors };
  return { ok: true as const, plan, orderedTasks: baseValidation.orderedTasks.map((task) => tasks.find(({ key }) => key === task.key)!) };
}

export function validateWorkflowPlan(value: unknown, availableAgentKeys: ReadonlySet<string>): WorkflowPlanValidation {
  const parsed = workflowPlanSchema.safeParse(value);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`) };
  }

  const plan = parsed.data;
  const errors: string[] = [];
  const taskByKey = new Map<string, WorkflowPlanTask>();
  const taskOrder = new Map(plan.tasks.map((task, index) => [task.key, index]));

  for (const task of plan.tasks) {
    if (taskByKey.has(task.key)) errors.push(`Duplicate task key: ${task.key}.`);
    taskByKey.set(task.key, task);

    if (task.assigneeKey && !availableAgentKeys.has(task.assigneeKey)) {
      errors.push(`Task ${task.key} is assigned to unavailable agent ${task.assigneeKey}.`);
    }
    if (new Set(task.dependencies).size !== task.dependencies.length) {
      errors.push(`Task ${task.key} contains duplicate dependencies.`);
    }
    for (const dependency of task.dependencies) {
      if (dependency === task.key) errors.push(`Task ${task.key} cannot depend on itself.`);
      else if (!plan.tasks.some((candidate) => candidate.key === dependency)) {
        errors.push(`Task ${task.key} depends on unknown task ${dependency}.`);
      }
    }
  }

  if (errors.length > 0) return { ok: false, errors };

  const indegree = new Map(plan.tasks.map((task) => [task.key, task.dependencies.length]));
  const dependents = new Map(plan.tasks.map((task) => [task.key, [] as string[]]));
  for (const task of plan.tasks) {
    for (const dependency of task.dependencies) dependents.get(dependency)?.push(task.key);
  }

  const ready = plan.tasks.filter((task) => indegree.get(task.key) === 0).map((task) => task.key);
  const orderedKeys: string[] = [];
  while (ready.length > 0) {
    const key = ready.shift()!;
    orderedKeys.push(key);
    for (const dependent of dependents.get(key) ?? []) {
      const remaining = (indegree.get(dependent) ?? 0) - 1;
      indegree.set(dependent, remaining);
      if (remaining === 0) {
        const insertionIndex = ready.findIndex((readyKey) => taskOrder.get(readyKey)! > taskOrder.get(dependent)!);
        if (insertionIndex === -1) ready.push(dependent);
        else ready.splice(insertionIndex, 0, dependent);
      }
    }
  }

  if (orderedKeys.length !== plan.tasks.length) {
    return { ok: false, errors: ['Task dependencies contain a cycle.'] };
  }

  return {
    ok: true,
    plan,
    orderedTasks: orderedKeys.map((key) => taskByKey.get(key)!),
  };
}