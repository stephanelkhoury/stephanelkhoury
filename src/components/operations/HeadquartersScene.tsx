'use client';

import { Html, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { ACESFilmicToneMapping, Vector3, type PerspectiveCamera as Camera } from 'three';
import { companyFloors, type CompanyRoom, type HeadquartersView } from '@/lib/operations/company-catalog';
import { BUILDING, roomArchitecture, roomWorkstations } from '@/lib/operations/headquarters-architecture';
import { architecturalBlockers, roomGlazingSegments } from '@/lib/operations/company-navigation';
import type { WorldPoint } from '@/lib/operations/headquarters-model';
import type { HeadquartersCharacter } from '@/lib/operations/headquarters-types';
import { ArchitectureMaterials, Block, Pendant, Plant, Sign, StudioReflections, Tube } from './headquarters/ArchitectureKit';
import { RoomFitout } from './headquarters/RoomFitouts';
import { Person, WalkingOwner } from './headquarters/People';

type Props = {
  characters: HeadquartersCharacter[];
  destination: WorldPoint | null;
  sceneView: HeadquartersView;
  resetViewKey: number;
  reducedMotion: boolean;
  quality: 'standard' | 'low';
  compact: boolean;
  selectedCharacterId: string | null;
  focusedRoom: string | null;
  lighting: 'day' | 'evening';
  viewStyle: 'spatial' | 'plan';
  wayfinding: boolean;
  onSelectCharacter: (id: string) => void;
  onMoveTo: (point: WorldPoint) => void;
  onSelectRoom: (key: string) => void;
  onSelectFloor: (key: HeadquartersView) => void;
};

function WindowWall({ width, at, rotation = 0, low = false, entrance = false }: { width: number; at: [number, number, number]; rotation?: number; low?: boolean; entrance?: boolean }) {
  const height = low ? 1.05 : BUILDING.clearHeight;
  const panels = Math.max(1, Math.round(width / 1.8));
  if (entrance) return <group position={at} rotation={[0, rotation, 0]}>
    {[-1, 1].map(side => <WindowWall key={side} width={(width - 2) / 2} at={[side * (width + 2) / 4, 0, 0]} />)}
    <Block at={[0, 1.4, 0]} size={[2, 2.8, 0.025]} finish="glass" />
    {[-1, 0, 1].map(x => <Block key={x} at={[x, 1.4, 0]} size={[0.04, 2.8, 0.06]} finish="metal" />)}
    <Block at={[0, 2.82, 0]} size={[2.05, 0.06, 0.065]} finish="metal" />
    {[-0.12, 0.12].map(x => <Tube key={x} at={[x, 1.13, -0.05]} radius={0.014} height={0.5} finish="brass" />)}
  </group>;
  return <group position={at} rotation={[0, rotation, 0]}>
    <Block at={[0, 0.26, 0]} size={[width, 0.52, 0.16]} finish="stone" />
    <Block at={[0, (height + 0.52) / 2, 0]} size={[width, height - 0.52, 0.025]} finish="glass" />
    <Block at={[0, height, 0]} size={[width, 0.055, 0.07]} finish="metal" />
    {Array.from({ length: panels + 1 }, (_, index) => <Block key={index} at={[-width / 2 + index * width / panels, height / 2, 0]} size={[0.035, height, 0.065]} finish="metal" />)}
    {!low && <Block at={[0, 2.48, 0]} size={[width, 0.035, 0.055]} finish="metal" />}
  </group>;
}

function Room({ room, index, props, overview }: { room: CompanyRoom; index: number; props: Props; overview: boolean }) {
  const plan = roomArchitecture[room.key];
  const [width, depth] = plan.size;
  const selected = props.focusedRoom === room.key;
  const staff = props.characters.filter(person => person.roomKey === room.key && !person.isOwner);
  const stations = roomWorkstations(room.key);
  const code = `${companyFloors.find(floor => floor.rooms.some(item => item.key === room.key))!.number}.${String(index + 1).padStart(2, '0')}`;
  const showLabel = props.wayfinding && !overview && (!props.focusedRoom || selected);
  return <group position={[plan.center[0], 0.085, plan.center[1]]} rotation={[0, plan.rotation, 0]}>
    <Block at={[0, -0.02, 0]} size={[width - 0.09, 0.045, depth - 0.09]} finish={plan.finish} onClick={() => props.onSelectRoom(room.key)} />
    {plan.finish === 'oak' && !overview && Array.from({ length: Math.floor(width / 0.32) }, (_, line) => <Block key={line} at={[-width / 2 + 0.32 + line * 0.32, 0.005, 0]} size={[0.006, 0.002, depth - 0.12]} color="#a08b6e" />)}
    {selected && <><Block at={[0, 0.011, depth / 2 - 0.13]} size={[width - 0.18, 0.008, 0.035]} finish="brass" /><Block at={[-width / 2 + 0.13, 0.011, 0]} size={[0.035, 0.008, depth - 0.2]} finish="brass" /></>}
    <WindowWall width={width} at={[0, 0, -depth / 2]} low={plan.fitout === 'washroom'} entrance={room.key === 'reception-lobby'} />
    {[-1, 1].map(side => <group key={side}>
      <Block at={[side * width / 2, 1.49, 0]} size={[0.13, 2.98, depth]} finish="plaster" />
      <Block at={[side * (width / 2 - 0.075), 0.07, 0]} size={[0.02, 0.12, depth]} finish="walnut" />
      <Block at={[side * (width / 2 - 0.08), 2.91, 0]} size={[0.025, 0.035, depth - 0.25]} finish="light" />
    </group>)}
    {roomGlazingSegments(width).map((segment, part) => <group key={part}>
      <Block at={[segment.center, 1.42, depth / 2]} size={[segment.length, 2.8, 0.018]} finish="glass" />
      <Block at={[segment.center, 2.83, depth / 2]} size={[segment.length, 0.045, 0.055]} finish="metal" />
      <Block at={[segment.center, 0.035, depth / 2]} size={[segment.length, 0.035, 0.06]} finish="metal" />
      <Block at={[segment.center, 1.04, depth / 2 + 0.016]} size={[segment.length - 0.1, 0.1, 0.002]} color="#b7beb4" />
    </group>)}
    {[-1, 1].map(side => <Block key={side} at={[side * BUILDING.doorWidth / 2, 1.42, depth / 2]} size={[0.038, 2.84, 0.055]} finish="metal" />)}
    <Block at={[0, 2.83, depth / 2]} size={[BUILDING.doorWidth, 0.05, 0.055]} finish="metal" />
    <group position={[-BUILDING.doorWidth / 2, 0, depth / 2]} rotation={[0, -1.35, 0]}>
      <Block at={[0.42, 1.35, 0]} size={[0.84, 2.64, 0.018]} finish="glass" />
      <Tube at={[0.7, 1.08, 0.04]} radius={0.012} height={0.25} finish="brass" />
    </group>
    <Block at={[Math.min(width / 2 - 0.75, 1.4), 1.5, depth / 2 + 0.02]} size={[0.85, 0.32, 0.018]} finish="walnut" />
    <Sign text={code} at={[Math.min(width / 2 - 0.75, 1.4), 1.5, depth / 2 + 0.035]} width={0.75} height={0.23} color="#e8e2d3" background="#685b45" />
    <RoomFitout roomKey={room.key} overview={overview} />
    <Pendant at={[0, 2.75, plan.fitout === 'meeting' ? 0 : -1.35]} length={Math.min(width - 1, 3.2)} evening={props.lighting === 'evening' && !overview} />
    {staff.map(person => {
      const station = stations[staff.indexOf(person) % Math.max(stations.length, 1)] ?? { x: 0, z: 0 };
      const reception = plan.fitout === 'reception';
      const visitorReception = room.key === 'reception-lobby';
      const meeting = plan.fitout === 'meeting';
      const position: [number, number, number] = [station.x, 0.015, station.z + (visitorReception ? 0.8 : reception ? -0.8 : meeting ? -0.23 : 0.95)];
      return <group key={person.id} position={position} rotation={[0, reception && !visitorReception ? 0 : Math.PI, 0]}><Person character={person} selected={props.selectedCharacterId === person.id} showLabel={!overview && selected} reducedMotion={props.reducedMotion} onSelect={() => props.onSelectCharacter(person.id)} /></group>;
    })}
    {showLabel && <Html position={[0, 0.15, depth / 2 - 0.75]} center zIndexRange={[10, 0]}><button className={`studio-room-label architectural-room-label ${selected ? 'selected' : ''}`} onClick={event => { event.stopPropagation(); props.onSelectRoom(room.key); }}><em>{code}</em><span>{room.name}</span><small>{plan.capacity} places · {Math.round(width * depth)} m²</small></button></Html>}
  </group>;
}

function Story({ floorKey, elevation, props, overview }: { floorKey: Exclude<HeadquartersView, 'building'>; elevation: number; props: Props; overview: boolean }) {
  const floor = companyFloors.find(floor => floor.key === floorKey)!;
  const blockers = useMemo(() => architecturalBlockers(floor.rooms), [floor.rooms]);
  const owner = props.characters.find(person => person.isOwner);
  return <group position={[0, elevation, 0]}>
    <Block at={[0, -0.19, 0]} size={[BUILDING.width, 0.38, BUILDING.depth]} finish="stone" />
    <Block at={[0, -0.025, 0]} size={[BUILDING.width - 0.25, 0.04, BUILDING.depth - 0.25]} finish="stone" />
    <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} onClick={event => { if (overview || floorKey !== 'delivery') return; event.stopPropagation(); props.onMoveTo({ x: event.point.x, z: event.point.z }); if (event.nativeEvent.target instanceof HTMLCanvasElement) event.nativeEvent.target.focus(); }}><planeGeometry args={[32, 20]} /><meshStandardMaterial color="#d7d0c1" roughness={0.85} /></mesh>
    {!overview && Array.from({ length: 20 }, (_, index) => <Block key={index} at={[-15.2 + index * 1.6, 0.019, 0]} size={[0.008, 0.002, 4.1]} color="#bcb6a8" />)}
    <Block at={[1.6, 0.024, -1.65]} size={[28.4, 0.005, 0.025]} finish="brass" />
    <Block at={[1.6, 0.024, 1.65]} size={[28.4, 0.005, 0.025]} finish="brass" />
    {floor.rooms.map((room, index) => <Room key={room.key} room={room} index={index} props={props} overview={overview} />)}
    {[-16.1, 16.1].flatMap(x => [-10.05, 0, 10.05].map(z => <Block key={`${x}:${z}`} at={[x, 1.71, z]} size={[0.28, 3.42, 0.28]} finish="concrete" />))}
    <WindowWall width={20.3} at={[-16.45, 0, 0]} rotation={Math.PI / 2} />
    <Block at={[0, 3.2, -10.13]} size={[33.3, 0.44, 0.28]} finish="stone" />
    <Block at={[0, 3.2, 10.13]} size={[33.3, 0.44, 0.28]} finish="stone" />
    <Block at={[0, -0.07, 10.54]} size={[33.6, 0.16, 0.08]} finish="metal" />
    <Sign text={`M / ${floor.number} — ${floor.name.toUpperCase()}`} at={[0, -0.17, 10.56]} width={8} height={0.2} color="#e6e0d2" background="#38413a" />
    {floorKey === 'delivery' && owner && !overview && <WalkingOwner character={owner} destination={props.destination} blockers={blockers} reducedMotion={props.reducedMotion} selected={props.selectedCharacterId === owner.id} showLabel={props.wayfinding && !props.focusedRoom} onSelect={() => props.onSelectCharacter(owner.id)} />}
    {!overview && <>
      <Sign text={`MULTIGRAPHIC / ${floor.number}`} at={[-2, 0.025, 0]} width={4} height={0.6} rotation={[-Math.PI / 2, 0, 0]} color="#858674" background="#d7d0c1" />
      <Plant at={[15.1, 0.05, 0]} scale={0.95} />
    </>}
    {overview && props.wayfinding && <Html position={[-17.2, 1.1, 10.5]} center zIndexRange={[12, 0]}><button className="architecture-floor-tag" onClick={() => props.onSelectFloor(floorKey)}><b>{floor.number}</b><span>{floor.name}<small>Explore this level ↗</small></span></button></Html>}
  </group>;
}

function StairCore({ building }: { building: boolean }) {
  const height = building ? BUILDING.floorHeight * 3 : BUILDING.floorHeight;
  const levels = building ? [0, 1, 2] : [0];
  return <group position={[18.7, 0, 0]}>
    <Block at={[0, -0.2, 0]} size={[4.1, 0.4, 7.4]} finish="stone" />
    {levels.map(level => <WindowWall key={level} width={7.4} at={[2.05, level * BUILDING.floorHeight, 0]} rotation={Math.PI / 2} />)}
    {levels.map(level => <group key={level} position={[0, level * BUILDING.floorHeight, 0]}>
      <Block at={[-1.8, 0, 0]} size={[1.8, 0.2, 3]} finish="stone" />
      <Block at={[0, BUILDING.floorHeight / 2, 0.7]} size={[3.6, 0.16, 1.3]} finish="stone" />
      {Array.from({ length: 12 }, (_, index) => <group key={index}>
        <Block at={[-0.94, index * BUILDING.floorHeight / 24, -2.6 + index * 0.27]} size={[1.45, 0.095, 0.3]} finish="oak" />
        <Block at={[0.94, BUILDING.floorHeight / 2 + index * BUILDING.floorHeight / 24, 0.37 - index * 0.27]} size={[1.45, 0.095, 0.3]} finish="oak" />
        {index % 3 === 0 && <><Tube at={[-1.65, index * BUILDING.floorHeight / 24 + 0.45, -2.6 + index * 0.27]} radius={0.012} height={0.9} /><Tube at={[1.65, BUILDING.floorHeight / 2 + index * BUILDING.floorHeight / 24 + 0.45, 0.37 - index * 0.27]} radius={0.012} height={0.9} /></>}
      </group>)}
      <Block at={[-1.65, 1.77, -1.12]} size={[0.035, 0.04, 3.7]} finish="metal" rotation={[-0.53, 0, 0]} />
      <Block at={[1.65, 3.67, -1.12]} size={[0.035, 0.04, 3.7]} finish="metal" rotation={[0.53, 0, 0]} />
      <Block at={[0, BUILDING.floorHeight - 0.2, -2.65]} size={[4.1, 0.2, 1.2]} finish="stone" />
      <Sign text="STAIRS / LIFT" at={[-1.9, 2.4, 0]} width={1.5} height={0.24} rotation={[0, -Math.PI / 2, 0]} />
    </group>)}
    <Block at={[3.3, height / 2 - 0.2, -1.4]} size={[2, height, 2.8]} finish="concrete" />
    {levels.map(level => <group key={level}><Block at={[2.27, level * BUILDING.floorHeight + 1.1, -1.4]} size={[0.025, 2.2, 1.5]} finish="metal" /><Block at={[2.25, level * BUILDING.floorHeight + 1.1, -1.4]} size={[0.01, 2.12, 0.014]} finish="brass" /></group>)}
    <Block at={[-2.08, height / 2 - 0.2, -3.6]} size={[0.2, height, 0.2]} finish="metal" />
  </group>;
}

function Site({ building, evening }: { building: boolean; evening: boolean }) {
  return <>
    <Block at={[2, -0.53, 0]} size={[48, 0.32, 31]} finish="concrete" />
    <Block at={[2, -0.36, 0]} size={[47.5, 0.055, 30.5]} finish="stone" />
    <Block at={[1, -0.7, 16.5]} size={[50, 0.08, 2.6]} finish="concrete" />
    <Block at={[1, -0.57, 14.8]} size={[39, 0.12, 0.7]} finish="stone" />
    <Block at={[1, -0.44, 14.2]} size={[39, 0.12, 0.7]} finish="stone" />
    <Block at={[3, -0.3, 11.8]} size={[5.5, 0.3, 3.6]} finish="stone" />
    {[-18.6, 22.8].flatMap(x => [-10, 0, 10].map((z, index) => <group key={`${x}:${z}`}>
      <Block at={[x, -0.12, z]} size={[2.4, 0.46, 3.4]} finish="stone" />
      <Block at={[x, 0.12, z]} size={[2.15, 0.035, 3.15]} color="#5c6651" />
      <Plant at={[x, 0.13, z]} tree scale={index === 1 ? 1.1 : 0.85} />
    </group>))}
    {[-10, 8].map(x => <group key={x} position={[x, -0.24, 12.3]}><Block at={[0, 0.42, 0]} size={[3.6, 0.12, 0.65]} finish="oak" radius={0.02} />{[-1.4, 1.4].map(side => <Block key={side} at={[side, 0.21, 0]} size={[0.08, 0.42, 0.5]} finish="metal" />)}</group>)}
    {[-15, -5, 5, 15].map(x => <group key={x}><Tube at={[x, 0.06, 14]} radius={0.045} height={0.8} /><Block at={[x, 0.4, 14]} size={[0.065, 0.04, 0.065]} finish="light" />{evening && <pointLight position={[x, 0.5, 14]} color="#ffdc9f" intensity={3} distance={3} />}</group>)}
    {building && <>
      <Block at={[-7.5, BUILDING.floorHeight * 3 - 0.19, -6.7]} size={[18, 0.38, 7.1]} finish="stone" />
      <Block at={[-7.5, BUILDING.floorHeight * 3 + 0.05, -6.7]} size={[17.8, 0.035, 6.9]} finish="oak" />
      {[-14.8, -0.5].flatMap(x => [-9, -4.5].map(z => <Block key={`${x}:${z}`} at={[x, BUILDING.floorHeight * 3 + 1.1, z]} size={[0.1, 2.2, 0.1]} finish="metal" />))}
      {Array.from({ length: 18 }, (_, index) => <Block key={index} at={[-15 + index * 0.85, BUILDING.floorHeight * 3 + 2.2, -6.7]} size={[0.11, 0.16, 5.2]} finish="oak" />)}
      <Plant at={[-13.5, BUILDING.floorHeight * 3 + 0.06, -5.5]} scale={1.2} />
      <Plant at={[-1.8, BUILDING.floorHeight * 3 + 0.06, -7]} scale={1.2} />
      <Block at={[5, 3.34, 10.15]} size={[12, 0.57, 0.24]} finish="walnut" />
      <Sign text="M U L T I G R A P H I C" at={[5, 3.34, 10.29]} width={9.6} height={0.37} color="#e7e0cd" background="#68583f" />
      <Block at={[-11, 2.9, 12]} size={[8.8, 0.11, 3.8]} finish="metal" />
      <Block at={[-11, 2.85, 12]} size={[8.6, 0.035, 3.5]} finish="oak" />
    </>}
  </>;
}

function CameraRig({ props }: { props: Props }) {
  const { size, invalidate } = useThree();
  const target = useRef(new Vector3(0, 4, 0));
  const desired = useRef(new Vector3(42, 32, 44));
  const animating = useRef(true);
  useEffect(() => {
    const room = props.focusedRoom ? roomArchitecture[props.focusedRoom] : null;
    const building = props.sceneView === 'building';
    const aspect = size.width / Math.max(size.height, 1);
    const portrait = aspect < 1;
    if (room && !building) {
      target.current.set(room.center[0], 0.9, room.center[1]);
      const width = Math.max(...room.size) + (portrait ? 2 : 3);
      const distance = Math.max(width / (0.7 * Math.min(aspect, 1.35)), 13);
      const direction = props.viewStyle === 'plan' ? new Vector3(0, 1, 0.001) : new Vector3(0.35, 0.85, 1).applyAxisAngle(new Vector3(0, 1, 0), room.rotation).normalize();
      desired.current.copy(target.current).addScaledVector(direction, distance);
    } else {
      target.current.set(building ? 2 : 0, building ? 4.5 : 0.4, 0);
      const distance = (building ? 63 : 48) * Math.max(1, 1.35 / aspect);
      const direction = props.viewStyle === 'plan' ? new Vector3(0, 1, 0.001) : new Vector3(0.8, building ? 0.58 : 1.15, 1).normalize();
      desired.current.copy(target.current).addScaledVector(direction, distance);
    }
    animating.current = true; invalidate();
  }, [props.sceneView, props.focusedRoom, props.resetViewKey, props.viewStyle, size.width, size.height, invalidate]);
  useFrame((state, delta) => {
    if (!animating.current) return;
    const controls = state.controls as unknown as { target: Vector3; update: () => void } | undefined;
    if (!controls) return;
    const alpha = props.reducedMotion ? 1 : 1 - Math.exp(-Math.min(delta, 0.1) * 7);
    controls.target.lerp(target.current, alpha);
    state.camera.position.lerp(desired.current, alpha);
    const camera = state.camera as Camera;
    camera.fov = 42; camera.updateProjectionMatrix(); controls.update();
    if (state.camera.position.distanceTo(desired.current) < 0.015 && controls.target.distanceTo(target.current) < 0.015) animating.current = false;
    else invalidate();
  });
  return null;
}

// Keep a regular visible frame for browser compositors while bounding GPU work.
function ArchitecturalRenderPass({ quality }: { quality: Props['quality'] }) {
  const lastFrame = useRef(0);
  useFrame(state => {
    if (document.visibilityState !== 'visible') return;
    const now = performance.now();
    if (now - lastFrame.current < 1000 / (quality === 'low' ? 15 : 24)) return;
    lastFrame.current = now;
    state.gl.setRenderTarget(null);
    state.gl.render(state.scene, state.camera);
  }, 1);
  return null;
}

function World({ props }: { props: Props }) {
  const building = props.sceneView === 'building';
  const evening = props.lighting === 'evening';
  return <ArchitectureMaterials>
    <color attach="background" args={[evening ? '#303c40' : '#e6e4dc']} />
    <fog attach="fog" args={[evening ? '#303c40' : '#e6e4dc', 350, 700]} />
    <hemisphereLight args={[evening ? '#b7c6da' : '#e8edf3', evening ? '#646055' : '#9a9789', evening ? 0.55 : 1.2]} />
    <ambientLight intensity={evening ? 0.3 : 0.5} />
    <directionalLight position={[-25, 35, 18]} intensity={evening ? 1.1 : 3.4} color={evening ? '#e8a36c' : '#fff1d8'} castShadow={props.quality === 'standard'} shadow-mapSize={[2048, 2048]} shadow-camera-left={-36} shadow-camera-right={36} shadow-camera-top={32} shadow-camera-bottom={-32} shadow-camera-far={100} shadow-normalBias={0.035} shadow-bias={-0.0001} />
    <directionalLight position={[20, 10, -20]} intensity={evening ? 0.45 : 1.1} color="#cad8e0" />

    <StudioReflections evening={evening} />
    <PerspectiveCamera makeDefault position={[42, 32, 44]} fov={42} near={0.1} far={700} />
    <OrbitControls makeDefault enablePan enableDamping={!props.reducedMotion} dampingFactor={0.12} minDistance={5} maxDistance={320} minPolarAngle={0.001} maxPolarAngle={Math.PI / 2.12} />
    <CameraRig props={props} />
    <ArchitecturalRenderPass quality={props.quality} />
    {building ? companyFloors.map((floor, index) => <Story key={floor.key} floorKey={floor.key} elevation={index * BUILDING.floorHeight} props={props} overview />) : <Story key={props.sceneView} floorKey={props.sceneView as Exclude<HeadquartersView, 'building'>} elevation={0} props={props} overview={false} />}
    <StairCore building={building} />
    <Site building={building} evening={evening} />
    <mesh position={[0, -0.77, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[400, 400]} /><meshStandardMaterial color={evening ? '#68716b' : '#d8d6c9'} roughness={1} /></mesh>
  </ArchitectureMaterials>;
}

export default function HeadquartersScene(props: Props) {
  return <Canvas frameloop="always" dpr={props.quality === 'low' ? 1 : [1, 1.6]} shadows={props.quality === 'standard'} gl={{ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance', toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.05 }} fallback={<div className="hq-scene-fallback">3D is unavailable. Open the directory to explore your company.</div>} onCreated={({ gl }) => { gl.domElement.tabIndex = 0; gl.domElement.setAttribute('aria-label', 'Interactive architectural headquarters. Select a floor or room, drag to orbit, and scroll to zoom. On the Delivery floor, focus the canvas and walk using WASD or arrow keys.'); }}>
    <World props={props} />
  </Canvas>;
}
