'use client';

import { RoundedBox } from '@react-three/drei';
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { CanvasTexture, Color, DataTexture, DoubleSide, EquirectangularReflectionMapping, LinearFilter, LinearMipmapLinearFilter, MeshPhysicalMaterial, MeshStandardMaterial, Object3D, RepeatWrapping, RGBAFormat, SRGBColorSpace, type InstancedMesh, type Material } from 'three';

export type Point3 = [number, number, number];
type Finish = 'stone' | 'concrete' | 'oak' | 'walnut' | 'carpet' | 'plaster' | 'metal' | 'brass' | 'glass' | 'fabric' | 'leather' | 'screen' | 'white' | 'light';
type Materials = Record<Finish, Material>;
const MaterialContext = createContext<Materials | null>(null);

export function StudioReflections({ evening }: { evening: boolean }) {
  const map = useMemo(() => {
    const width = 256; const height = 128;
    const pixels = new Uint8Array(width * height * 4);
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const window = y > 30 && y < 86 && ((x > 24 && x < 62) || (x > 172 && x < 195));
      const brightness = window ? (evening ? 165 : 244) : evening ? 38 + y * 0.2 : 174 + (1 - y / height) * 42;
      const offset = (y * width + x) * 4;
      pixels[offset] = brightness; pixels[offset + 1] = brightness * (evening ? 0.9 : 0.98); pixels[offset + 2] = brightness * (evening ? 0.76 : 0.95); pixels[offset + 3] = 255;
    }
    const texture = new DataTexture(pixels, width, height, RGBAFormat);
    texture.mapping = EquirectangularReflectionMapping; texture.colorSpace = SRGBColorSpace;
    texture.magFilter = LinearFilter; texture.minFilter = LinearFilter; texture.needsUpdate = true;
    return texture;
  }, [evening]);
  useEffect(() => () => map.dispose(), [map]);
  return <primitive object={map} attach="environment" />;
}

function surfaceTexture(kind: 'stone' | 'wood' | 'fabric') {
  const resolution = 128;
  const data = new Uint8Array(resolution * resolution * 4);
  let seed = 8137;
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const noise = seed / 4294967296;
      const grain = Math.sin(y * 0.42 + Math.sin(x * 0.06) * 1.7) * 0.5 + Math.sin(y * 1.8 + x * 0.015) * 0.2;
      const value = kind === 'wood' ? 199 + grain * 25 + noise * 12 : kind === 'fabric' ? 180 + noise * 42 + ((x + y) % 2) * 14 : 220 + noise * 22 + Math.sin(x * 0.04 + y * 0.07) * 5;
      const index = (y * resolution + x) * 4;
      data[index] = value;
      data[index + 1] = kind === 'wood' ? value * 0.87 : value;
      data[index + 2] = kind === 'wood' ? value * 0.69 : value * 0.97;
      data[index + 3] = 255;
    }
  }
  const texture = new DataTexture(data, resolution, resolution, RGBAFormat);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(kind === 'wood' ? 2 : 5, kind === 'wood' ? 5 : 5);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

export function ArchitectureMaterials({ children }: { children: ReactNode }) {
  const surfaces = useMemo(() => {
    const stone = surfaceTexture('stone');
    const wood = surfaceTexture('wood');
    const fabric = surfaceTexture('fabric');
    const standard = (color: string, roughness = 0.7, map?: DataTexture, metalness = 0) => new MeshStandardMaterial({ color, roughness, metalness, ...(map ? { map, bumpMap: map, bumpScale: map === fabric ? 0.0012 : 0.0025 } : {}) });
    const materials: Materials = {
      stone: standard('#e5ddd0', 0.78, stone),
      concrete: standard('#a9a89f', 0.92, stone),
      oak: standard('#b9a27b', 0.52, wood),
      walnut: standard('#786347', 0.5, wood),
      carpet: standard('#9b9b8d', 0.98, fabric),
      plaster: standard('#e7e4da', 0.9, stone),
      metal: standard('#303936', 0.35, undefined, 0.75),
      brass: standard('#a18b5c', 0.34, undefined, 0.78),
      glass: new MeshPhysicalMaterial({ color: '#b4c5bf', transparent: true, opacity: 0.13, roughness: 0.08, metalness: 0.12, side: DoubleSide, depthWrite: false, envMapIntensity: 1.3 }),
      fabric: standard('#a2a794', 0.97, fabric),
      leather: standard('#80644a', 0.68, fabric),
      screen: new MeshStandardMaterial({ color: '#182b30', roughness: 0.28, emissive: '#254147', emissiveIntensity: 0.28 }),
      white: standard('#edece5', 0.5),
      light: new MeshStandardMaterial({ color: '#fff5d9', emissive: '#ffde9c', emissiveIntensity: 2, toneMapped: false }),
    };
    return { materials, textures: [stone, wood, fabric] };
  }, []);
  useEffect(() => () => { Object.values(surfaces.materials).forEach(material => material.dispose()); surfaces.textures.forEach(texture => texture.dispose()); }, [surfaces]);
  return <MaterialContext.Provider value={surfaces.materials}>{children}</MaterialContext.Provider>;
}

function useFinish(finish: Finish) {
  const materials = useContext(MaterialContext);
  if (!materials) throw new Error('Architectural materials must be provided.');
  return materials[finish];
}

export function Block({ at, size, finish = 'plaster', radius = 0, rotation, color, onClick }: { at: Point3; size: Point3; finish?: Finish; radius?: number; rotation?: Point3; color?: string; onClick?: () => void }) {
  const material = useFinish(finish);
  const contents = color ? <meshStandardMaterial color={color} roughness={0.82} /> : null;
  const click = onClick ? (event: { stopPropagation: () => void }) => { event.stopPropagation(); onClick(); } : undefined;
  return radius > 0 ? <RoundedBox position={at} args={size} radius={radius} smoothness={2} rotation={rotation} material={color ? undefined : material} castShadow receiveShadow onClick={click}>{contents}</RoundedBox> : <mesh position={at} rotation={rotation} material={color ? undefined : material} castShadow={finish !== 'glass'} receiveShadow onClick={click}><boxGeometry args={size} />{contents}</mesh>;
}

export function Tube({ at, radius, height, finish = 'metal', rotation, topRadius, color }: { at: Point3; radius: number; height: number; finish?: Finish; rotation?: Point3; topRadius?: number; color?: string }) {
  const material = useFinish(finish);
  return <mesh position={at} rotation={rotation} material={color ? undefined : material} castShadow receiveShadow><cylinderGeometry args={[topRadius ?? radius, radius, height, 16]} />{color && <meshStandardMaterial color={color} roughness={0.86} />}</mesh>;
}

export function Ellipsoid({ at, scale, color, rotation }: { at: Point3; scale: Point3; color: string; rotation?: Point3 }) {
  return <mesh position={at} scale={scale} rotation={rotation} castShadow><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color={color} roughness={0.82} /></mesh>;
}

export function Sign({ text, at, width = 2.2, height = 0.42, color = '#38423c', background = '#e4ded0', rotation }: { text: string; at: Point3; width?: number; height?: number; color?: string; background?: string; rotation?: Point3 }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 256;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = background; context.fillRect(0, 0, 1024, 256);
      context.fillStyle = color; context.font = '500 80px Arial'; context.textAlign = 'center'; context.textBaseline = 'middle';
      context.fillText(text, 512, 134, 950);
    }
    const map = new CanvasTexture(canvas); map.colorSpace = SRGBColorSpace; map.anisotropy = 8;
    return map;
  }, [text, color, background]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <mesh position={at} rotation={rotation}><planeGeometry args={[width, height]} /><meshStandardMaterial map={texture} roughness={0.8} side={DoubleSide} /></mesh>;
}

export function Plant({ at, scale = 1, tree = false }: { at: Point3; scale?: number; tree?: boolean }) {
  const leaves = useRef<InstancedMesh>(null);
  const count = tree ? 150 : 42;
  useLayoutEffect(() => {
    if (!leaves.current) return;
    const dummy = new Object3D();
    const leafColor = new Color();
    for (let index = 0; index < count; index++) {
      const angle = index * 2.39996;
      const radius = Math.sqrt((index % 31) / 31) * (tree ? 1.15 : 0.46);
      dummy.position.set(Math.cos(angle) * radius, (tree ? 2.4 : 0.85) + Math.sin(index * 7.1) * (tree ? 0.95 : 0.4), Math.sin(angle) * radius);
      dummy.rotation.set(index * 0.7, angle, Math.sin(index) * 0.7);
      dummy.scale.set(tree ? 0.23 : 0.28, 0.012, tree ? 0.065 : 0.095);
      dummy.updateMatrix();
      leaves.current.setMatrixAt(index, dummy.matrix);
      leaves.current.setColorAt(index, leafColor.set(index % 3 === 0 ? '#64765a' : index % 3 === 1 ? '#859373' : '#405d45'));
    }
    leaves.current.instanceMatrix.needsUpdate = true;
  }, [count, tree]);
  return <group position={at} scale={scale}>
    <Tube at={[0, 0.24, 0]} radius={tree ? 0.6 : 0.24} topRadius={tree ? 0.57 : 0.29} height={0.48} finish="stone" />
    <Tube at={[0, tree ? 1.3 : 0.64, 0]} radius={tree ? 0.07 : 0.025} topRadius={tree ? 0.035 : 0.015} height={tree ? 2.2 : 0.8} finish="walnut" />
    {[-1, 1].map(side => <Tube key={side} at={[side * (tree ? 0.3 : 0.13), tree ? 1.9 : 0.9, 0]} radius={tree ? 0.025 : 0.012} height={tree ? 1.3 : 0.55} finish="walnut" rotation={[0, 0, side * 0.6]} />)}
    <instancedMesh ref={leaves} args={[undefined, undefined, count]} castShadow><sphereGeometry args={[1, 6, 4]} /><meshStandardMaterial color="#ffffff" roughness={0.95} side={DoubleSide} /></instancedMesh>
  </group>;
}

export function Pendant({ at, length = 2.6, evening = false }: { at: Point3; length?: number; evening?: boolean }) {
  return <group position={at}>
    {[-length / 3, length / 3].map(x => <Tube key={x} at={[x, 0.32, 0]} radius={0.009} height={0.64} />)}
    <Block at={[0, 0, 0]} size={[length, 0.07, 0.12]} finish="metal" />
    <Block at={[0, -0.04, 0]} size={[length - 0.08, 0.012, 0.085]} finish="light" />
    {evening && <pointLight position={[0, -0.15, 0]} color="#ffe0ac" intensity={7} distance={6} decay={2} />}
  </group>;
}
