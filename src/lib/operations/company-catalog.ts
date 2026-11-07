import { FIRST_FLOOR_ROOMS, PLANNED_HEADQUARTERS_LEVELS } from './headquarters-model.ts';
import { roomArchitecture, roomWorldSize } from './headquarters-architecture.ts';

export type HeadquartersView = 'building' | 'ground' | 'delivery' | 'leadership';
export type CompanyRoom = { key: string; name: string; purpose: string; center: readonly [number, number]; size: readonly [number, number]; color: string };
export const companyFloors: Array<{ key: Exclude<HeadquartersView, 'building'>; number: string; name: string; description: string; rooms: CompanyRoom[] }> = [
  { key: 'ground', number: '01', name: 'Business & People', description: 'The people, knowledge, and operations behind the work.', rooms: PLANNED_HEADQUARTERS_LEVELS.find(level => level.key === 'business')!.rooms.map(room => ({ ...room })) },
  { key: 'delivery', number: '02', name: 'Design & Delivery', description: 'From the first brief to a reviewed deliverable.', rooms: FIRST_FLOOR_ROOMS.map(room => ({ ...room, purpose: room.department })) },
  { key: 'leadership', number: '03', name: 'Leadership & Media', description: 'Creative direction, strategy, picture, and sound.', rooms: PLANNED_HEADQUARTERS_LEVELS.find(level => level.key === 'leadership')!.rooms.map(room => ({ ...room })) },
];

for (const floor of companyFloors) {
  floor.rooms = floor.rooms.map(room => {
    const plan = roomArchitecture[room.key];
    return plan ? { ...room, center: plan.center, size: roomWorldSize(plan) } : room;
  });
}

export const companyDepartments = [
  { key: 'project-management', name: 'Project management', roomKey: 'project-management', floor: 'delivery', agentKeys: ['project-manager'], description: 'Turn a saved brief into a coordinated plan and accountable handoffs.', outputs: ['Delivery plan', 'Task dependencies', 'Progress evidence'], route: 'projects', execution: 'WEBSITE' },
  { key: 'strategy-research', name: 'Strategy & research', roomKey: 'strategy-room', floor: 'leadership', agentKeys: ['business-analyst', 'researcher'], description: 'Trace requirements and research findings to supplied evidence.', outputs: ['Requirements', 'User flows', 'Evidence ledger'], route: 'knowledge', execution: 'PLANNED' },
  { key: 'brand-design', name: 'Brand & experience', roomKey: 'design-studio', floor: 'delivery', agentKeys: ['ux-ui-designer', 'brand-designer'], description: 'Shape clear, accessible experiences around the approved brief.', outputs: ['Page specifications', 'Component behavior', 'Brand direction'], route: 'agents', execution: 'WEBSITE' },
  { key: 'software-engineering', name: 'Engineering', roomKey: 'engineering', floor: 'delivery', agentKeys: ['full-stack-engineer'], description: 'Build the accepted static website inside an isolated microVM.', outputs: ['Website source', 'Build evidence', 'Implementation notes'], route: 'projects', execution: 'WEBSITE' },
  { key: 'quality-assurance', name: 'Quality assurance', roomKey: 'qa-lab', floor: 'delivery', agentKeys: ['qa-engineer'], description: 'Review acceptance criteria against executed checks and browser evidence.', outputs: ['Verification report', 'Accessibility checks', 'Coverage gaps'], route: 'deliverables', execution: 'WEBSITE' },
  { key: 'seo-content', name: 'Content & discoverability', roomKey: 'content-studio', floor: 'delivery', agentKeys: ['content-specialist', 'seo-specialist'], description: 'Write audience-aware copy and metadata with explicit claim checks.', outputs: ['Page copy', 'Metadata', 'Claims to verify'], route: 'knowledge', execution: 'WEBSITE' },
  { key: 'media-production', name: 'Film & sound', roomKey: 'video-studio', floor: 'leadership', agentKeys: ['video-editor', 'audio-music-specialist', 'podcast-producer'], description: 'Develop production direction, edit plans, podcast episodes, and rights checklists.', outputs: ['Edit plan', 'Audio and podcast plan', 'Asset and rights inventory'], route: 'agents', execution: 'PLANNED' },
  { key: 'business-operations', name: 'Business operations', roomKey: 'operations-finance', floor: 'ground', agentKeys: ['operations-assistant', 'marketing-planner', 'proposal-specialist'], description: 'Prepare proposals, campaign plans, and operational follow-up from verified records.', outputs: ['Proposal draft', 'Campaign plan', 'Operations checklist'], route: 'overview', execution: 'PLANNED' },
  { key: 'reception', name: 'Reception & intake', roomKey: 'reception-lobby', floor: 'ground', agentKeys: ['receptionist'], description: 'Triage supplied visitor requests and prepare accurate, owner-reviewable handoffs.', outputs: ['Request classification', 'Department handoff', 'Reply draft'], route: 'projects', execution: 'PLANNED' },
  { key: 'advertising', name: 'Advertising & campaigns', roomKey: 'command-room', floor: 'leadership', agentKeys: ['creative-director'], description: 'Create the campaign idea and keep every channel on it.', outputs: ['Campaign concept', 'Channel concepts', 'Art direction'], route: 'projects', execution: 'PLANNED' },
  { key: 'social-media', name: 'Social media', roomKey: 'command-room', floor: 'leadership', agentKeys: ['social-media-manager'], description: 'Plan platform content, calendars and community rules.', outputs: ['Content calendar', 'Post concepts', 'Engagement rules'], route: 'projects', execution: 'PLANNED' },
  { key: 'marketing-performance', name: 'Marketing & performance', roomKey: 'command-room', floor: 'leadership', agentKeys: ['performance-marketer'], description: 'Plan channels, budget, SEO and measurement.', outputs: ['Channel plan', 'KPIs', 'Measurement plan'], route: 'analytics', execution: 'PLANNED' },
  { key: 'graphic-design', name: 'Graphic & print design', roomKey: 'design-studio', floor: 'delivery', agentKeys: ['graphic-designer'], description: 'Specify layouts for print, packaging, social and presentations.', outputs: ['Layout specs', 'Print specs', 'Asset checklist'], route: 'deliverables', execution: 'PLANNED' },
  { key: 'motion-animation', name: 'Motion & animation', roomKey: 'video-studio', floor: 'leadership', agentKeys: ['motion-designer'], description: 'Plan storyboards, motion style and animation timing.', outputs: ['Storyboard', 'Motion specs', 'Asset list'], route: 'deliverables', execution: 'PLANNED' },
  { key: 'photography', name: 'Photography & retouching', roomKey: 'design-studio', floor: 'delivery', agentKeys: ['photo-retoucher'], description: 'Direct shoots and retouching with rights recorded.', outputs: ['Shot list', 'Styling direction', 'Retouching notes'], route: 'deliverables', execution: 'PLANNED' },
  { key: 'copy-translation', name: 'Copy & translation', roomKey: 'content-studio', floor: 'delivery', agentKeys: ['copywriter', 'arabic-english-translator'], description: 'Write and localise copy in English and Arabic.', outputs: ['Copy deck', 'Translations', 'Claims to verify'], route: 'knowledge', execution: 'PLANNED' },
  { key: 'finance', name: 'Finance & invoicing', roomKey: 'operations-finance', floor: 'ground', agentKeys: ['finance-invoicing'], description: 'Prepare quotes and invoice drafts from approved scope and prices.', outputs: ['Quote', 'Invoice draft', 'Payment schedule'], route: 'overview', execution: 'PLANNED' },
] as const;

export const profileDeskRooms: Record<string, string> = {
  'reception-desk': 'reception', 'lobby-reception-desk': 'reception-lobby', 'pm-desk': 'project-management', 'design-desk': 'design-studio',
  'engineering-desk': 'engineering', 'qa-desk': 'qa-lab', 'content-desk': 'content-studio', 'review-desk': 'owner-review',
  'analyst-desk': 'strategy-room', 'research-desk': 'knowledge-library', 'brand-desk': 'design-studio',
  'seo-desk': 'content-studio', 'video-desk': 'video-studio', 'audio-desk': 'audio-studio',
  'marketing-desk': 'command-room', 'proposal-desk': 'client-meeting-room', 'operations-desk': 'operations-finance',
  'creative-desk': 'command-room', 'social-desk': 'command-room', 'performance-desk': 'command-room',
  'copy-desk': 'content-studio', 'translation-desk': 'content-studio', 'graphic-desk': 'design-studio', 'photo-desk': 'design-studio',
  'motion-desk': 'video-studio', 'podcast-desk': 'audio-studio', 'finance-desk': 'operations-finance',
};

export function floorForRoom(roomKey: string) {
  return companyFloors.find(floor => floor.rooms.some(room => room.key === roomKey))?.key ?? 'delivery';
}

export function departmentForRoom(roomKey: string) {
  return companyDepartments.find(department => department.roomKey === roomKey ||
    (roomKey === 'audio-studio' && department.key === 'media-production') ||
    (roomKey === 'knowledge-library' && department.key === 'strategy-research'));
}
