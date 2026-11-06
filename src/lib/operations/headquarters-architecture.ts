import type { WorldPoint } from './headquarters-model.ts';

export type RoomFitout = 'work' | 'design' | 'content' | 'engineering' | 'qa' | 'reception' | 'meeting' | 'library' | 'executive' | 'video' | 'audio' | 'kitchen' | 'washroom';
export type RoomArchitecture = {
  center: readonly [number, number];
  size: readonly [number, number];
  rotation: number;
  fitout: RoomFitout;
  capacity: number;
  intent: string;
  finish: 'oak' | 'carpet' | 'stone';
};

export const BUILDING = { width: 33.6, depth: 21, floorHeight: 3.8, clearHeight: 3.05, doorWidth: 1.4 } as const;
const north = (x: number, width: number, fitout: RoomFitout, capacity: number, intent: string, finish: RoomArchitecture['finish'] = 'carpet'): RoomArchitecture => ({ center: [x, -5.8], size: [width, 7.4], rotation: 0, fitout, capacity, intent, finish });
const south = (x: number, width: number, fitout: RoomFitout, capacity: number, intent: string, finish: RoomArchitecture['finish'] = 'carpet'): RoomArchitecture => ({ ...north(x, width, fitout, capacity, intent, finish), center: [x, 5.8], rotation: Math.PI });

// Stable identifiers preserve saved assignments. Dimensions describe the virtual
// architectural concept in metres; they do not represent a surveyed property.
export const roomArchitecture: Record<string, RoomArchitecture> = {
  'project-management': north(-12, 7.4, 'work', 4, 'A shared planning table, project wall, and space for short team reviews.'),
  'design-studio': north(-4, 7.8, 'design', 4, 'Paired workstations and a material library for visual and experience design.', 'oak'),
  'content-studio': north(4, 7.8, 'content', 4, 'Quiet writing desks, reference shelves, and a small editorial review table.'),
  'delivery-meeting': north(12, 7.4, 'meeting', 8, 'An eight-seat review room with a presentation screen and pin-up wall.', 'oak'),
  'qa-lab': south(-12, 7.4, 'qa', 4, 'A device testing bench and review station for checking the delivered experience.'),
  engineering: south(-4, 7.8, 'engineering', 4, 'Paired technical workstations, an equipment rack, and a collaboration wall.'),
  'owner-review': south(4, 7.8, 'executive', 3, 'A review desk and private lounge for discussing decisions with the owner.', 'oak'),
  reception: { center: [-13.1, 0], size: [2, 5.2], rotation: Math.PI / 2, fitout: 'reception', capacity: 2, intent: 'A compact arrival point beside the main circulation route.', finish: 'stone' },
  'team-kitchenette': { center: [12.3, 3.9], size: [3.6, 6.8], rotation: -Math.PI / 2, fitout: 'kitchen', capacity: 3, intent: 'A shared coffee counter and informal break seating.', finish: 'stone' },
  'team-restroom': { center: [12.3, 7.7], size: [3.6, 6.8], rotation: -Math.PI / 2, fitout: 'washroom', capacity: 2, intent: 'Private washroom facilities grouped with the building services.', finish: 'stone' },
  'reception-lobby': south(-11, 9, 'reception', 6, 'Visitor arrival, a staffed reception counter, and a comfortable waiting lounge.', 'stone'),
  'client-meeting-room': north(-1.5, 9, 'meeting', 8, 'A client presentation room placed close to reception.', 'oak'),
  'knowledge-library': north(9, 11, 'library', 6, 'A reference wall, shared reading table, and quiet research workstation.', 'oak'),
  'people-academy': north(-11, 9, 'work', 4, 'Training and agent configuration with a shared discussion area.'),
  'operations-finance': south(-1.5, 9, 'work', 4, 'Operational planning desks and organized storage for working documents.'),
  'ground-kitchenette': south(8, 7, 'kitchen', 4, 'A team kitchen and café table away from the visitor rooms.', 'stone'),
  'ground-restroom': south(13.5, 3.8, 'washroom', 2, 'A compact private facilities suite.', 'stone'),
  'founder-office': north(-11, 9, 'executive', 4, 'Leadership desk, reference shelving, and a small conversation lounge.', 'oak'),
  'command-room': north(-1.5, 9, 'work', 4, 'Campaign planning and company coordination around a shared workbench.'),
  'video-studio': north(9, 11, 'video', 4, 'A cyclorama, camera position, soft lighting, and a dedicated edit station.'),
  'audio-studio': south(-11, 9, 'audio', 3, 'A mixing desk, nearfield speakers, keyboard, and timber acoustic diffusers.'),
  'strategy-room': south(-1.5, 9, 'meeting', 8, 'An eight-seat strategy table with a large writable wall.', 'oak'),
  'leadership-kitchenette': south(8, 7, 'kitchen', 4, 'A team coffee point beside the media and strategy rooms.', 'stone'),
  'leadership-restroom': south(13.5, 3.8, 'washroom', 2, 'Private facilities beside the service core.', 'stone'),
};

export function roomLocalToWorld(roomKey: string, point: WorldPoint): WorldPoint {
  const room = roomArchitecture[roomKey];
  if (!room) return point;
  return { x: room.center[0] + point.x * Math.cos(room.rotation) + point.z * Math.sin(room.rotation), z: room.center[1] - point.x * Math.sin(room.rotation) + point.z * Math.cos(room.rotation) };
}

export function roomWorldSize(room: RoomArchitecture): readonly [number, number] {
  return Math.abs(Math.sin(room.rotation)) > 0.5 ? [room.size[1], room.size[0]] : room.size;
}

export function roomWorkstations(roomKey: string): WorldPoint[] {
  const room = roomArchitecture[roomKey];
  if (!room) return [];
  if (roomKey === 'reception-lobby') return [{ x: -2.1, z: -0.4 }];
  if (room.fitout === 'reception') return [{ x: 0, z: -room.size[1] / 2 + 1.35 }];
  if (room.fitout === 'video') return [{ x: room.size[0] / 2 - 1.6, z: 1.2 }];
  if (room.fitout === 'library') return [{ x: room.size[0] / 2 - 1.7, z: -1.6 }];
  if (room.fitout === 'meeting') return [{ x: -1.7, z: -0.95 }];
  if (room.fitout === 'executive' || room.fitout === 'audio') return [{ x: 0, z: -1.55 }];
  if (room.fitout === 'kitchen' || room.fitout === 'washroom') return [];
  return [{ x: -1.65, z: -1.35 }, { x: 1.65, z: -1.35 }];
}
