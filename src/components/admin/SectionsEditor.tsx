'use client';

import { useEffect, useState } from 'react';
import type { ContentBlockInput } from '@/lib/admin-types';

type ServiceItem = {
  icon: string;
  title: string;
  desc: string;
  iconColor?: string;
};

export default function SectionsEditor() {
  const [blocks, setBlocks] = useState<ContentBlockInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setStatus('');
    const response = await fetch('/api/admin/blocks', { cache: 'no-store' });
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error || 'Failed to load sections');
      setLoading(false);
      return;
    }

    setBlocks(data.blocks || []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const getBlockBySlug = (slug: string) => blocks.find((block) => block.slug === slug);

  const setBlockFieldBySlug = (slug: string, field: keyof ContentBlockInput, value: unknown) => {
    setBlocks((current) => current.map((block) => (block.slug === slug ? { ...block, [field]: value } : block)));
  };

  const setBlockContentFieldBySlug = (slug: string, key: string, value: unknown) => {
    setBlocks((current) =>
      current.map((block) =>
        block.slug === slug ? { ...block, content: { ...(block.content || {}), [key]: value } } : block
      )
    );
  };

  const parseServicesItems = (slug: string): ServiceItem[] => {
    const raw = getBlockBySlug(slug)?.content?.items;
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
      .map((item) => ({
        icon: String(item.icon || ''),
        title: String(item.title || ''),
        desc: String(item.desc || ''),
        iconColor: String(item.iconColor || '#60a5fa'),
      }));
  };

  const updateServiceItem = (slug: string, index: number, key: keyof ServiceItem, value: unknown) => {
    const items = parseServicesItems(slug);
    const updated = items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item));
    setBlockContentFieldBySlug(slug, 'items', updated);
  };

  const save = async () => {
    setStatus('');
    setSaving(true);
    try {
      const response = await fetch('/api/admin/blocks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blocks }),
      });

      const data = await response.json();
      if (!response.ok) {
        setStatus(data.error || 'Failed to save sections');
        return;
      }

      setStatus('Sections saved successfully.');
      await load();
    } finally {
      setSaving(false);
    }
  };

  const hero = getBlockBySlug('hero-main');
  const contact = getBlockBySlug('contact-main');
  const services = getBlockBySlug('services-main');

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold mb-2 tracking-tight">Section CMS</h1>
        <p className="text-slate-400">Manage homepage content directly from Neon PostgreSQL.</p>
      </header>

      {loading ? (
        <p className="text-slate-300">Auto-loading sections...</p>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => void save()}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-slate-200 text-slate-900 font-medium hover:bg-white disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Sections'}
          </button>
        </div>
      )}

      {status && <p className="text-sm text-slate-300">{status}</p>}

      <SectionCard title="Hero (hero-main)">
        <Input label="Title" value={hero?.title || ''} onChange={(value) => setBlockFieldBySlug('hero-main', 'title', value)} />
        <Input label="Subtitle" value={hero?.subtitle || ''} onChange={(value) => setBlockFieldBySlug('hero-main', 'subtitle', value)} />
        <Input label="Badge" value={String(hero?.content?.badge || '')} onChange={(value) => setBlockContentFieldBySlug('hero-main', 'badge', value)} />
        <Input label="Heading Primary" value={String(hero?.content?.headingPrimary || '')} onChange={(value) => setBlockContentFieldBySlug('hero-main', 'headingPrimary', value)} />
        <Input label="Heading Accent" value={String(hero?.content?.headingAccent || '')} onChange={(value) => setBlockContentFieldBySlug('hero-main', 'headingAccent', value)} />
        <Input label="Heading Suffix" value={String(hero?.content?.headingSuffix || '')} onChange={(value) => setBlockContentFieldBySlug('hero-main', 'headingSuffix', value)} />
      </SectionCard>

      <SectionCard title="Services (services-main)">
        <Input label="Title" value={services?.title || ''} onChange={(value) => setBlockFieldBySlug('services-main', 'title', value)} />
        <Input label="Subtitle" value={services?.subtitle || ''} onChange={(value) => setBlockFieldBySlug('services-main', 'subtitle', value)} />
        <TextArea
          label="Section Description"
          value={String(services?.content?.subtitle || '')}
          onChange={(value) => setBlockContentFieldBySlug('services-main', 'subtitle', value)}
          rows={2}
        />

        {parseServicesItems('services-main').map((item, index) => (
          <div key={`${item.title}-${index}`} className="md:col-span-2 rounded-xl border border-slate-700/80 bg-[#020617] p-4">
            <div className="grid md:grid-cols-2 gap-3">
              <Input
                label={`Service ${index + 1} Title`}
                value={item.title}
                onChange={(value) => updateServiceItem('services-main', index, 'title', value)}
              />
              <Input
                label="Icon Key"
                value={item.icon}
                onChange={(value) => updateServiceItem('services-main', index, 'icon', value)}
              />
              <label className="block">
                <span className="text-sm text-slate-300">Icon Color</span>
                <input
                  type="color"
                  value={item.iconColor || '#60a5fa'}
                  onChange={(event) => updateServiceItem('services-main', index, 'iconColor', event.target.value)}
                  className="w-full mt-1 h-11 rounded-lg px-2 py-1 bg-[#020617] border border-slate-700"
                />
              </label>
              <Input
                label="Description"
                value={item.desc}
                onChange={(value) => updateServiceItem('services-main', index, 'desc', value)}
              />
            </div>
          </div>
        ))}
      </SectionCard>

      <SectionCard title="Contact (contact-main)">
        <Input label="Title" value={contact?.title || ''} onChange={(value) => setBlockFieldBySlug('contact-main', 'title', value)} />
        <Input label="Subtitle" value={contact?.subtitle || ''} onChange={(value) => setBlockFieldBySlug('contact-main', 'subtitle', value)} />
        <Input label="Email" value={String(contact?.content?.email || '')} onChange={(value) => setBlockContentFieldBySlug('contact-main', 'email', value)} />
        <Input label="Phone" value={String(contact?.content?.phone || '')} onChange={(value) => setBlockContentFieldBySlug('contact-main', 'phone', value)} />
      </SectionCard>
    </section>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-[#0f172a] p-5">
      <h2 className="text-lg font-semibold mb-4 tracking-tight">{title}</h2>
      <div className="grid md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm text-slate-300">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full mt-1 rounded-lg px-3 py-2 bg-[#020617] border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block md:col-span-2">
      <span className="text-sm text-slate-300">{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full mt-1 rounded-lg px-3 py-2 bg-[#020617] border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
      />
    </label>
  );
}
