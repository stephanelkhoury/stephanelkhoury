'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type BlobAsset = {
  id: string;
  url: string;
  blobUrl?: string;
  pathname: string;
  contentType: string | null;
  size: number;
  source: string;
  createdAt: string;
};

type HealthResult = {
  ok: boolean;
  checks?: {
    blobWrite: boolean;
    blobRead: boolean;
    blobDelete: boolean;
    neonWrite: boolean;
    neonDelete: boolean;
  };
  tookMs?: number;
  error?: string;
};

function formatSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export default function BlobStorageManager() {
  const [folder, setFolder] = useState('cms');
  const [assets, setAssets] = useState<BlobAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [runningHealth, setRunningHealth] = useState(false);
  const [health, setHealth] = useState<HealthResult | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const hasAssets = assets.length > 0;

  const healthLabel = useMemo(() => {
    if (!health) return '';
    if (!health.ok) return `Health check failed: ${health.error || 'unknown error'}`;
    return `Health check passed in ${health.tookMs}ms`;
  }, [health]);

  const loadAssets = async () => {
    setLoading(true);
    setStatus('Loading files...');
    try {
      const response = await fetch(`/api/admin/uploads?folder=${encodeURIComponent(folder)}&limit=200`, {
        cache: 'no-store',
      });
      const data = await response.json();
      if (!response.ok) {
        setStatus(data.error || 'Failed to load files');
        return;
      }
      setAssets(data.assets || []);
      setStatus('');
    } catch {
      setStatus('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAssets();
  }, [folder]);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setStatus('Uploading to Blob...');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/admin/uploads', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        setStatus(data.error || 'Upload failed');
        return;
      }

      setStatus('Upload complete');
      await loadAssets();
    } catch {
      setStatus('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const deleteAsset = async (asset: BlobAsset) => {
    setStatus('Deleting file...');
    try {
      const response = await fetch('/api/admin/uploads', {
        method: 'DELETE',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ id: asset.id }),
      });
      const data = await response.json();
      if (!response.ok) {
        setStatus(data.error || 'Delete failed');
        return;
      }

      setAssets((current) => current.filter((item) => item.id !== asset.id));
      setStatus('File deleted');
    } catch {
      setStatus('Delete failed');
    }
  };

  const runHealthCheck = async () => {
    setRunningHealth(true);
    setStatus('Running Blob + Neon health check...');
    try {
      const response = await fetch('/api/admin/blob/health', { cache: 'no-store' });
      const data = (await response.json()) as HealthResult;
      setHealth(data);
      if (!response.ok || !data.ok) {
        setStatus(data.error || 'Health check failed');
        return;
      }
      setStatus('Health check passed');
    } catch {
      setHealth({ ok: false, error: 'Health check failed' });
      setStatus('Health check failed');
    } finally {
      setRunningHealth(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Blob Storage Manager</h1>
        <p className="text-slate-400 mt-2 max-w-3xl">
          Upload files to Vercel Blob, keep metadata in Neon, and manage everything online from one place.
        </p>
      </div>

      <div className="rounded-xl border border-slate-700 bg-[#0f172a] p-4 md:p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-slate-300">
            Folder
            <input
              value={folder}
              onChange={(event) => setFolder(event.target.value)}
              className="ml-2 rounded-md border border-slate-600 bg-[#020617] px-3 py-2 text-sm"
              placeholder="cms"
            />
          </label>

          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="px-3 py-2 rounded-md bg-slate-200 text-slate-900 text-sm font-medium hover:bg-white disabled:opacity-60"
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>

          <button
            type="button"
            onClick={() => void loadAssets()}
            disabled={loading}
            className="px-3 py-2 rounded-md border border-slate-600 text-sm hover:bg-slate-800 disabled:opacity-60"
          >
            Refresh List
          </button>

          <button
            type="button"
            onClick={() => void runHealthCheck()}
            disabled={runningHealth}
            className="px-3 py-2 rounded-md border border-emerald-700/70 text-emerald-300 text-sm hover:bg-emerald-900/20 disabled:opacity-60"
          >
            {runningHealth ? 'Checking...' : 'Run Blob + Neon Health Check'}
          </button>

          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (file) {
                await uploadFile(file);
              }
              event.target.value = '';
            }}
          />
        </div>

        {status ? <p className="text-xs text-slate-400">{status}</p> : null}
        {healthLabel ? <p className={`text-xs ${health?.ok ? 'text-emerald-300' : 'text-rose-300'}`}>{healthLabel}</p> : null}
      </div>

      <div className="rounded-xl border border-slate-700 bg-[#0f172a] p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Stored Files</h2>
          <p className="text-xs text-slate-400">{assets.length} item(s)</p>
        </div>

        {!hasAssets && !loading ? (
          <p className="text-sm text-slate-400">No files found for this folder.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-700">
                  <th className="py-2 pr-4">Preview</th>
                  <th className="py-2 pr-4">Path</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Size</th>
                  <th className="py-2 pr-4">Uploaded</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => {
                  const isImage = (asset.contentType || '').startsWith('image/');
                  return (
                    <tr key={asset.id} className="border-b border-slate-800 align-top">
                      <td className="py-3 pr-4">
                        {isImage ? (
                          <img
                            src={asset.url}
                            alt={asset.pathname}
                            className="h-16 w-24 rounded-md border border-slate-700 object-cover"
                          />
                        ) : (
                          <div className="h-16 w-24 rounded-md border border-slate-700 bg-slate-900/60 grid place-items-center text-xs text-slate-500">
                            File
                          </div>
                        )}
                      </td>
                      <td className="py-3 pr-4 min-w-[280px]">
                        <p className="text-slate-200 break-all">{asset.pathname}</p>
                        <a
                          href={asset.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-cyan-300 hover:text-cyan-200 break-all"
                        >
                          {asset.url}
                        </a>
                      </td>
                      <td className="py-3 pr-4 text-slate-300">{asset.contentType || 'unknown'}</td>
                      <td className="py-3 pr-4 text-slate-300">{formatSize(asset.size)}</td>
                      <td className="py-3 pr-4 text-slate-300">{new Date(asset.createdAt).toLocaleString()}</td>
                      <td className="py-3">
                        <button
                          type="button"
                          onClick={() => void deleteAsset(asset)}
                          className="px-3 py-1.5 rounded-md border border-rose-700/70 text-rose-300 text-xs hover:bg-rose-900/20"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}