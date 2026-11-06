export type WorldPoint = { x: number; z: number };
export type WorldRect = WorldPoint & { width: number; depth: number };
export type CharacterStatus = 'NOT_CONNECTED' | 'DISABLED' | 'IDLE' | 'SLEEPING' | 'IN_MEETING' | 'QUEUED' | 'WORKING' | 'WAITING_FOR_OWNER' | 'REVIEW_REQUIRED' | 'BLOCKED' | 'FAILED' | 'COMPLETED';

export const FIRST_FLOOR_BOUNDS = { minX: -16, maxX: 16, minZ: -10, maxZ: 10, cellSize: 0.5 } as const;
export const OWNER_SPAWN: WorldPoint = { x: -10.5, z: 0 };

export const FIRST_FLOOR_ROOMS = [
  { key: 'reception', name: 'Reception', department: 'Brief intake', center: [-10, 0], size: [7, 8], color: '#D5C6A7', access: 'ACTIVE' },
  { key: 'project-management', name: 'Project management', department: 'Maya', center: [-3, -6], size: [7, 7], color: '#9BBCC0', access: 'ACTIVE' },
  { key: 'design-studio', name: 'Design studio', department: 'Leo', center: [4, -6], size: [7, 7], color: '#C8B3A1', access: 'ACTIVE' },
  { key: 'content-studio', name: 'Content studio', department: 'Sami', center: [11, -6], size: [7, 7], color: '#A8B5A0', access: 'ACTIVE' },
  { key: 'qa-lab', name: 'QA lab', department: 'Nora', center: [-3, 6], size: [7, 7], color: '#B9C1C9', access: 'ACTIVE' },
  { key: 'engineering', name: 'Engineering', department: 'Adam', center: [4, 6], size: [7, 7], color: '#9EAEB8', access: 'ACTIVE' },
  { key: 'owner-review', name: 'Owner review', department: 'Stephan', center: [11, 6], size: [7, 7], color: '#D0B99A', access: 'ACTIVE' },
  { key: 'team-kitchenette', name: 'Kitchenette', department: 'Team break space', center: [-3, 0], size: [3.2, 3.8], color: '#B9C1B5', access: 'ACTIVE' },
  { key: 'team-restroom', name: 'Restroom', department: 'Accessible facilities', center: [3, 0], size: [3.6, 3.8], color: '#AEBBC0', access: 'ACTIVE' },
  { key: 'delivery-meeting', name: 'Meeting room', department: 'Project reviews', center: [10, 0], size: [6, 3.8], color: '#C4B39F', access: 'ACTIVE' },
] as const;

export const PLANNED_HEADQUARTERS_LEVELS = [
  {
    key: 'leadership',
    label: 'Level 03 · Leadership & Media',
    elevation: 5.4,
    status: 'PLANNED',
    rooms: [
      { key: 'founder-office', name: 'Founder office', purpose: 'Executive office', center: [-11, -5], size: [9, 8], color: '#B9A6CF' },
      { key: 'command-room', name: 'Command room', purpose: 'Company command room', center: [-1, -5], size: [9, 8], color: '#9E9CCF' },
      { key: 'video-studio', name: 'Video studio', purpose: 'Video production', center: [8.5, -5], size: [8, 8], color: '#BFA6A0' },
      { key: 'audio-studio', name: 'Music studio', purpose: 'Audio and music', center: [-11, 5], size: [9, 8], color: '#C4A68E' },
      { key: 'strategy-room', name: 'Strategy meeting', purpose: 'Leadership planning', center: [-1, 5], size: [9, 8], color: '#AAA6C5' },
      { key: 'leadership-kitchenette', name: 'Kitchenette', purpose: 'Staff break space', center: [8, 5], size: [5, 6], color: '#B9C1B5' },
      { key: 'leadership-restroom', name: 'Restrooms', purpose: 'Accessible facilities', center: [13.5, 5], size: [4, 6], color: '#AEBBC0' },
    ],
  },
  {
    key: 'business',
    label: 'Ground · Business & People',
    elevation: -5.4,
    status: 'PLANNED',
    rooms: [
      { key: 'reception-lobby', name: 'Reception & waiting', purpose: 'Reception desk and visitor lounge', center: [-11, -5], size: [9, 8], color: '#D2C0A2' },
      { key: 'client-meeting-room', name: 'Client meeting', purpose: 'Client meetings', center: [-1, -5], size: [9, 8], color: '#C9B89E' },
      { key: 'knowledge-library', name: 'Knowledge library', purpose: 'Knowledge library', center: [9, -5], size: [10, 8], color: '#B8A88D' },
      { key: 'people-academy', name: 'HR & Agent Academy', purpose: 'People and agent academy', center: [-11, 5], size: [9, 8], color: '#A8B9A7' },
      { key: 'operations-finance', name: 'Operations & finance', purpose: 'Operations and finance', center: [-1, 5], size: [9, 8], color: '#A9B2B7' },
      { key: 'ground-kitchenette', name: 'Kitchenette', purpose: 'Staff break space', center: [8, 5], size: [5, 6], color: '#B9C1B5' },
      { key: 'ground-restroom', name: 'Restrooms', purpose: 'Accessible facilities', center: [13.5, 5], size: [4, 6], color: '#AEBBC0' },
    ],
  },
] as const;

export const HEADQUARTERS_LEVEL_GAP = 5.4;

export const FLOOR_WALLS: WorldRect[] = [
  { x: -6.5, z: -2.5, width: 2, depth: 0.16 }, { x: 0.5, z: -2.5, width: 2, depth: 0.16 },
  { x: 2.5, z: -2.5, width: 2, depth: 0.16 }, { x: 6.5, z: -2.5, width: 2, depth: 0.16 },
  { x: 8.5, z: -2.5, width: 2, depth: 0.16 }, { x: 12.5, z: -2.5, width: 2, depth: 0.16 },
  { x: -6.5, z: 2.5, width: 2, depth: 0.16 }, { x: -2.5, z: 2.5, width: 2, depth: 0.16 },
  { x: 0.5, z: 2.5, width: 2, depth: 0.16 }, { x: 4.5, z: 2.5, width: 2, depth: 0.16 },
  { x: 8.5, z: 2.5, width: 2, depth: 0.16 }, { x: 12.5, z: 2.5, width: 2, depth: 0.16 },
  { x: -6.5, z: 0, width: 0.16, depth: 3 },
  { x: 0.5, z: -6, width: 0.16, depth: 2 }, { x: 7.5, z: -6, width: 0.16, depth: 2 },
  { x: 0.5, z: 6, width: 0.16, depth: 2 }, { x: 7.5, z: 6, width: 0.16, depth: 2 },
];

export const FLOOR_FURNITURE_BLOCKERS: WorldRect[] = [
  { x: -11, z: 2.5, width: 3.2, depth: 0.9 },
  { x: -3, z: -7.3, width: 2, depth: 1.1 }, { x: 4, z: -7.3, width: 2, depth: 1.1 },
  { x: 11, z: -7.3, width: 2, depth: 1.1 }, { x: -3, z: 7.3, width: 2, depth: 1.1 },
  { x: 4, z: 7.3, width: 2, depth: 1.1 }, { x: 11, z: 7.3, width: 2, depth: 1.1 },
  { x: -1.7, z: -6.3, width: 0.8, depth: 0.8 }, { x: 5.3, z: -6.3, width: 0.8, depth: 0.8 },
  { x: 12.3, z: -6.3, width: 0.8, depth: 0.8 }, { x: -1.7, z: 8.3, width: 0.8, depth: 0.8 },
  { x: 5.3, z: 8.3, width: 0.8, depth: 0.8 }, { x: 12.3, z: 8.3, width: 0.8, depth: 0.8 },
  { x: -3, z: 0.8, width: 2.8, depth: 0.65 }, { x: 3, z: -0.75, width: 2.2, depth: 0.6 },
  { x: 10, z: 1.1, width: 4.2, depth: 1.1 },
  { x: -13.1, z: -7.9, width: 0.8, depth: 0.8 }, { x: -13.1, z: 7.9, width: 0.8, depth: 0.8 },
  { x: 13.1, z: -1.7, width: 0.8, depth: 0.8 }, { x: 13.1, z: 1.7, width: 0.8, depth: 0.8 },
];

export const FLOOR_BLOCKERS = [...FLOOR_WALLS, ...FLOOR_FURNITURE_BLOCKERS];

export const DESK_POSITIONS: Record<string, WorldPoint> = {
  'reception-desk': { x: -11, z: -0.2 },
  'lobby-reception-desk': { x: -11, z: -8.2 },
  'pm-desk': { x: -3, z: -7.3 },
  'design-desk': { x: 4, z: -7.3 },
  'content-desk': { x: 11, z: -7.3 },
  'qa-desk': { x: -3, z: 7.3 },
  'engineering-desk': { x: 4, z: 7.3 },
  'review-desk': { x: 11, z: 4.4 },
  'analyst-desk': { x: -1, z: 3.3 },
  'research-desk': { x: 9, z: -6.6 },
  'brand-desk': { x: 5.5, z: -4.4 },
  'seo-desk': { x: 12.5, z: -4.4 },
  'video-desk': { x: 11, z: -2.4 },
  'audio-desk': { x: -11, z: 3.3 },
  'marketing-desk': { x: -1, z: -6.6 },
  'proposal-desk': { x: -1, z: -6.6 },
  'operations-desk': { x: -1, z: 3.4 },
};

const PRESENCE_LABELS: Record<string, string> = {
  IDLE: 'Available',
  SLEEPING: 'Sleeping',
  IN_MEETING: 'In meeting',
  WORKING: 'Working',
  QUEUED: 'Queued',
  NOT_CONNECTED: 'Not available',
  DISABLED: 'Not available',
  WAITING_FOR_OWNER: 'Waiting for you',
  REVIEW_REQUIRED: 'Review required',
  OWNER: 'You',
};

export function presenceLabel(status: string) {
  return PRESENCE_LABELS[status] ?? status.replaceAll('_', ' ').toLowerCase().replace(/^./, letter => letter.toUpperCase());
}

export function resolveCharacterStatus(input: {
  latestTaskStatus?: string | null;
  latestRunStatus?: string | null;
  enabled: boolean;
  approvedVersion: boolean;
  executionConnected: boolean;
  inMeeting?: boolean;
  modelAwake?: boolean | null;
}): CharacterStatus {
  const taskStatus = input.latestTaskStatus?.toUpperCase();
  if (taskStatus === 'RUNNING' || taskStatus === 'IN_PROGRESS') return 'WORKING';
  if (input.inMeeting) return 'IN_MEETING';
  if (taskStatus === 'QUEUED' || taskStatus === 'READY' || taskStatus === 'TODO') return 'QUEUED';
  if (taskStatus === 'DRAFT' || taskStatus === 'AWAITING_INPUT') return 'WAITING_FOR_OWNER';
  if (taskStatus === 'AWAITING_APPROVAL' || taskStatus === 'IN_REVIEW') return 'REVIEW_REQUIRED';
  if (taskStatus === 'SUCCEEDED' && input.latestRunStatus === 'AWAITING_APPROVAL') return 'REVIEW_REQUIRED';
  if (taskStatus === 'BLOCKED') return 'BLOCKED';
  if (taskStatus === 'FAILED') return 'FAILED';
  // Finished work no longer occupies the employee; fall through to live presence.
  if (!input.executionConnected) return 'NOT_CONNECTED';
  if (!input.enabled || !input.approvedVersion) return 'DISABLED';
  if (input.modelAwake === false) return 'SLEEPING';
  return 'IDLE';
}

function collides(point: WorldPoint, blockers: readonly WorldRect[], clearance: number) {
  return blockers.some((rect) =>
    Math.abs(point.x - rect.x) < rect.width / 2 + clearance &&
    Math.abs(point.z - rect.z) < rect.depth / 2 + clearance,
  );
}

// Alternates sides of the meeting table so attendees face each other.
export function meetingSeat(center: readonly [number, number], index: number): WorldPoint {
  const columns = [-1.2, 0, 1.2];
  const side = index % 2 === 0 ? -1 : 1;
  return { x: center[0] + columns[Math.floor(index / 2) % columns.length], z: center[1] + side * 1.55 };
}

export function canOccupyWorldPoint(point: WorldPoint, blockers: readonly WorldRect[] = FLOOR_BLOCKERS, clearance = 0.28) {
  return point.x >= FIRST_FLOOR_BOUNDS.minX + clearance &&
    point.x <= FIRST_FLOOR_BOUNDS.maxX - clearance &&
    point.z >= FIRST_FLOOR_BOUNDS.minZ + clearance &&
    point.z <= FIRST_FLOOR_BOUNDS.maxZ - clearance &&
    !collides(point, blockers, clearance);
}

export function findWalkPath(start: WorldPoint, destination: WorldPoint, blockers: readonly WorldRect[] = FLOOR_BLOCKERS): WorldPoint[] {
  const { minX, maxX, minZ, maxZ, cellSize } = FIRST_FLOOR_BOUNDS;
  const toCell = (point: WorldPoint) => ({
    x: Math.round((point.x - minX) / cellSize),
    z: Math.round((point.z - minZ) / cellSize),
  });
  const toPoint = (cell: WorldPoint): WorldPoint => ({ x: minX + cell.x * cellSize, z: minZ + cell.z * cellSize });
  const source = toCell(start);
  const target = toCell(destination);
  const keyOf = (cell: WorldPoint) => `${cell.x},${cell.z}`;
  const sourceKey = keyOf(source);
  const targetKey = keyOf(target);
  const queue = [source];
  const previous = new Map<string, string | null>([[sourceKey, null]]);
  const points = new Map<string, WorldPoint>([[sourceKey, source]]);
  const directions = [{ x: 1, z: 0 }, { x: -1, z: 0 }, { x: 0, z: 1 }, { x: 0, z: -1 }];

  while (queue.length) {
    const current = queue.shift()!;
    const currentKey = keyOf(current);
    if (currentKey === targetKey) break;

    for (const direction of directions) {
      const next = { x: current.x + direction.x, z: current.z + direction.z };
      const nextKey = keyOf(next);
      const nextPoint = toPoint(next);
      if (previous.has(nextKey) || nextPoint.x > maxX || nextPoint.z > maxZ || !canOccupyWorldPoint(nextPoint, blockers)) continue;
      previous.set(nextKey, currentKey);
      points.set(nextKey, next);
      queue.push(next);
    }
  }

  if (!previous.has(targetKey) || !canOccupyWorldPoint(toPoint(source), blockers)) return [];
  const path: WorldPoint[] = [];
  let cursor: string | null = targetKey;
  while (cursor && cursor !== sourceKey) {
    const cell = points.get(cursor);
    if (cell) path.push(toPoint(cell));
    cursor = previous.get(cursor) ?? null;
  }
  return path.reverse();
}