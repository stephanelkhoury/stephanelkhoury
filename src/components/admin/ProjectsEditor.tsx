'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ProjectInput, ScreenshotItem } from '@/lib/admin-types';
import ImageUploaderField from './ImageUploaderField';

const CATEGORIES = [
  'E-Commerce',
  'Communication',
  'Enterprise',
  'CMS',
  'Backend & Security',
  'AI & Machine Learning',
  'DevOps',
  'Media & Streaming',
  'Analytics',
  'Web Application',
  'Mobile App',
  'SaaS',
];

const emptyProject = (): ProjectInput => ({
  title: '',
  slug: '',
  summary: '',
  description: '',
  imageUrl: '',
  githubUrl: '',
  liveUrl: '',
  technologies: [],
  category: '',
  date: '',
  features: [],
  challenges: [],
  screenshots: [],
  performanceMetrics: null,
  sortOrder: 0,
  isActive: true,
});

export default function ProjectsEditor() {
  const [projects, setProjects] = useState<ProjectInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [testingPerf, setTestingPerf] = useState<number | null>(null);

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => a.sortOrder - b.sortOrder),
    [projects]
  );

  const load = async () => {
    setMessage('');
    const response = await fetch('/api/admin/projects', { cache: 'no-store' });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || 'Failed to auto-load projects');
      setLoading(false);
      return;
    }

    const loaded = (data.projects || []).map((p: Record<string, unknown>) => ({
      ...p,
      features: Array.isArray(p.features) ? p.features : [],
      challenges: Array.isArray(p.challenges) ? p.challenges : [],
      screenshots: Array.isArray(p.screenshots) ? p.screenshots : [],
      performanceMetrics: p.performanceMetrics || null,
    }));

    setProjects(loaded);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const updateProject = <K extends keyof ProjectInput>(index: number, key: K, value: ProjectInput[K]) => {
    setProjects((current) => current.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  const addProject = () => {
    setProjects((current) => [...current, { ...emptyProject(), sortOrder: current.length + 1 }]);
    setExpandedIndex(projects.length);
  };

  const removeProject = (index: number) => {
    if (!confirm('Are you sure you want to remove this project?')) return;
    setProjects((current) => current.filter((_, i) => i !== index));
    setExpandedIndex(null);
  };

  const duplicateProject = (index: number) => {
    const source = projects[index];
    const copy = { ...source, title: source.title + ' (Copy)', slug: source.slug + '-copy', id: undefined, sortOrder: projects.length + 1 };
    setProjects((current) => [...current, copy]);
    setExpandedIndex(projects.length);
  };

  const addFeature = (pi: number) => {
    const current = projects[pi].features || [];
    updateProject(pi, 'features', [...current, '']);
  };
  const updateFeature = (pi: number, fi: number, value: string) => {
    const current = [...(projects[pi].features || [])];
    current[fi] = value;
    updateProject(pi, 'features', current);
  };
  const removeFeature = (pi: number, fi: number) => {
    const current = [...(projects[pi].features || [])];
    current.splice(fi, 1);
    updateProject(pi, 'features', current);
  };

  const addChallenge = (pi: number) => {
    const current = projects[pi].challenges || [];
    updateProject(pi, 'challenges', [...current, '']);
  };
  const updateChallenge = (pi: number, ci: number, value: string) => {
    const current = [...(projects[pi].challenges || [])];
    current[ci] = value;
    updateProject(pi, 'challenges', current);
  };
  const removeChallenge = (pi: number, ci: number) => {
    const current = [...(projects[pi].challenges || [])];
    current.splice(ci, 1);
    updateProject(pi, 'challenges', current);
  };

  const addScreenshot = (pi: number, type: 'desktop' | 'mobile') => {
    const current = projects[pi].screenshots || [];
    updateProject(pi, 'screenshots', [...current, { url: '', type, caption: '' }]);
  };
  const updateScreenshot = (pi: number, si: number, updates: Partial<ScreenshotItem>) => {
    const current = [...(projects[pi].screenshots || [])];
    current[si] = { ...current[si], ...updates };
    updateProject(pi, 'screenshots', current);
  };
  const removeScreenshot = (pi: number, si: number) => {
    const current = [...(projects[pi].screenshots || [])];
    current.splice(si, 1);
    updateProject(pi, 'screenshots', current);
  };

  const runPerformanceTest = async (index: number) => {
    const project = projects[index];
    if (!project.liveUrl) {
      setMessage('Set a Live URL first to run a performance test.');
      return;
    }
    setTestingPerf(index);
    setMessage('Running Lighthouse performance test...');
    try {
      const response = await fetch('/api/admin/performance-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: project.liveUrl }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || 'Performance test failed');
        return;
      }
      updateProject(index, 'performanceMetrics', {
        performance: data.performance,
        accessibility: data.accessibility,
        bestPractices: data.bestPractices,
        seo: data.seo,
        testedAt: new Date().toISOString(),
      });
      setMessage('Performance test complete!');
    } catch {
      setMessage('Performance test failed. Try again.');
    } finally {
      setTestingPerf(null);
    }
  };

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projects }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || 'Failed to save projects');
        return;
      }
      setMessage('Projects saved successfully.');
      await load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-gray-300">Auto-loading projects from PostgreSQL...</div>;
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1 tracking-tight">Projects CMS</h1>
          <p className="text-slate-400">Full project management with images, screenshots, features &amp; performance metrics.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={addProject} className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700">
            + Add Project
          </button>
          <button
            onClick={() => void save()}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-slate-200 text-slate-900 font-medium hover:bg-white disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </header>

      {message && (
        <p className={`text-sm px-4 py-2 rounded-lg ${message.includes('success') || message.includes('complete') ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
          {message}
        </p>
      )}

      <div className="space-y-4">
        {sortedProjects.map((project, index) => {
          const isExpanded = expandedIndex === index;
          const metrics = project.performanceMetrics;

          return (
            <article key={`${project.slug}-${index}`} className="rounded-xl border border-slate-700 bg-[#0f172a] overflow-hidden">
              {/* Collapsed Header */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800 border border-slate-700">
                  {project.imageUrl ? (
                    <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-slate-600 text-xs">No img</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold truncate">{project.title || 'Untitled Project'}</h2>
                    {project.category && (
                      <span className="px-2 py-0.5 text-[10px] bg-cyan-500/20 text-cyan-300 rounded-full flex-shrink-0">{project.category}</span>
                    )}
                    {!project.isActive && (
                      <span className="px-2 py-0.5 text-[10px] bg-red-500/20 text-red-300 rounded-full flex-shrink-0">Draft</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 truncate">{project.summary || 'No summary'}</p>
                </div>

                {metrics && (
                  <div className="hidden md:flex gap-1.5 flex-shrink-0">
                    <ScoreBadge label="P" score={metrics.performance} />
                    <ScoreBadge label="A" score={metrics.accessibility} />
                    <ScoreBadge label="BP" score={metrics.bestPractices} />
                    <ScoreBadge label="S" score={metrics.seo} />
                  </div>
                )}

                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); duplicateProject(index); }} className="p-1.5 rounded hover:bg-slate-700 text-slate-400" title="Duplicate">⧉</button>
                  <button onClick={(e) => { e.stopPropagation(); removeProject(index); }} className="p-1.5 rounded hover:bg-red-500/20 text-red-400" title="Delete">✕</button>
                </div>

                <span className={`text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-slate-700 p-5 space-y-6">
                  {/* Basic Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input label="Title" value={project.title} onChange={(v) => updateProject(index, 'title', v)} />
                    <Input label="Slug" value={project.slug} onChange={(v) => updateProject(index, 'slug', v)} />
                    <div>
                      <span className="text-xs text-slate-400">Category</span>
                      <select
                        value={project.category}
                        onChange={(e) => updateProject(index, 'category', e.target.value)}
                        className="w-full mt-1 rounded-lg px-3 py-2 bg-[#020617] border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      >
                        <option value="">Select category...</option>
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <Input label="Date" value={project.date || ''} onChange={(v) => updateProject(index, 'date', v)} placeholder="e.g. 2025" />
                    <Input label="GitHub URL" value={project.githubUrl || ''} onChange={(v) => updateProject(index, 'githubUrl', v)} />
                    <Input label="Live URL" value={project.liveUrl || ''} onChange={(v) => updateProject(index, 'liveUrl', v)} />
                    <Input label="Sort Order" value={String(project.sortOrder)} onChange={(v) => updateProject(index, 'sortOrder', Number(v) || 0)} />
                    <label className="flex gap-2 text-sm text-gray-300 items-center mt-6">
                      <input type="checkbox" checked={project.isActive} onChange={(e) => updateProject(index, 'isActive', e.target.checked)} />
                      Active (visible on portfolio)
                    </label>
                  </div>

                  <TextArea label="Summary (short card description)" value={project.summary} onChange={(v) => updateProject(index, 'summary', v)} rows={2} />
                  <TextArea label="Full Description" value={project.description} onChange={(v) => updateProject(index, 'description', v)} rows={4} />
                  <TextArea
                    label="Technologies (comma-separated)"
                    value={project.technologies.join(', ')}
                    onChange={(v) => updateProject(index, 'technologies', v.split(',').map((s) => s.trim()).filter(Boolean))}
                    rows={2}
                  />

                  {/* Cover Image */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200 mb-2">Cover Image</h3>
                    <ImageUploaderField
                      label="Project Cover"
                      value={project.imageUrl || ''}
                      onChange={(url) => updateProject(index, 'imageUrl', url)}
                      helperText="Main project image shown on cards and modal header."
                    />
                  </div>

                  {/* Features */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-slate-200">Key Features</h3>
                      <button onClick={() => addFeature(index)} className="text-xs px-3 py-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700">+ Add Feature</button>
                    </div>
                    <div className="space-y-2">
                      {(project.features || []).map((feature, fi) => (
                        <div key={fi} className="flex gap-2">
                          <input
                            value={feature}
                            onChange={(e) => updateFeature(index, fi, e.target.value)}
                            placeholder="Enter feature..."
                            className="flex-1 rounded-lg px-3 py-2 bg-[#020617] border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                          />
                          <button onClick={() => removeFeature(index, fi)} className="px-2 text-red-400 hover:bg-red-500/20 rounded">✕</button>
                        </div>
                      ))}
                      {(project.features || []).length === 0 && <p className="text-xs text-slate-500">No features added yet.</p>}
                    </div>
                  </div>

                  {/* Challenges */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-slate-200">Technical Challenges</h3>
                      <button onClick={() => addChallenge(index)} className="text-xs px-3 py-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700">+ Add Challenge</button>
                    </div>
                    <div className="space-y-2">
                      {(project.challenges || []).map((challenge, ci) => (
                        <div key={ci} className="flex gap-2">
                          <input
                            value={challenge}
                            onChange={(e) => updateChallenge(index, ci, e.target.value)}
                            placeholder="Enter challenge..."
                            className="flex-1 rounded-lg px-3 py-2 bg-[#020617] border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                          />
                          <button onClick={() => removeChallenge(index, ci)} className="px-2 text-red-400 hover:bg-red-500/20 rounded">✕</button>
                        </div>
                      ))}
                      {(project.challenges || []).length === 0 && <p className="text-xs text-slate-500">No challenges added yet.</p>}
                    </div>
                  </div>

                  {/* Screenshot Gallery */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-slate-200">Screenshot Gallery</h3>
                      <div className="flex gap-2">
                        <button onClick={() => addScreenshot(index, 'desktop')} className="text-xs px-3 py-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700">+ Desktop</button>
                        <button onClick={() => addScreenshot(index, 'mobile')} className="text-xs px-3 py-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700">+ Mobile</button>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {(project.screenshots || []).map((ss, si) => (
                        <div key={si} className="rounded-lg border border-slate-700 bg-[#020617] p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${ss.type === 'desktop' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}`}>
                              {ss.type === 'desktop' ? '🖥 Desktop' : '📱 Mobile'}
                            </span>
                            <button onClick={() => removeScreenshot(index, si)} className="text-xs text-red-400 hover:bg-red-500/20 px-2 py-0.5 rounded">Remove</button>
                          </div>
                          <ImageUploaderField label={`${ss.type} screenshot`} value={ss.url} onChange={(url) => updateScreenshot(index, si, { url })} />
                          <input
                            value={ss.caption || ''}
                            onChange={(e) => updateScreenshot(index, si, { caption: e.target.value })}
                            placeholder="Caption (optional)"
                            className="w-full rounded-lg px-3 py-2 bg-[#020617] border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                          />
                        </div>
                      ))}
                    </div>
                    {(project.screenshots || []).length === 0 && <p className="text-xs text-slate-500">No screenshots yet. Add desktop and mobile screenshots to showcase your work.</p>}
                  </div>

                  {/* Performance Metrics */}
                  <div className="rounded-lg border border-slate-700 bg-[#020617] p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-200">Performance Metrics (Lighthouse)</h3>
                      <button
                        onClick={() => void runPerformanceTest(index)}
                        disabled={testingPerf === index || !project.liveUrl}
                        className="text-xs px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
                      >
                        {testingPerf === index ? '⏳ Testing...' : '🚀 Run Lighthouse Test'}
                      </button>
                    </div>
                    {!project.liveUrl && <p className="text-xs text-yellow-400/70">Set a Live URL above to enable performance testing.</p>}
                    {metrics ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-4 gap-3">
                          <ScoreCard label="Performance" score={metrics.performance} onChange={(v) => updateProject(index, 'performanceMetrics', { ...metrics, performance: v })} />
                          <ScoreCard label="Accessibility" score={metrics.accessibility} onChange={(v) => updateProject(index, 'performanceMetrics', { ...metrics, accessibility: v })} />
                          <ScoreCard label="Best Practices" score={metrics.bestPractices} onChange={(v) => updateProject(index, 'performanceMetrics', { ...metrics, bestPractices: v })} />
                          <ScoreCard label="SEO" score={metrics.seo} onChange={(v) => updateProject(index, 'performanceMetrics', { ...metrics, seo: v })} />
                        </div>
                        {metrics.testedAt && <p className="text-[11px] text-slate-500">Last tested: {new Date(metrics.testedAt).toLocaleString()}</p>}
                        <button onClick={() => updateProject(index, 'performanceMetrics', null)} className="text-xs text-slate-500 hover:text-red-400">Clear metrics</button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-3">
                        {['Performance', 'Accessibility', 'Best Practices', 'SEO'].map((label) => (
                          <div key={label} className="text-center p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                            <div className="text-2xl text-slate-600">—</div>
                            <div className="text-[10px] text-slate-500 mt-1">{label}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p>No projects yet. Click &quot;+ Add Project&quot; to get started.</p>
        </div>
      )}
    </section>
  );
}

function ScoreBadge({ label, score }: { label: string; score: number }) {
  const color = score >= 90 ? 'text-emerald-400 bg-emerald-500/20' : score >= 50 ? 'text-yellow-400 bg-yellow-500/20' : 'text-red-400 bg-red-500/20';
  return <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${color}`}>{label} {score}</span>;
}

function ScoreCard({ label, score, onChange }: { label: string; score: number; onChange: (v: number) => void }) {
  const color = score >= 90 ? 'text-emerald-400 border-emerald-500/30' : score >= 50 ? 'text-yellow-400 border-yellow-500/30' : 'text-red-400 border-red-500/30';
  return (
    <div className={`text-center p-3 rounded-lg bg-slate-900/50 border ${color}`}>
      <input type="number" min={0} max={100} value={score} onChange={(e) => onChange(Math.min(100, Math.max(0, Number(e.target.value) || 0)))} className="w-16 text-center text-2xl font-bold bg-transparent border-none outline-none" style={{ color: 'inherit' }} />
      <div className="text-[10px] text-slate-400 mt-1">{label}</div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-400">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full mt-1 rounded-lg px-3 py-2 bg-[#020617] border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500" />
    </label>
  );
}

function TextArea({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (value: string) => void; rows?: number }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-400">{label}</span>
      <textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} className="w-full mt-1 rounded-lg px-3 py-2 bg-[#020617] border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500" />
    </label>
  );
}
