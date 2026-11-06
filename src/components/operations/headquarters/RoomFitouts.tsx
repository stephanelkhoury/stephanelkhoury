'use client';

import { roomArchitecture, roomWorkstations } from '@/lib/operations/headquarters-architecture';
import { Block, Ellipsoid, Plant, Sign, Tube, type Point3 } from './ArchitectureKit';

export function OfficeChair({ at, rotation = 0, guest = false }: { at: Point3; rotation?: number; guest?: boolean }) {
  return <group position={at} rotation={[0, rotation, 0]}>
    <Block at={[0, 0.48, 0]} size={[0.49, 0.08, 0.48]} finish={guest ? 'leather' : 'fabric'} radius={0.035} />
    <Block at={[0, 0.8, 0.21]} size={[0.46, 0.57, 0.065]} finish={guest ? 'leather' : 'metal'} radius={0.03} rotation={[-0.08, 0, 0]} />
    {!guest && <Block at={[0, 0.78, 0.17]} size={[0.39, 0.43, 0.018]} finish="fabric" radius={0.025} />}
    {[-1, 1].map(side => <group key={side}><Tube at={[side * 0.27, 0.61, 0.05]} radius={0.014} height={0.26} /><Block at={[side * 0.27, 0.72, 0]} size={[0.055, 0.04, 0.3]} finish="metal" radius={0.015} /></group>)}
    <Tube at={[0, 0.26, 0]} radius={0.032} height={0.4} />
    {Array.from({ length: 5 }, (_, index) => <group key={index} rotation={[0, index * Math.PI * 0.4, 0]}><Block at={[0.14, 0.075, 0]} size={[0.29, 0.03, 0.035]} finish="metal" /><Tube at={[0.27, 0.04, 0]} radius={0.035} height={0.04} rotation={[Math.PI / 2, 0, 0]} /></group>)}
  </group>;
}

function Display({ at, wide = false }: { at: Point3; wide?: boolean }) {
  const width = wide ? 1.25 : 0.75;
  return <group position={at}>
    <Block at={[0, 0, 0]} size={[width, 0.45, 0.037]} finish="metal" radius={0.013} />
    <Block at={[0, 0.005, 0.021]} size={[width - 0.035, 0.405, 0.004]} finish="screen" />
    <Block at={[-width * 0.26, 0.005, 0.025]} size={[width * 0.25, 0.32, 0.002]} color="#314244" />
    {[0, 1, 2, 3, 4].map(index => <Block key={index} at={[width * 0.13, 0.13 - index * 0.053, 0.025]} size={[width * (index % 2 ? 0.34 : 0.44), 0.008, 0.002]} color={index === 0 ? '#b8b49d' : '#6a8583'} />)}
    <Tube at={[0, -0.3, -0.01]} radius={0.02} height={0.23} />
    <Block at={[0, -0.41, 0.025]} size={[0.27, 0.015, 0.19]} finish="metal" radius={0.01} />
  </group>;
}

export function Workstation({ at, technical = false, overview = false }: { at: Point3; technical?: boolean; overview?: boolean }) {
  return <group position={at}>
    <Block at={[0, 0.765, 0]} size={[2.4, 0.045, 0.85]} finish="oak" radius={0.018} />
    {[-1.04, 1.04].map(x => <group key={x}><Block at={[x, 0.38, 0]} size={[0.035, 0.73, 0.64]} finish="metal" /><Block at={[x, 0.035, 0]} size={[0.06, 0.035, 0.72]} finish="metal" /></group>)}
    <Block at={[0, 0.63, -0.25]} size={[2.08, 0.07, 0.06]} finish="metal" />
    <Display at={[technical ? -0.38 : 0, 1.2, -0.16]} wide={!technical} />
    {technical && <Display at={[0.43, 1.2, -0.16]} />}
    <OfficeChair at={[0, 0, 0.95]} />
    <Block at={[0.88, 0.32, -0.02]} size={[0.37, 0.59, 0.57]} finish="white" radius={0.018} />
    {[0.28, 0.48].map(y => <Block key={y} at={[0.88, y, 0.27]} size={[0.15, 0.013, 0.014]} finish="metal" />)}
    {!overview && <><Block at={[-0.08, 0.799, 0.16]} size={[0.53, 0.017, 0.18]} finish="white" radius={0.008} /><Ellipsoid at={[0.4, 0.81, 0.16]} scale={[0.045, 0.02, 0.064]} color="#d5d4cb" /><Block at={[-0.85, 0.801, 0.08]} size={[0.25, 0.02, 0.34]} finish="leather" rotation={[0, 0.12, 0]} /><Tube at={[0.87, 0.85, -0.2]} radius={0.045} height={0.12} finish="stone" /></>}
  </group>;
}

function Sofa({ at, rotation = 0, compact = false }: { at: Point3; rotation?: number; compact?: boolean }) {
  const width = compact ? 1.8 : 2.6;
  return <group position={at} rotation={[0, rotation, 0]}>
    <Block at={[0, 0.29, 0]} size={[width, 0.27, 0.85]} finish="fabric" radius={0.075} />
    <Block at={[0, 0.67, -0.34]} size={[width, 0.57, 0.18]} finish="fabric" radius={0.06} rotation={[-0.08, 0, 0]} />
    {[-1, 1].map(side => <group key={side}><Block at={[side * (width / 2 - 0.09), 0.51, 0]} size={[0.18, 0.47, 0.84]} finish="fabric" radius={0.06} /><Block at={[side * (width / 2 - 0.28), 0.095, 0]} size={[0.035, 0.14, 0.6]} finish="walnut" /></group>)}
    {[0, 1].map(index => <Block key={index} at={[(index - 0.5) * (width - 0.4) / 2, 0.46, 0.02]} size={[(width - 0.43) / 2, 0.13, 0.65]} finish="fabric" radius={0.045} />)}
    <Block at={[-width / 3, 0.66, -0.16]} size={[0.38, 0.38, 0.13]} finish="leather" radius={0.05} rotation={[0, 0, 0.12]} />
  </group>;
}

function Lounge({ at, compact = false }: { at: Point3; compact?: boolean }) {
  return <group position={at}>
    <Block at={[0, 0.014, 0.4]} size={[compact ? 2.4 : 3.6, 0.018, compact ? 1.8 : 2.7]} finish="carpet" />
    <Sofa at={[0, 0, -0.45]} compact={compact} />
    <Tube at={[0.1, 0.32, 0.85]} radius={compact ? 0.37 : 0.57} height={0.035} finish="walnut" />
    <Tube at={[0.1, 0.16, 0.85]} radius={0.12} height={0.3} finish="metal" />
    <Block at={[0.1, 0.35, 0.85]} size={[0.25, 0.035, 0.2]} finish="white" rotation={[0, 0.2, 0]} />
  </group>;
}

function Shelving({ at, width = 3, samples = false }: { at: Point3; width?: number; samples?: boolean }) {
  return <group position={at}>
    <Block at={[0, 1.15, -0.12]} size={[width, 2.3, 0.08]} finish="walnut" />
    {[-1, 1].map(side => <Block key={side} at={[side * width / 2, 1.15, 0]} size={[0.045, 2.3, 0.4]} finish="oak" />)}
    {[0.08, 0.6, 1.12, 1.64, 2.16].map((y, row) => <group key={y}>
      <Block at={[0, y, 0]} size={[width, 0.035, 0.4]} finish="oak" />
      {row < 4 && Array.from({ length: samples ? 5 : 10 }, (_, index) => <Block key={index} at={[-width / 2 + 0.18 + index * (width - 0.35) / (samples ? 5 : 10), y + 0.2, 0.03]} size={[samples ? 0.32 : 0.09 + (index % 2) * 0.025, 0.3 + (index % 3) * 0.02, samples ? 0.24 : 0.22]} color={['#d3c4aa', '#707c70', '#ada08b', '#525d59', '#bab9aa'][(index + row) % 5]} rotation={[0, 0, index % 5 === 0 ? -0.1 : 0]} />)}
    </group>)}
  </group>;
}

function Pinboard({ at, design = false }: { at: Point3; design?: boolean }) {
  return <group position={at}>
    <Block at={[0, 0, 0]} size={[3.1, 1.3, 0.045]} finish="oak" />
    <Block at={[0, 0, 0.03]} size={[3, 1.2, 0.02]} finish={design ? 'carpet' : 'white'} />
    {Array.from({ length: 6 }, (_, index) => <group key={index} position={[-1.05 + index % 3 * 1.03, 0.27 - Math.floor(index / 3) * 0.56, 0.05]}><Block at={[0, 0, 0]} size={[0.62, 0.42, 0.005]} color={design ? ['#8d947c', '#d1b99c', '#888f8b'][index % 3] : '#e4e4da'} />{!design && [0, 1, 2].map(line => <Block key={line} at={[-0.04, 0.1 - line * 0.09, 0.006]} size={[0.4 - line * 0.05, 0.013, 0.002]} color="#a3aba0" />)}</group>)}
  </group>;
}

function Meeting({ depth }: { depth: number }) {
  return <>
    <Block at={[0, 0.765, 0]} size={[4.2, 0.065, 1.4]} finish="oak" radius={0.16} />
    {[-1.35, 1.35].map(x => <Block key={x} at={[x, 0.37, 0]} size={[0.16, 0.72, 0.75]} finish="metal" />)}
    {[-1, 1].flatMap(side => [-1.5, -0.5, 0.5, 1.5].map(x => <OfficeChair key={`${side}-${x}`} at={[x, 0, side * 1.18]} rotation={side < 0 ? Math.PI : 0} guest />))}
    <Block at={[0, 0.81, 0]} size={[0.42, 0.025, 0.24]} finish="metal" radius={0.03} />
    <Block at={[0, 1.8, -depth / 2 + 0.13]} size={[2.5, 1.42, 0.045]} finish="metal" />
    <Block at={[0, 1.8, -depth / 2 + 0.16]} size={[2.4, 1.32, 0.015]} finish="screen" />
    <Sign text="REVIEW · DISCUSS · DECIDE" at={[0, 1.8, -depth / 2 + 0.175]} width={2.05} height={0.32} color="#d7d9cd" background="#203336" />
    <Tube at={[-0.85, 0.88, 0]} radius={0.07} height={0.14} finish="stone" />
    <Block at={[1.1, 0.82, 0]} size={[0.3, 0.02, 0.4]} finish="leather" />
  </>;
}

function Kitchen({ width, depth }: { width: number; depth: number }) {
  const length = Math.min(width - 0.6, 4.2);
  const z = -depth / 2 + 0.45;
  return <>
    <Block at={[0, 0.45, z]} size={[length, 0.87, 0.76]} finish="walnut" />
    <Block at={[0, 0.91, z]} size={[length + 0.06, 0.045, 0.83]} finish="stone" />
    {Array.from({ length: 5 }, (_, index) => <Block key={index} at={[-length / 2 + index * length / 5, 0.45, z + 0.39]} size={[0.012, 0.75, 0.008]} finish="metal" />)}
    <Block at={[-length / 3, 1.09, z]} size={[0.35, 0.34, 0.32]} finish="metal" radius={0.035} />
    <Block at={[length / 4, 0.94, z]} size={[0.54, 0.015, 0.4]} finish="metal" radius={0.05} />
    <Tube at={[length / 4, 1.1, z - 0.2]} radius={0.015} height={0.34} finish="brass" />
    <Tube at={[length / 4, 1.25, z - 0.12]} radius={0.015} height={0.18} finish="brass" rotation={[Math.PI / 2, 0, 0]} />
    <Block at={[0, 1.82, z - 0.17]} size={[length, 0.045, 0.4]} finish="oak" />
    <Sign text="TAKE A MOMENT" at={[0, 2.2, -depth / 2 + 0.1]} width={Math.min(length, 2.2)} height={0.3} />
    <Tube at={[0, 0.74, 0.75]} radius={Math.min(width / 3, 0.7)} height={0.055} finish="oak" />
    <Tube at={[0, 0.37, 0.75]} radius={0.09} height={0.72} />
    <OfficeChair at={[-0.75, 0, 1.15]} rotation={-0.4} guest />
    {width > 4 && <OfficeChair at={[0.75, 0, 1.15]} rotation={0.4} guest />}
  </>;
}

function Washroom({ width, depth }: { width: number; depth: number }) {
  return <>
    {[-0.7, 0.7].map(x => <group key={x} position={[x, 0, -depth / 2 + 1.1]}>
      <Block at={[0, 0.44, -0.3]} size={[0.38, 0.55, 0.15]} finish="white" radius={0.04} />
      <Ellipsoid at={[0, 0.35, 0.04]} scale={[0.23, 0.17, 0.33]} color="#e5e4dc" />
      <Block at={[0, 1.04, 0.55]} size={[1.3, 2.05, 0.055]} finish="walnut" />
      <Tube at={[0.44, 1.02, 0.59]} radius={0.018} height={0.16} finish="brass" />
    </group>)}
    <Block at={[0, 0.81, 0.8]} size={[Math.min(width - 0.45, 2.5), 0.12, 0.6]} finish="stone" />
    <Tube at={[0, 0.9, 0.8]} radius={0.22} height={0.09} finish="white" />
    <Tube at={[0, 1.02, 0.57]} radius={0.012} height={0.25} finish="brass" />
  </>;
}

function AudioRoom({ width, depth, overview }: { width: number; depth: number; overview: boolean }) {
  return <>
    <Workstation at={[0, 0, -1.55]} technical overview={overview} />
    <Block at={[0, 0.81, -1.4]} size={[1.65, 0.1, 0.5]} finish="metal" rotation={[0.12, 0, 0]} />
    {Array.from({ length: 14 }, (_, index) => <Block key={index} at={[-0.73 + index * 0.11, 0.885, -1.38]} size={[0.015, 0.012, 0.23]} finish={index % 4 === 0 ? 'brass' : 'white'} />)}
    {[-1.65, 1.65].map(x => <group key={x}><Block at={[x, 1.17, -1.8]} size={[0.38, 0.58, 0.33]} finish="metal" /><Tube at={[x, 1.17, -1.62]} radius={0.115} height={0.015} finish="carpet" rotation={[Math.PI / 2, 0, 0]} /><Tube at={[x, 0.49, -1.8]} radius={0.025} height={0.98} /></group>)}
    <Block at={[0, 0.77, 1.4]} size={[2.5, 0.14, 0.6]} finish="metal" />
    {Array.from({ length: 28 }, (_, index) => <Block key={index} at={[-1.17 + index * 0.085, 0.86, 1.4]} size={[0.075, 0.016, 0.45]} finish={index % 3 === 1 ? 'metal' : 'white'} />)}
    {Array.from({ length: 22 }, (_, index) => <Block key={index} at={[-width / 2 + 0.4 + index * (width - 0.8) / 22, 1.75, -depth / 2 + 0.13]} size={[0.08, 2.25, 0.12 + index % 4 * 0.04]} finish="oak" />)}
  </>;
}

function VideoRoom({ width, depth, overview }: { width: number; depth: number; overview: boolean }) {
  return <>
    <Block at={[-1.6, 1.47, -depth / 2 + 0.24]} size={[5.8, 2.85, 0.18]} finish="white" radius={0.08} />
    <Block at={[-1.6, 0.045, -1.5]} size={[5.8, 0.07, 3.7]} finish="white" />
    <Block at={[-1.6, 0.2, -depth / 2 + 0.45]} size={[5.8, 0.4, 0.6]} finish="white" radius={0.18} />
    {[-3.9, 0.7].map(x => <group key={x}><Tube at={[x, 1.22, -0.2]} radius={0.017} height={2.4} /><Block at={[x, 2.1, -0.2]} size={[0.67, 0.95, 0.09]} finish="metal" radius={0.03} rotation={[0, x > 0 ? -0.5 : 0.5, 0]} /><Block at={[x, 2.1, -0.13]} size={[0.61, 0.88, 0.01]} finish="light" rotation={[0, x > 0 ? -0.5 : 0.5, 0]} />{[0, 1, 2].map(index => <Tube key={index} at={[x + Math.sin(index * 2.094) * 0.23, 0.25, -0.2 + Math.cos(index * 2.094) * 0.23]} radius={0.012} height={0.6} rotation={[0.5, index * 2.094, 0]} />)}</group>)}
    <group position={[-1.6, 0, 2]}><Tube at={[0, 0.73, 0]} radius={0.025} height={1.45} /><Block at={[0, 1.47, 0]} size={[0.4, 0.29, 0.3]} finish="metal" radius={0.025} /><Tube at={[0, 1.47, -0.23]} radius={0.1} height={0.25} rotation={[Math.PI / 2, 0, 0]} />{[-1, 1].map(side => <Tube key={side} at={[side * 0.2, 0.35, 0]} radius={0.018} height={0.85} rotation={[0, 0, side * 0.4]} />)}</group>
    <Workstation at={[width / 2 - 1.6, 0, 1.2]} overview={overview} technical />
  </>;
}

function ReceptionRoom({ roomKey, width, depth }: { roomKey: string; width: number; depth: number }) {
  const station = roomWorkstations(roomKey)[0];
  const visitorLobby = roomKey === 'reception-lobby';
  return <>
    <group position={[station.x, 0, station.z]} rotation={[0, visitorLobby ? Math.PI : 0, 0]}>
      <Block at={[0, 0.55, 0]} size={[Math.min(width - 0.8, 3.2), 1.08, 0.85]} finish="oak" radius={0.1} />
      <Block at={[0, 1.11, 0]} size={[Math.min(width - 0.7, 3.3), 0.035, 0.88]} finish="stone" />
      <Sign text="multigraphic" at={[0, 0.72, 0.44]} width={Math.min(width - 1, 2.4)} height={0.34} />
      <OfficeChair at={[0, 0, -0.8]} rotation={Math.PI} />
    </group>
    {depth > 6 ? <Lounge at={[visitorLobby ? 1.8 : 0, 0, 1.1]} /> : <Sofa at={[0, 0, 1.1]} compact />}
    <Plant at={[width / 2 - 0.65, 0, -depth / 2 + 0.7]} scale={0.8} />
  </>;
}

export function RoomFitout({ roomKey, overview }: { roomKey: string; overview: boolean }) {
  const plan = roomArchitecture[roomKey];
  const [width, depth] = plan.size;
  const stations = roomWorkstations(roomKey);
  switch (plan.fitout) {
    case 'meeting': return <Meeting depth={depth} />;
    case 'kitchen': return <Kitchen width={width} depth={depth} />;
    case 'washroom': return <Washroom width={width} depth={depth} />;
    case 'video': return <VideoRoom width={width} depth={depth} overview={overview} />;
    case 'audio': return <AudioRoom width={width} depth={depth} overview={overview} />;
    case 'library': return <><Shelving at={[-1, 0, -depth / 2 + 0.4]} width={width - 2.2} /><Workstation at={[stations[0].x, 0, stations[0].z]} overview={overview} /><Block at={[-2.2, 0.76, 0.8]} size={[3, 0.06, 1.15]} finish="oak" radius={0.08} />{[-1, 1].map(side => <OfficeChair key={side} at={[-2.2 + side * 0.9, 0, 1.8]} guest />)}</>;
    case 'reception': return <ReceptionRoom roomKey={roomKey} width={width} depth={depth} />;
    case 'executive': return <><Workstation at={[0, 0, -1.55]} overview={overview} /><Shelving at={[0, 0, -depth / 2 + 0.35]} width={width - 1.5} /><Lounge at={[0, 0, 1.45]} /><Plant at={[width / 2 - 0.7, 0, -depth / 2 + 0.7]} /></>;
    default: return <>
      {stations.map((station, index) => <Workstation key={index} at={[station.x, 0, station.z]} technical={plan.fitout === 'engineering' || plan.fitout === 'qa'} overview={overview} />)}
      {plan.fitout === 'design' ? <><Shelving at={[0, 0, -depth / 2 + 0.35]} samples /><Block at={[0, 0.88, 1.6]} size={[3.4, 0.065, 1.2]} finish="oak" />{[-1.2, 1.2].map(x => <Block key={x} at={[x, 0.44, 1.6]} size={[0.065, 0.85, 0.9]} finish="metal" />)}{[0, 1, 2, 3].map(index => <Block key={index} at={[-1.1 + index * 0.65, 0.93, 1.6]} size={[0.42, 0.02, 0.5]} color={['#c8b696', '#666f63', '#bebdb1', '#9e765e'][index]} />)}</> : plan.fitout === 'content' ? <><Shelving at={[0, 0, -depth / 2 + 0.35]} /><Lounge at={[0, 0, 1.5]} /></> : <><Pinboard at={[0, 1.9, -depth / 2 + 0.12]} /><Block at={[0, 0.75, 1.6]} size={[2.6, 0.045, 1.05]} finish="oak" radius={0.05} /><OfficeChair at={[-0.7, 0, 2.5]} guest /><OfficeChair at={[0.7, 0, 2.5]} guest /></>}
      {plan.fitout === 'engineering' && <group position={[width / 2 - 0.55, 0, 0]}><Block at={[0, 0.88, 0]} size={[0.55, 1.75, 0.7]} finish="metal" />{[0, 1, 2, 3, 4].map(index => <Block key={index} at={[0, 0.35 + index * 0.25, 0.36]} size={[0.43, 0.09, 0.01]} finish="carpet" />)}</group>}
      <Plant at={[-width / 2 + 0.62, 0, -depth / 2 + 0.7]} scale={0.8} />
    </>;
  }
}
