import React, { useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Lock, Plus, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import BulkAssetUpload from '@/components/admin/portfolio/BulkAssetUpload';
import FeaturedImageCard from '@/components/admin/portfolio/FeaturedImageCard';
import BeforeAfterPairing from '@/components/admin/portfolio/BeforeAfterPairing';
import ClientSyncCard from '@/components/admin/portfolio/ClientSyncCard';
import { ASSET_TYPES, ASSET_TYPE_LABELS, parseAssetFilename } from '@/lib/portfolioData';

export default function PortfolioAssetManager({ project, assets, onReload, onChange }) {
  const projectId = project?.id;
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [draft, setDraft] = useState(null);

  const sorted = [...(assets || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const startUpload = () => {
    setDraft({
      title: '', asset_type: 'featured_image', description: '', alt_text: '',
      is_public: true, allow_download: false, sort_order: (sorted.length || 0) + 1,
    });
  };

  const onFileChosen = (file) => {
    if (!file) return;
    const suggestion = parseAssetFilename(file.name);
    setDraft((prev) => ({
      ...prev,
      file,
      title: prev.title || suggestion.title,
      asset_type: suggestion.assetType,
      originalFilename: suggestion.originalFilename,
      sortHint: suggestion.sortHint,
    }));
  };

  const uploadOne = async () => {
    if (!draft?.file || !projectId) return;
    setBusy(true);
    setError('');
    try {
      let file_url = '';
      let file_uri = '';
      if (draft.is_public) {
        const uploaded = await base44.integrations.Core.UploadPublicFile({ file: draft.file });
        file_url = uploaded?.file_url || '';
      } else {
        const uploaded = await base44.integrations.Core.UploadPrivateFile({ file: draft.file });
        file_uri = uploaded?.file_uri || '';
      }
      await base44.entities.PortfolioAsset.create({
        project_id: projectId,
        title: draft.title || draft.originalFilename || 'Brand asset',
        description: draft.description || '',
        asset_type: draft.asset_type,
        file_url,
        file_uri,
        is_public: draft.is_public,
        allow_download: draft.allow_download,
        alt_text: draft.alt_text || '',
        sort_order: Number(draft.sortHint || draft.sort_order) || 0,
        original_filename: draft.originalFilename || '',
      });
      setDraft(null);
      if (fileRef.current) fileRef.current.value = '';
      onReload?.();
    } catch (e) {
      setError(e.message || 'Upload failed. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const patchAsset = async (asset, patch) => {
    await base44.entities.PortfolioAsset.update(asset.id, patch);
    onReload?.();
  };

  const removeAsset = async (asset) => {
    if (!window.confirm(`Delete "${asset.title}"? This cannot be undone.`)) return;
    await base44.entities.PortfolioAsset.delete(asset.id);
    onReload?.();
  };

  const moveAsset = async (asset, dir) => {
    const index = sorted.findIndex((a) => a.id === asset.id);
    const neighbor = dir === 'up' ? index - 1 : index + 1;
    if (neighbor < 0 || neighbor >= sorted.length) return;
    const next = [...sorted];
    const [moved] = next.splice(index, 1);
    next.splice(neighbor, 0, moved);
    await base44.entities.PortfolioAsset.bulkUpdate(next.map((a, i) => ({ id: a.id, sort_order: i + 1 })));
    onReload?.();
  };

  if (!projectId) {
    return (
      <div className="dashboard-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Save the project first — then upload and organize its assets here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FeaturedImageCard form={project} assets={assets} onChange={onChange} />
      <BulkAssetUpload projectId={projectId} clientUserId={project.client_user_id} onDone={onReload} />
      <ClientSyncCard project={project} onChange={onChange} />

      <div className="dashboard-card space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-heading text-2xl text-foreground">Assets</h3>
            <p className="text-xs text-muted-foreground/70">{sorted.length} total · new assets save as public, non-downloadable by default</p>
          </div>
          <button type="button" onClick={startUpload} className="btn-forge inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest">
            <Plus className="h-4 w-4" /> Upload asset
          </button>
        </div>

        {draft && (
          <div className="space-y-3 rounded-md border border-primary/30 bg-primary/5 p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">File</span>
                <input ref={fileRef} type="file" className="admin-input py-1.5 text-sm" onChange={(e) => onFileChosen(e.target.files?.[0])} />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Title</span>
                <input className="admin-input py-1.5 text-sm" value={draft.title || ''} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Asset type</span>
                <select className="admin-input py-1.5 text-sm" value={draft.asset_type} onChange={(e) => setDraft({ ...draft, asset_type: e.target.value })}>
                  {ASSET_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Alt text</span>
                <input className="admin-input py-1.5 text-sm" value={draft.alt_text || ''} onChange={(e) => setDraft({ ...draft, alt_text: e.target.value })} placeholder="Describe what is visibly shown" />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Display order</span>
                <input type="number" className="admin-input py-1.5 text-sm" value={draft.sortHint || draft.sort_order} onChange={(e) => setDraft({ ...draft, sortHint: e.target.value })} />
              </label>
              <div className="flex items-end gap-4 text-xs text-foreground">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 accent-[#d9622c]" checked={draft.is_public} onChange={(e) => setDraft({ ...draft, is_public: e.target.checked })} />
                  Public
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 accent-[#d9622c]" checked={draft.allow_download} onChange={(e) => setDraft({ ...draft, allow_download: e.target.checked })} />
                  Downloadable
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDraft(null)} className="rounded-md border border-border px-3 py-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">Cancel</button>
              <button type="button" onClick={uploadOne} disabled={busy || !draft.file} className="btn-forge rounded-md px-4 py-1.5 text-xs font-semibold uppercase tracking-widest disabled:opacity-50">
                {busy ? 'Uploading…' : 'Upload'}
              </button>
            </div>
          </div>
        )}

        {sorted.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No assets yet. Upload the featured image first — it powers the portfolio card.</p>
        ) : (
          <div className="divide-y divide-border/50">
            {sorted.map((asset) => (
              <div key={asset.id} className="py-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="h-12 w-12 shrink-0 overflow-hidden rounded-sm border border-border bg-background">
                    {asset.file_url ? (
                      <Image src={asset.file_url} alt={asset.alt_text || asset.title} fittingType="fill" className="h-12 w-12" />
                    ) : (
                      <span className="flex h-12 w-12 items-center justify-center"><Lock className="h-4 w-4 text-muted-foreground/60" /></span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{asset.title}</p>
                    <p className="truncate text-xs text-muted-foreground/70">
                      {ASSET_TYPE_LABELS[asset.asset_type] || asset.asset_type} · {asset.is_public ? 'Public' : 'Private'}
                      {asset.allow_download ? ' · downloadable' : ''}
                      {asset.file_uri && !asset.file_url ? ' · protected storage' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => moveAsset(asset, 'up')} className="rounded-sm p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Move up"><ChevronUp className="h-4 w-4" /></button>
                    <button type="button" onClick={() => moveAsset(asset, 'down')} className="rounded-sm p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Move down"><ChevronDown className="h-4 w-4" /></button>
                    <button type="button" onClick={() => setExpanded(expanded === asset.id ? null : asset.id)} className="rounded-sm px-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
                      {expanded === asset.id ? 'Close' : 'Edit'}
                    </button>
                    <button type="button" onClick={() => removeAsset(asset)} className="rounded-sm p-1.5 text-muted-foreground hover:text-destructive" aria-label="Delete asset"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>

                {expanded === asset.id && (
                  <div className="mt-3 grid gap-3 rounded-md border border-border/70 bg-background/40 p-3 sm:grid-cols-2 lg:grid-cols-3">
                    <label className="block">
                      <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Title</span>
                      <input className="admin-input py-1.5 text-sm" defaultValue={asset.title} onBlur={(e) => patchAsset(asset, { title: e.target.value })} />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Asset type</span>
                      <select className="admin-input py-1.5 text-sm" defaultValue={asset.asset_type} onChange={(e) => patchAsset(asset, { asset_type: e.target.value })}>
                        {ASSET_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Alt text</span>
                      <input className="admin-input py-1.5 text-sm" defaultValue={asset.alt_text || ''} onBlur={(e) => patchAsset(asset, { alt_text: e.target.value })} />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Caption</span>
                      <input className="admin-input py-1.5 text-sm" defaultValue={asset.caption || ''} onBlur={(e) => patchAsset(asset, { caption: e.target.value })} />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Description</span>
                      <input className="admin-input py-1.5 text-sm" defaultValue={asset.description || ''} onBlur={(e) => patchAsset(asset, { description: e.target.value })} />
                    </label>
                    <div className="flex items-end gap-4 text-xs text-foreground">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="h-4 w-4 accent-[#d9622c]" defaultChecked={asset.is_public} onChange={(e) => patchAsset(asset, { is_public: e.target.checked })} />
                        Public
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="h-4 w-4 accent-[#d9622c]" defaultChecked={asset.allow_download} onChange={(e) => patchAsset(asset, { allow_download: e.target.checked })} />
                        Downloadable
                      </label>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <BeforeAfterPairing form={project} assets={assets} onChange={onChange} />
    </div>
  );
}