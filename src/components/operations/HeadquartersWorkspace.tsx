'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Component, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { Activity, ArrowRight, BookOpen, Building2, CheckCircle2, CircleAlert, FilePlus2, FileText, FlaskConical, List, LoaderCircle, MessageSquareText, Monitor, RefreshCw, RotateCcw, UserRound, X } from 'lucide-react';
import { presenceLabel, type WorldPoint } from '@/lib/operations/headquarters-model';
import { roomArrivalPoint } from '@/lib/operations/company-navigation';
import { companyFloors, departmentForRoom, floorForRoom, type HeadquartersView } from '@/lib/operations/company-catalog';
import { ArrowDownLeft, Building, ChevronRight, Layers3, Map, Moon, MousePointer2, Plus, Sun, Tags, UsersRound, ZoomIn } from 'lucide-react';
import { roomArchitecture } from '@/lib/operations/headquarters-architecture';
import type { HeadquartersCharacter } from '@/lib/operations/headquarters-types';
import { headquartersDemoProfiles } from '@/lib/operations/headquarters-demo-data';

const HeadquartersScene = dynamic(() => import('./HeadquartersScene'), {
  ssr: false,
  loading: () => <div className="hq-loading-scene" role="status">Preparing your headquarters…</div>,
});

const subscribeMotion = (callback: () => void) => {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
};
const getMotionSnapshot = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const getServerMotionSnapshot = () => false;
const subscribeViewport = (callback: () => void) => {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
};
const getCompactViewport = () => window.innerWidth < 900;
const getServerCompactViewport = () => false;

type HeadquartersData = { profiles: HeadquartersCharacter[]; execution: { connected: boolean; reason: string }; meetings?: Array<{ id: string; roomKey: string; topic: string; status: string }> };

class SceneErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function labelStatus(status: string) {
  return presenceLabel(status);
}

function statusClass(status: string) {
  return `hq-status-${status.toLowerCase()}`;
}

function CharacterButton({ character, selected, onClick }: { character: HeadquartersCharacter; selected: boolean; onClick: () => void }) {
  const accent = /^#[0-9a-f]{6}$/i.test(character.appearance.accentColor ?? '') ? character.appearance.accentColor : '#8C9C97';
  return <button type="button" className={`hq-character-row ${selected ? 'is-selected' : ''}`} onClick={onClick}>
    <span className="hq-character-avatar" style={{ backgroundColor: accent }} aria-hidden="true"><UserRound size={17} /></span>
    <span className="hq-character-row-copy">
      <span className="hq-character-row-name">{character.displayName}{character.isOwner ? ' · You' : ''}</span>
      <span className="hq-character-row-role">{character.jobTitle}</span>
    </span>
    <span className={`hq-status-pill ${statusClass(character.status)}`}>{character.isOwner ? 'Owner' : labelStatus(character.status)}</span>
  </button>;
}

function InteractionPanel({
  character,
  demoMode,
  onClose,
  onRefresh,
}: {
  character: HeadquartersCharacter;
  demoMode: boolean;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [statusReply, setStatusReply] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [canceling, setCanceling] = useState(false);
  const [waking, setWaking] = useState(false);

  async function wake() {
    if (!character.agent) return;
    setWaking(true);
    setActionMessage('');
    try {
      const response = await fetch('/api/admin/operations/models/wake', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ agentId: character.agent.id }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'The model could not be woken.');
      setActionMessage(`${character.displayName} is awake: ${result.model} is loaded for 30 minutes.`);
      onRefresh();
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'The model could not be woken.');
    } finally {
      setWaking(false);
    }
  }

  async function cancelRun() {
    const runId = character.currentTask?.workflowRunId;
    if (!runId) return;
    setCanceling(true);
    setActionMessage('');
    try {
      const response = await fetch(`/api/admin/operations/runs/${runId}/cancel`, { method: 'POST' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'The run could not be canceled.');
      setActionMessage('Cancellation requested. The saved run state will update when the worker observes it.');
      onRefresh();
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'The cancellation request failed.');
    } finally {
      setCanceling(false);
    }
  }

  const task = character.currentTask;
  const hasUsage = character.usage.records > 0;
  const idleMessage = character.status === 'IDLE' ? 'Available. Give this employee a task or call a meeting.'
    : character.status === 'SLEEPING' ? 'Sleeping: the local model is not loaded in memory. It wakes on the next task (first reply is slower), or wake it now.'
      : character.status === 'IN_MEETING' ? `In a meeting: ${character.meeting?.topic ?? ''}`
        : character.status === 'DISABLED' ? 'Not available: the agent is not activated or has no approved version.'
          : character.agent ? 'Not available: no worker or model provider is configured.' : 'Staff role with no agent.';

  return <aside className="hq-interaction-panel" aria-labelledby="hq-panel-title">
    <header className="hq-panel-header">
      <div>
        <p className="hq-eyebrow">Employee profile</p>
        <h2 id="hq-panel-title">{character.displayName}</h2>
        <p>{character.jobTitle} · {character.department.replaceAll('_', ' ')}</p>
      </div>
      <button className="hq-icon-button" type="button" onClick={onClose} aria-label="Close employee panel" title="Close (Escape)"><X size={18} /></button>
    </header>

    <div className="hq-panel-scroll">
      <section className="hq-panel-section hq-current-state">
        <div className="hq-section-heading"><h3>Current state</h3><span className={`hq-status-pill ${statusClass(character.status)}`}>{character.isOwner ? 'Owner' : labelStatus(character.status)}</span></div>
        <p className="hq-current-task">{task?.title ?? 'No current assignment recorded.'}</p>
        {task?.project && <p className="hq-muted-line">{task.project.name} · Saved task status: {labelStatus(task.status)}</p>}
        {task?.blocker && <p className="hq-blocker"><CircleAlert size={15} />{task.blocker}</p>}
        {!character.isOwner && !task && <p className="hq-muted-line">{demoMode ? 'Isolated demo profile. No task or execution record exists.' : `No active task. ${idleMessage}`}</p>}
        {task && character.status === 'IN_MEETING' && <p className="hq-muted-line">{idleMessage}</p>}
        {!demoMode && character.status === 'SLEEPING' && <button type="button" className="hq-text-action" onClick={() => void wake()} disabled={waking}>{waking ? <LoaderCircle size={15} className="hq-spinning" /> : <Activity size={15} />}{waking ? 'Waking up…' : 'Wake up'}</button>}
      </section>

      {!character.isOwner && character.agent && <section className="hq-panel-section">
        <div className="hq-section-heading"><h3>Skills</h3><Link href="/admin/multigraphic-ai/analytics">Analytics</Link></div>
        {character.skills?.length ? <ul className="hq-skill-list">{character.skills.map(skill => <li key={skill.name}>
          <span className="hq-record-title">{skill.name}</span>
          <span className="hq-record-meta">Level {skill.level} · {skill.levelName} · {skill.xp} XP{skill.nextLevelXp ? ` / ${skill.nextLevelXp}` : ' · max'}</span>
          <span className="hq-skill-bar" aria-hidden="true"><i style={{ width: `${skill.nextLevelXp ? Math.min(100, Math.round(skill.xp / skill.nextLevelXp * 100)) : 100}%` }} /></span>
        </li>)}</ul> : <p className="hq-muted-line">Skills are created from the approved contract after the first completed task.</p>}
      </section>}

      <section className="hq-panel-section">
        <div className="hq-section-heading"><h3>Capabilities</h3>{character.agent?.version !== null && character.agent?.version !== undefined && <span>v{character.agent.version}</span>}</div>
        {character.communicationStyle && <p className="hq-communication">{character.communicationStyle}</p>}
        {character.agent?.capabilities.length ? <ul className="hq-tag-list">{character.agent.capabilities.slice(0, 7).map((capability) => <li key={capability}>{capability.replaceAll('-', ' ')}</li>)}</ul> : <p className="hq-muted-line">{character.isOwner ? 'Owner identity. No agent tools are assigned.' : 'Staff role only. No AI agent contract is linked.'}</p>}
        {character.agent && <p className="hq-muted-line">Allowed tools: {character.agent.allowedTools.length ? character.agent.allowedTools.join(', ') : 'None configured'}</p>}
      </section>

      <section className="hq-panel-section">
        <div className="hq-section-heading"><h3>Task history</h3><Activity size={15} /></div>
        {character.taskHistory.length ? <ul className="hq-record-list">{character.taskHistory.slice(0, 5).map((item) => <li key={item.id}>
          <span className="hq-record-title">{item.title}</span><span className="hq-record-meta">{item.project.name} · {labelStatus(item.status)}</span>
        </li>)}</ul> : <p className="hq-muted-line">No tasks have been recorded for this employee.</p>}
      </section>

      <section className="hq-panel-section">
        <div className="hq-section-heading"><h3>Tool activity</h3><MessageSquareText size={15} /></div>
        {character.toolActivity.length ? <ul className="hq-record-list">{character.toolActivity.slice(0, 5).map((tool) => <li key={tool.id}>
          <span className="hq-record-title">{tool.name}</span><span className="hq-record-meta">{labelStatus(tool.status)} · {new Date(tool.startedAt).toLocaleString()}</span>
        </li>)}</ul> : <p className="hq-muted-line">No tool calls are recorded.</p>}
      </section>

      <section className="hq-panel-section">
        <div className="hq-section-heading"><h3>Deliverables</h3><FileText size={15} /></div>
        {character.deliverables.length ? <ul className="hq-record-list">{character.deliverables.slice(0, 4).map((item) => <li key={item.id}>
          <span className="hq-record-title">{item.title} · v{item.version}</span><span className="hq-record-meta">{item.project} · {labelStatus(item.reviewStatus ?? item.status)}</span>
        </li>)}</ul> : <p className="hq-muted-line">No deliverables are linked to this employee.</p>}
      </section>

      <section className="hq-panel-section hq-usage-section">
        <div className="hq-section-heading"><h3>Recorded usage</h3><Monitor size={15} /></div>
        {hasUsage ? <p>{character.usage.inputTokens.toLocaleString()} input · {character.usage.outputTokens.toLocaleString()} output tokens</p> : <p className="hq-muted-line">No usage records.</p>}
        {hasUsage && <p className="hq-muted-line">Estimated USD {character.usage.estimatedCostUsd} · reported USD {character.usage.reportedCostUsd}</p>}
      </section>

      <section className="hq-panel-section">
        <h3 className="hq-section-title">Messages</h3>
        <p className="hq-muted-line">{demoMode ? 'Demo mode has no agent messages or model calls.' : 'No persisted agent messages. Status answers below use saved task data only.'}</p>
        {!demoMode && <button type="button" className="hq-text-action" onClick={() => setStatusReply(task ? `${character.displayName}: ${labelStatus(task.status)} — ${task.title}.` : `${character.displayName}: no assignment is recorded. ${idleMessage}`)}>
          <MessageSquareText size={15} /> Summarize saved status
        </button>}
        {statusReply && <p className="hq-status-reply" aria-live="polite">{statusReply}</p>}
      </section>

      {demoMode ? <p className="hq-demo-panel-note">Actions are disabled in isolated demo mode. No company records are read or changed.</p> : !character.agent ? <p className="hq-demo-panel-note">This is a staff profile, not an AI agent. No task assignment or contact integration is connected.</p> : <section className="hq-panel-actions" aria-label="Employee actions">
        <Link href={`/admin/multigraphic-ai/agents/${character.agent.id}`}><UserRound size={16} /> Agent contract & checks</Link>
        <Link href="/admin/multigraphic-ai/projects/new"><FilePlus2 size={16} /> Give a task</Link>
        <Link href="/admin/multigraphic-ai/meetings"><UsersRound size={16} /> Call a meeting</Link>
        <Link href="/admin/multigraphic-ai/documentation"><FileText size={16} /> Work records</Link>
        <Link href="/admin/multigraphic-ai/knowledge/new"><BookOpen size={16} /> Supply knowledge</Link>
        <Link href="/admin/multigraphic-ai/deliverables"><CheckCircle2 size={16} /> Review outputs</Link>
        <Link href="/admin/multigraphic-ai/deliverables"><ArrowRight size={16} /> Request a revision</Link>
        {task?.workflowRunId && <button type="button" onClick={() => void cancelRun()} disabled={canceling}>
          {canceling ? <LoaderCircle size={16} className="hq-spinning" /> : <CircleAlert size={16} />}{canceling ? 'Requesting…' : 'Cancel current run'}
        </button>}
        {actionMessage && <p className="hq-action-message" role="status">{actionMessage}</p>}
      </section>}
    </div>
  </aside>;
}

export default function HeadquartersWorkspace() {
  const prefersReducedMotion = useSyncExternalStore(subscribeMotion, getMotionSnapshot, getServerMotionSnapshot);
  const compact = useSyncExternalStore(subscribeViewport, getCompactViewport, getServerCompactViewport);
  const [motionOverride, setMotionOverride] = useState<boolean | null>(null);
  const reducedMotion = motionOverride ?? prefersReducedMotion;
  const [data, setData] = useState<HeadquartersData | null>(null);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0); const [demoMode, setDemoMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sceneView, setSceneView] = useState<HeadquartersView>('building');
  const [lighting, setLighting] = useState<'day' | 'evening'>('day');
  const [viewStyle, setViewStyle] = useState<'spatial' | 'plan'>('spatial');
  const [wayfinding, setWayfinding] = useState(true);
  const [view, setView] = useState<'world' | 'list'>('world');
  const [quality, setQuality] = useState<'standard' | 'low'>('standard');
  const [destination, setDestination] = useState<WorldPoint | null>(null);
  const [focusedRoom, setFocusedRoom] = useState<string | null>(null);
  const [resetViewKey, setResetViewKey] = useState(0);
  useEffect(() => {
    if (demoMode) return;
    const controller = new AbortController();
    fetch('/api/admin/operations/headquarters', { cache: 'no-store', signal: controller.signal }).then(async response => { const result = await response.json(); if (!response.ok) throw new Error(result.error || 'The employee directory is unavailable.'); return result as HeadquartersData; }).then(result => { setData(result); setError(''); }).catch(error => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'The directory is unavailable.'); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reloadKey, demoMode]);
  useEffect(() => { if (demoMode) return; const timer = window.setInterval(() => { if (document.visibilityState === 'visible') setReloadKey(value => value + 1); }, 15000); return () => window.clearInterval(timer); }, [demoMode]);
  useEffect(() => { const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setSelectedId(null); setFocusedRoom(null); } }; window.addEventListener('keydown', escape); return () => window.removeEventListener('keydown', escape); }, []);
  const profiles = demoMode ? headquartersDemoProfiles : data?.profiles ?? [];
  const floor = companyFloors.find(floor => floor.key === sceneView) ?? companyFloors[1];
  const floorProfiles = sceneView === 'building' ? profiles : profiles.filter(profile => floorForRoom(profile.roomKey) === sceneView);
  const selected = profiles.find(profile => profile.id === selectedId);
  const room = companyFloors.flatMap(floor => floor.rooms).find(room => room.key === focusedRoom);
  const department = room ? departmentForRoom(room.key) : null;
  const roomDesign = room ? roomArchitecture[room.key] : null;
  function chooseFloor(next: HeadquartersView) { setSceneView(next); setFocusedRoom(null); setSelectedId(null); setDestination(null); }
  function chooseRoom(key: string) { const roomFloor = floorForRoom(key); if (sceneView !== roomFloor) setSceneView(roomFloor); setFocusedRoom(key); setSelectedId(null); const room = companyFloors.find(floor => floor.key === roomFloor)?.rooms.find(room => room.key === key); if (roomFloor === 'delivery' && room) setDestination(roomArrivalPoint(room)); }
  function selectPerson(id: string) { const person = profiles.find(profile => profile.id === id); if (!person) return; setSceneView(floorForRoom(person.roomKey)); setFocusedRoom(person.roomKey); setSelectedId(id); }
  function reset() { setFocusedRoom(null); setSelectedId(null); setResetViewKey(value => value + 1); }
  return <section className="studio-hq architecture-hq" aria-label="Multigraphic AI headquarters">
    <header className="studio-header"><div className="studio-wordmark"><span>M<span>↗</span></span><div><strong>multigraphic<span> / ai</span></strong><small>YOUR COMPANY, TOGETHER.</small></div></div><nav aria-label="Workspace shortcuts"><Link href="/admin/multigraphic-ai/overview">Workspace <ArrowRight size={14} /></Link><Link className="studio-new-brief" href="/admin/multigraphic-ai/projects/new"><Plus size={15} /> New brief</Link></nav></header>
    <div className="studio-body"><aside className="studio-explorer"><div className="studio-explorer-title"><span>THE HEADQUARTERS</span><small>01 / THE STUDIO</small></div><h1>Built for<br />creative work<span>.</span></h1><p className="studio-intro">One address. Every discipline.<br />A considered space for your company.</p>
      <button className={`studio-building-button ${sceneView === 'building' ? 'selected' : ''}`} onClick={() => chooseFloor('building')} aria-pressed={sceneView === 'building'}><Building size={18} /><span>Whole building<small>Three connected floors</small></span><ArrowUpRightIcon /></button>
      <div className="studio-floor-navigation" aria-label="Choose a floor">{[...companyFloors].reverse().map(item => <button key={item.key} className={sceneView === item.key ? 'selected' : ''} onClick={() => chooseFloor(item.key)} aria-pressed={sceneView === item.key}><b>{item.number}</b><span>{item.name}<small>{item.rooms.length} spaces · {item.key === 'delivery' ? 'Website workflow' : 'Planning & management'}</small></span><ChevronRight size={14} /></button>)}</div>
      {sceneView === 'building' ? <div className="architecture-building-notes"><p className="architecture-caption">A CONNECTED WORKPLACE</p><p>Visitor spaces below. Making and reviewing at the heart. Leadership, film, and sound above.</p><div className="architecture-materials"><span><i className="material-stone" />Limestone</span><span><i className="material-oak" />Oak</span><span><i className="material-glass" />Glass</span></div><small>Interactive architectural concept</small></div> : <div className="studio-room-navigation"><p>{`LEVEL ${floor.number} / ROOMS`}</p>{floor.rooms.map((item, index) => <button key={item.key} onClick={() => chooseRoom(item.key)} className={focusedRoom === item.key ? 'selected' : ''}><span>{String(index + 1).padStart(2, '0')}</span>{item.name}<ZoomIn size={12} /></button>)}</div>}
      <footer><Link href="/admin/multigraphic-ai/departments"><Layers3 size={15} /> All departments <ArrowRight size={13} /></Link><Link href="/admin/multigraphic-ai/people"><UsersRound size={15} /> People & Academy <ArrowRight size={13} /></Link></footer>
    </aside>
    <div className="studio-stage"><div className="studio-stage-header"><div><p>{sceneView === 'building' ? 'THE COMPANY / ARCHITECTURAL OVERVIEW' : `LEVEL ${floor.number} / ${room ? 'ROOM VIEW' : 'FLOOR VIEW'}`}</p><h2>{sceneView === 'building' ? 'Multigraphic headquarters' : room?.name ?? floor.name}</h2></div><div className="studio-view-controls"><div role="group" aria-label="Experience view"><button onClick={() => setView('world')} aria-pressed={view === 'world'}><Building2 size={14} /> <span>Explore</span></button><button onClick={() => setView('list')} aria-pressed={view === 'list'}><List size={14} /> <span>Directory</span></button></div><button title="Reset floor view" aria-label="Reset floor view" onClick={reset}><RotateCcw size={16} /></button></div></div>
      {view === 'world' ? <div className="studio-canvas"><SceneErrorBoundary fallback={<div className="hq-scene-fallback"><p>The 3D view could not start.</p><button onClick={() => setView('list')}>Open the company directory</button></div>}><HeadquartersScene characters={profiles} destination={destination} sceneView={sceneView} resetViewKey={resetViewKey} reducedMotion={reducedMotion} quality={quality} compact={compact} selectedCharacterId={selectedId} focusedRoom={focusedRoom} lighting={lighting} viewStyle={viewStyle} wayfinding={wayfinding} onSelectFloor={chooseFloor} onSelectCharacter={selectPerson} onSelectRoom={chooseRoom} onMoveTo={point => setDestination(point)} /></SceneErrorBoundary></div> : <div className="studio-directory"><header><p className="company-kicker">COMPANY DIRECTORY</p><h3>{floorProfiles.length} people{sceneView !== 'building' ? ` on Level ${floor.number}` : ' across the company'}</h3></header>{floorProfiles.map(character => <CharacterButton key={character.id} character={character} selected={selectedId === character.id} onClick={() => selectPerson(character.id)} />)}{!floorProfiles.length && <p className="studio-empty">{loading ? 'Loading the directory…' : 'No employee profiles are available on this floor.'}</p>}</div>}
      {view === 'world' && <div className="architecture-controls" aria-label="Architectural view settings"><div role="group" aria-label="Lighting"><button onClick={() => setLighting('day')} aria-pressed={lighting === 'day'}><Sun size={13} /><span>Daylight</span></button><button onClick={() => setLighting('evening')} aria-pressed={lighting === 'evening'}><Moon size={13} /><span>Evening</span></button></div><div role="group" aria-label="Camera view"><button onClick={() => setViewStyle('spatial')} aria-pressed={viewStyle === 'spatial'}><Building2 size={13} /><span>Spatial</span></button><button onClick={() => setViewStyle('plan')} aria-pressed={viewStyle === 'plan'}><Map size={13} /><span>Plan</span></button></div><button className="architecture-label-toggle" onClick={() => setWayfinding(value => !value)} aria-pressed={wayfinding}><Tags size={13} /><span>Labels</span></button></div>}
      <div className="studio-state-banner">{demoMode ? <><FlaskConical size={14} /><span><strong>Design exploration</strong> · Fictional profiles, no live work</span><button onClick={() => { setDemoMode(false); setSelectedId(null); }}>Exit demo</button></> : error ? <><CircleAlert size={14} /><span>Employee data unavailable</span><button title={error} onClick={() => { setDemoMode(true); setSelectedId(null); }}>Explore demo team <ArrowRight size={12} /></button></> : loading ? <><LoaderCircle size={14} /><span>Loading saved employee records…</span></> : <><span className="studio-connection-dot" /><span>{profiles.length} employee profiles · {data?.execution.connected ? 'Execution connected' : 'Execution not connected'}{data?.meetings?.length ? ` · ${data.meetings.length} meeting${data.meetings.length > 1 ? 's' : ''} in session` : ''}</span><button onClick={() => setReloadKey(value => value + 1)} aria-label="Refresh employees"><RefreshCw size={13} /></button></>}</div>
      {!selected && room && <div className="studio-room-card"><span className="company-kicker">{department ? 'A SPACE FOR THE WORK' : 'SHARED COMPANY SPACE'}</span><h3>{room.name}</h3><p>{roomDesign?.intent ?? room.purpose}</p>{roomDesign && <dl className="architecture-room-metrics"><div><dt>Concept area</dt><dd>{Math.round(roomDesign.size[0] * roomDesign.size[1])} <small>m²</small></dd></div><div><dt>Designed places</dt><dd>{roomDesign.capacity.toString().padStart(2, '0')}</dd></div><div><dt>Floor finish</dt><dd className="architecture-finish-name">{roomDesign.finish}</dd></div></dl>}{department && <div className="studio-room-outputs">{department.outputs.map(output => <span key={output}>{output}</span>)}</div>}<footer><button onClick={reset}><ArrowDownLeft size={14} /> Floor view</button>{department && <Link href={`/admin/multigraphic-ai/departments#${department.key}`}>Open department <ArrowRight size={14} /></Link>}{!department && room.key.includes('meeting') && <Link href="/admin/multigraphic-ai/meetings">Meetings <ArrowRight size={14} /></Link>}</footer></div>}
      {selected && <InteractionPanel character={selected} demoMode={demoMode} onClose={() => setSelectedId(null)} onRefresh={() => setReloadKey(value => value + 1)} />}
      <div className="studio-stage-bottom"><div><MousePointer2 size={13} /><span>Click a room to step inside</span><i /><span>Drag to orbit · Scroll to zoom</span></div><div><button onClick={() => setQuality(current => current === 'standard' ? 'low' : 'standard')} aria-pressed={quality === 'low'}>{quality === 'low' ? 'Low graphics' : 'High graphics'}</button><button onClick={() => setMotionOverride(!reducedMotion)} aria-pressed={reducedMotion}>{reducedMotion ? 'Motion off' : 'Motion on'}</button></div></div>
    </div></div>
    <footer className="studio-footer"><span><span className="studio-connection-dot" />{demoMode ? 'ISOLATED DESIGN DEMO' : 'PRIVATE OWNER WORKSPACE'}</span><p>{sceneView === 'delivery' ? 'Design. Build. Review. Deliver.' : sceneView === 'building' ? 'A home for every discipline.' : 'Department spaces are open. Service execution follows configured contracts.'}</p><span>AMMAN · BEIRUT <ArrowRight size={12} /></span></footer>
  </section>;
}
function ArrowUpRightIcon() { return <ArrowRight size={14} className="studio-diagonal-arrow" />; }
