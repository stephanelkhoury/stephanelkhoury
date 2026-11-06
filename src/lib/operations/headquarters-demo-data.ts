import type { HeadquartersCharacter } from './headquarters-types';

const emptyUsage = { records: 0, inputTokens: 0, outputTokens: 0, reportedCostUsd: '0', estimatedCostUsd: '0' };

function demoCharacter(input: {
  key: string;
  name: string;
  title: string;
  department: string;
  room: string;
  desk: string;
  agentKey?: string;
  capabilities?: string[];
  appearance: HeadquartersCharacter['appearance'];
  isOwner?: boolean;
}): HeadquartersCharacter {
  return {
    id: `demo-${input.key}`,
    key: input.key,
    displayName: `${input.name} (Demo)`,
    jobTitle: input.title,
    department: input.department,
    roomKey: input.room,
    deskKey: input.desk,
    communicationStyle: 'Fictional starter identity. No agent conversation or work is connected.',
    appearance: input.appearance,
    isOwner: input.isOwner ?? false,
    status: input.isOwner ? 'OWNER' : 'NOT_CONNECTED',
    agent: input.agentKey ? {
      id: `demo-agent-${input.key}`,
      key: input.agentKey,
      enabled: false,
      capabilities: input.capabilities ?? [],
      version: null,
      versionStatus: null,
      allowedTools: [],
    } : null,
    currentTask: null,
    taskHistory: [],
    toolActivity: [],
    deliverables: [],
    usage: emptyUsage,
  };
}

export const headquartersDemoProfiles: HeadquartersCharacter[] = [
  demoCharacter({ key: 'stephan', name: 'Stephan El Khoury', title: 'Owner', department: 'Leadership', room: 'owner-review', desk: 'review-desk', appearance: { skinTone: '#B87554', hairStyle: 'short-wavy', hairColor: '#29241F', clothingColor: '#315B5A', accentColor: '#D58A64', accessory: 'notebook' }, isOwner: true }),
  demoCharacter({ key: 'receptionist', name: 'Receptionist', title: 'Reception & Intake Specialist', department: 'Reception & intake', room: 'reception-lobby', desk: 'lobby-reception-desk', agentKey: 'receptionist', capabilities: ['request triage', 'department handoff', 'reply draft'], appearance: { skinTone: '#C88C68', hairStyle: 'curly-bob', hairColor: '#382822', clothingColor: '#536B76', accentColor: '#9BBBC2', accessory: 'headset' } }),
  demoCharacter({ key: 'maya', name: 'Maya', title: 'Project Manager', department: 'Project management', room: 'project-management', desk: 'pm-desk', agentKey: 'project-manager', capabilities: ['brief clarification', 'task coordination'], appearance: { skinTone: '#D69A73', hairStyle: 'curly-bob', hairColor: '#382822', clothingColor: '#466F78', accentColor: '#86B3B5', accessory: 'headset' } }),
  demoCharacter({ key: 'leo', name: 'Leo', title: 'UX/UI Designer', department: 'Design', room: 'design-studio', desk: 'design-desk', agentKey: 'ux-ui-designer', capabilities: ['interface specification', 'accessibility planning'], appearance: { skinTone: '#E1B08C', hairStyle: 'side-swept', hairColor: '#40312A', clothingColor: '#65728A', accentColor: '#A5AFCA', accessory: 'pencil' } }),
  demoCharacter({ key: 'adam', name: 'Adam', title: 'Full-Stack Engineer', department: 'Engineering', room: 'engineering', desk: 'engineering-desk', agentKey: 'full-stack-engineer', capabilities: ['approved implementation', 'test reporting'], appearance: { skinTone: '#A96E4F', hairStyle: 'short-coils', hairColor: '#201C1A', clothingColor: '#456A58', accentColor: '#9BB393', accessory: 'glasses' } }),
  demoCharacter({ key: 'nora', name: 'Nora', title: 'QA Engineer', department: 'Quality assurance', room: 'qa-lab', desk: 'qa-desk', agentKey: 'qa-engineer', capabilities: ['acceptance checks', 'accessibility review'], appearance: { skinTone: '#E5C1A0', hairStyle: 'long-braid', hairColor: '#4A3025', clothingColor: '#82644D', accentColor: '#C4A27C', accessory: 'tablet' } }),
  demoCharacter({ key: 'sami', name: 'Sami', title: 'SEO & Content Specialist', department: 'SEO and content', room: 'content-studio', desk: 'content-desk', agentKey: 'content-specialist', capabilities: ['content drafting', 'metadata review'], appearance: { skinTone: '#C78E68', hairStyle: 'wavy-medium', hairColor: '#30231E', clothingColor: '#715A72', accentColor: '#B89CB8', accessory: 'headphones' } }),
];
const additionalDemoStaff = [
  ['ella', 'Ella', 'Business Analyst', 'strategy-room', 'analyst-desk', 'business-analyst'],
  ['zara', 'Zara', 'Researcher', 'knowledge-library', 'research-desk', 'researcher'],
  ['iris', 'Iris', 'Brand Designer', 'design-studio', 'brand-desk', 'brand-designer'],
  ['omar', 'Omar', 'SEO Specialist', 'content-studio', 'seo-desk', 'seo-specialist'],
  ['jules', 'Jules', 'Video Editor', 'video-studio', 'video-desk', 'video-editor'],
  ['kai', 'Kai', 'Audio & Music Specialist', 'audio-studio', 'audio-desk', 'audio-music-specialist'],
  ['lina', 'Lina', 'Marketing Planner', 'command-room', 'marketing-desk', 'marketing-planner'],
  ['noah', 'Noah', 'Proposal Specialist', 'client-meeting-room', 'proposal-desk', 'proposal-specialist'],
  ['raya', 'Raya', 'Operations Assistant', 'operations-finance', 'operations-desk', 'operations-assistant'],
];
headquartersDemoProfiles.push(...additionalDemoStaff.map(([key, name, title, room, desk, agentKey], index) => demoCharacter({ key, name, title, department: title, room, desk, agentKey, appearance: { skinTone: ['#D5A47F', '#A76C4C', '#E1BA96'][index % 3], hairStyle: ['side-swept', 'curly-bob', 'short-wavy'][index % 3], hairColor: '#49382C', clothingColor: ['#687E69', '#7B7160', '#927965'][index % 3], accentColor: '#B7C49D', accessory: index % 2 ? 'glasses' : 'notebook' } })));
