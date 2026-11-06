import type { CompanyRoom } from './company-catalog.ts';
import { BUILDING, roomArchitecture, roomLocalToWorld, roomWorkstations } from './headquarters-architecture.ts';
import type { WorldPoint, WorldRect } from './headquarters-model.ts';

export function roomGlazingSegments(width: number) {
  const gap = BUILDING.doorWidth / 2;
  return [{ start: -width / 2, end: -gap }, { start: gap, end: width / 2 }]
    .filter(segment => segment.end > segment.start)
    .map(segment => ({ center: (segment.start + segment.end) / 2, length: segment.end - segment.start }));
}

export function roomFootprint(roomKey: string, rect: WorldRect): WorldRect {
  const plan = roomArchitecture[roomKey];
  const point = roomLocalToWorld(roomKey, rect);
  const swap = plan && Math.abs(Math.sin(plan.rotation)) > 0.5;
  return { ...point, width: swap ? rect.depth : rect.width, depth: swap ? rect.width : rect.depth };
}

// These local footprints also position the rendered partitions and desks.
export function architecturalBlockers(rooms: CompanyRoom[]): WorldRect[] {
  return rooms.flatMap(room => {
    const plan = roomArchitecture[room.key];
    if (!plan) return [];
    const [width, depth] = plan.size;
    const local: WorldRect[] = [
      ...(room.key === 'reception-lobby' ? [-1, 1].map(side => ({ x: side * (width + 2) / 4, z: -depth / 2, width: (width - 2) / 2, depth: 0.14 })) : [{ x: 0, z: -depth / 2, width, depth: 0.14 }]),
      ...[-1, 1].map(side => ({ x: side * width / 2, z: 0, width: 0.14, depth })),
      ...roomGlazingSegments(width).map(segment => ({ x: segment.center, z: depth / 2, width: segment.length, depth: 0.08 })),
    ];
    if (['work', 'design', 'content', 'engineering', 'qa', 'executive', 'audio', 'video', 'library', 'reception'].includes(plan.fitout)) {
      local.push(...roomWorkstations(room.key).map(point => ({ ...point, width: plan.fitout === 'reception' ? Math.min(width - 0.8, 3.2) : 2.4, depth: 0.85 })));
    }
    if (plan.fitout === 'meeting') local.push({ x: 0, z: 0, width: 4.2, depth: 1.4 });
    if (plan.fitout === 'kitchen') local.push({ x: 0, z: -depth / 2 + 0.45, width: Math.min(width - 0.6, 4.2), depth: 0.85 });
    if (plan.fitout === 'washroom') local.push({ x: 0, z: -depth / 2 + 1.1, width: width - 0.4, depth: 2 });
    return local.map(rect => roomFootprint(room.key, rect));
  });
}

export function roomArrivalPoint(room: CompanyRoom): WorldPoint {
  const plan = roomArchitecture[room.key];
  const point = plan ? roomLocalToWorld(room.key, { x: 0, z: plan.size[1] / 2 - 0.7 }) : { x: room.center[0], z: room.center[1] };
  return { x: Math.round(point.x * 2) / 2, z: Math.round(point.z * 2) / 2 };
}
