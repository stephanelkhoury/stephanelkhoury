export const SKILL_LEVELS = [
  { level: 1, name: 'Trainee', minXp: 0 },
  { level: 2, name: 'Junior', minXp: 50 },
  { level: 3, name: 'Professional', minXp: 150 },
  { level: 4, name: 'Senior', minXp: 300 },
  { level: 5, name: 'Expert', minXp: 500 },
] as const;

export const SKILL_XP = { TASK_SUCCEEDED: 5, MEETING_CONTRIBUTION: 3, OUTPUT_APPROVED: 15 } as const;

export function skillLevel(xp: number) {
  const current = [...SKILL_LEVELS].reverse().find(level => xp >= level.minXp) ?? SKILL_LEVELS[0];
  const next = SKILL_LEVELS.find(level => level.minXp > xp) ?? null;
  return { level: current.level, name: current.name, xp, nextLevelXp: next?.minXp ?? null };
}

export function skillKey(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'general';
}

function titleCase(key: string) {
  return key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').replace(/^./, letter => letter.toUpperCase());
}

export function renderMarkdown(value: unknown, depth = 3): string {
  if (value === null || value === undefined || value === '') return '_None_';
  if (typeof value !== 'object') return String(value);
  if (Array.isArray(value)) {
    if (!value.length) return '_None_';
    return value.map((item, index) => typeof item === 'object' && item !== null
      ? `${index + 1}. ${renderMarkdown(item, depth + 1).replace(/\n/g, '\n   ')}`
      : `- ${String(item)}`).join('\n');
  }
  const heading = '#'.repeat(Math.min(depth, 6));
  return Object.entries(value as Record<string, unknown>)
    .map(([key, item]) => typeof item === 'object' && item !== null
      ? `${heading} ${titleCase(key)}\n\n${renderMarkdown(item, depth + 1)}`
      : `**${titleCase(key)}:** ${renderMarkdown(item, depth + 1)}`)
    .join('\n\n');
}

export function taskRecordMarkdown(input: { agentName: string; projectName: string; taskTitle: string; brief: string; provider: string; model: string; durationMs: number; inputTokens: number; outputTokens: number; knowledgeTitles: string[]; output: unknown; completedAt?: Date }) {
  return [
    `# ${input.taskTitle}`,
    `**Agent:** ${input.agentName}  \n**Project:** ${input.projectName}  \n**Completed:** ${(input.completedAt ?? new Date()).toISOString()}  \n**Model:** ${input.provider} / ${input.model}  \n**Model time:** ${(input.durationMs / 1000).toFixed(1)}s  \n**Tokens:** ${input.inputTokens} in / ${input.outputTokens} out`,
    `## Request\n\n${input.brief.trim() || '_No brief saved._'}`,
    `## Knowledge used\n\n${input.knowledgeTitles.length ? input.knowledgeTitles.map(title => `- ${title}`).join('\n') : '_None_'}`,
    `## Output\n\n${renderMarkdown(input.output)}`,
    '## Review\n\nPending owner review. No external action was performed.',
  ].join('\n\n');
}
