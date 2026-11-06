'use client';

import { Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import type { Group } from 'three';
import { canOccupyWorldPoint, findWalkPath, OWNER_SPAWN, type WorldPoint, type WorldRect } from '@/lib/operations/headquarters-model';
import type { HeadquartersCharacter } from '@/lib/operations/headquarters-types';
import { Block, Ellipsoid, Tube } from './ArchitectureKit';

function safeColor(value: string | undefined, fallback: string) {
  return value && /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
}

export function Person({ character, seated = true, selected = false, showLabel = false, reducedMotion, onSelect }: { character: HeadquartersCharacter; seated?: boolean; selected?: boolean; showLabel?: boolean; reducedMotion: boolean; onSelect?: () => void }) {
  const [hovered, setHovered] = useState(false);
  const arm = useRef<Group>(null);
  const invalidate = useThree(state => state.invalidate);
  const skin = safeColor(character.appearance.skinTone, '#b98566');
  const hair = safeColor(character.appearance.hairColor, '#342b25');
  const clothing = safeColor(character.appearance.clothingColor, '#536359');
  const accent = safeColor(character.appearance.accentColor, '#b7a17c');
  const hip = seated ? 0.6 : 0.88;
  const head = hip + 0.66;
  useFrame(({ clock }) => {
    if (arm.current) arm.current.rotation.x = seated ? -0.68 + (!reducedMotion && character.status === 'WORKING' ? Math.sin(clock.elapsedTime * 3) * 0.035 : 0) : -0.05;
    if (!reducedMotion && character.status === 'WORKING') invalidate();
  });
  return <group onClick={event => { if (onSelect) { event.stopPropagation(); onSelect(); } }} onPointerOver={event => { event.stopPropagation(); setHovered(true); }} onPointerOut={() => setHovered(false)}>
    {selected && <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.38, 0.41, 32]} /><meshBasicMaterial color="#ae905e" /></mesh>}
    <Ellipsoid at={[0, hip, 0]} scale={[0.18, 0.13, 0.12]} color="#464940" />
    {[-1, 1].map(side => seated ? <group key={side}>
      <Tube at={[side * 0.095, hip, 0.18]} radius={0.066} topRadius={0.08} height={0.39} rotation={[Math.PI / 2, 0, 0]} color="#464940" />
      <Tube at={[side * 0.095, 0.33, 0.38]} radius={0.048} topRadius={0.061} height={0.48} color="#464940" />
      <Ellipsoid at={[side * 0.095, 0.065, 0.45]} scale={[0.065, 0.055, 0.145]} color="#39352f" />
    </group> : <group key={side}>
      <Tube at={[side * 0.095, 0.67, 0]} radius={0.066} topRadius={0.08} height={0.4} color="#464940" />
      <Tube at={[side * 0.095, 0.26, 0.015]} radius={0.045} topRadius={0.062} height={0.42} color="#464940" />
      <Ellipsoid at={[side * 0.095, 0.06, 0.065]} scale={[0.067, 0.05, 0.145]} color="#39352f" />
    </group>)}
    <Ellipsoid at={[0, hip + 0.27, 0]} scale={[0.215, 0.285, 0.125]} color={clothing} />
    <Tube at={[0, hip + 0.51, 0]} radius={0.044} height={0.12} color={skin} />
    <Ellipsoid at={[0, head, 0.005]} scale={[0.108, 0.15, 0.112]} color={skin} />
    <mesh position={[0, head + 0.025, -0.01]} scale={[1, 1.12, 1]} castShadow><sphereGeometry args={[0.118, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={hair} roughness={0.94} /></mesh>
    {[-1, 1].map(side => <Ellipsoid key={side} at={[side * 0.108, head - 0.012, 0]} scale={[0.018, 0.033, 0.02]} color={skin} />)}
    <Ellipsoid at={[0, head - 0.015, 0.11]} scale={[0.022, 0.03, 0.026]} color={skin} />
    {[-1, 1].map(side => <Ellipsoid key={side} at={[side * 0.04, head + 0.02, 0.105]} scale={[0.007, 0.005, 0.004]} color="#39312b" />)}
    {(character.appearance.hairStyle?.includes('bob') || character.appearance.hairStyle?.includes('medium') || character.appearance.hairStyle?.includes('braid')) && <Ellipsoid at={[0, head - 0.05, -0.07]} scale={[0.112, 0.16, 0.067]} color={hair} />}
    {[-1, 1].map(side => <group key={side} ref={side === 1 ? arm : undefined} position={[side * 0.225, hip + 0.41, 0]} rotation={[seated ? -0.68 : -0.05, 0, side * 0.05]}>
      <Tube at={[0, -0.13, 0]} radius={0.047} topRadius={0.06} height={0.27} color={clothing} />
      <group position={[0, -0.26, 0]} rotation={[seated ? -0.7 : -0.07, 0, 0]}><Tube at={[0, -0.12, 0]} radius={0.033} topRadius={0.041} height={0.24} color={skin} /><Ellipsoid at={[0, -0.27, 0.005]} scale={[0.033, 0.058, 0.023]} color={skin} /></group>
    </group>)}
    <Block at={[0.105, hip + 0.33, 0.12]} size={[0.038, 0.056, 0.005]} color={accent} />
    {character.appearance.accessory === 'glasses' && [-1, 1].map(side => <mesh key={side} position={[side * 0.045, head + 0.02, 0.11]}><torusGeometry args={[0.029, 0.004, 5, 12]} /><meshStandardMaterial color="#343c36" /></mesh>)}
    {['headphones', 'headset'].includes(character.appearance.accessory ?? '') && <><mesh position={[0, head + 0.015, 0]}><torusGeometry args={[0.127, 0.009, 6, 18, Math.PI]} /><meshStandardMaterial color="#303b35" /></mesh>{[-1, 1].map(side => <Ellipsoid key={side} at={[side * 0.123, head - 0.005, 0]} scale={[0.022, 0.043, 0.035]} color="#303b35" />)}</>}
    {(showLabel || selected || hovered) && onSelect && <Html position={[0, head + 0.4, 0]} center zIndexRange={[24, 0]}><button className={`studio-person-label ${selected ? 'selected' : ''}`} onClick={event => { event.stopPropagation(); onSelect(); }}><i style={{ background: accent }} /><span>{character.displayName.replace(' (Demo)', '')}</span><small>{character.isOwner ? 'You' : character.status.replaceAll('_', ' ').toLowerCase()}</small></button></Html>}
  </group>;
}

export function WalkingOwner({ character, destination, blockers, reducedMotion, selected, showLabel, onSelect }: { character: HeadquartersCharacter; destination: WorldPoint | null; blockers: WorldRect[]; reducedMotion: boolean; selected: boolean; showLabel: boolean; onSelect: () => void }) {
  const group = useRef<Group>(null);
  const position = useRef<WorldPoint>({ ...OWNER_SPAWN });
  const path = useRef<WorldPoint[]>([]);
  const keys = useRef(new Set<string>());
  const { gl, invalidate } = useThree();
  useEffect(() => { if (destination) { path.current = findWalkPath(position.current, destination, blockers); invalidate(); } }, [destination, blockers, invalidate]);
  useEffect(() => {
    const canvas = gl.domElement;
    const down = (event: KeyboardEvent) => {
      if (document.activeElement !== canvas || !['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(event.key.toLowerCase())) return;
      event.preventDefault(); keys.current.add(event.key.toLowerCase()); invalidate();
    };
    const up = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase());
    const clear = () => keys.current.clear();
    canvas.addEventListener('keydown', down); canvas.addEventListener('blur', clear); window.addEventListener('keyup', up); window.addEventListener('blur', clear);
    return () => { canvas.removeEventListener('keydown', down); canvas.removeEventListener('blur', clear); window.removeEventListener('keyup', up); window.removeEventListener('blur', clear); };
  }, [gl, invalidate]);
  useFrame((_, delta) => {
    if (!group.current) return;
    const has = (...values: string[]) => values.some(value => keys.current.has(value));
    const dx = Number(has('d', 'arrowright')) - Number(has('a', 'arrowleft'));
    const dz = Number(has('s', 'arrowdown')) - Number(has('w', 'arrowup'));
    const step = Math.min(delta, 0.05) * 3.2;
    if (dx || dz) {
      path.current = [];
      const amount = step / Math.max(1, Math.hypot(dx, dz));
      const next = { x: position.current.x + dx * amount, z: position.current.z + dz * amount };
      if (canOccupyWorldPoint(next, blockers)) position.current = next;
      else {
        const horizontal = { x: next.x, z: position.current.z }; const vertical = { x: position.current.x, z: next.z };
        if (canOccupyWorldPoint(horizontal, blockers)) position.current = horizontal;
        else if (canOccupyWorldPoint(vertical, blockers)) position.current = vertical;
      }
      group.current.rotation.y = Math.atan2(dx, dz);
    } else if (path.current[0]) {
      const next = path.current[0]; const x = next.x - position.current.x; const z = next.z - position.current.z; const distance = Math.hypot(x, z);
      if (distance < 0.06) path.current.shift();
      else { position.current = { x: position.current.x + x / distance * Math.min(step, distance), z: position.current.z + z / distance * Math.min(step, distance) }; group.current.rotation.y = Math.atan2(x, z); }
    }
    group.current.position.set(position.current.x, 0.09, position.current.z);
    if (dx || dz || path.current.length) invalidate();
  });
  return <group ref={group} position={[OWNER_SPAWN.x, 0.09, OWNER_SPAWN.z]}><Person character={character} seated={false} selected={selected} showLabel={showLabel} reducedMotion={reducedMotion} onSelect={onSelect} /></group>;
}
