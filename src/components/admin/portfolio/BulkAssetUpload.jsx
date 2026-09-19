import React, { useRef, useState } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { ASSET_TYPES, parseAssetFilename } from '@/lib/portfolioData';

/**
 * Bulk asset upload with filename-convention parsing.
 * Filename convention: client-project-asset-type-description-01.ext
 * Every suggestion is reviewed and confirmed here before anything is saved.
 */
export default function BulkAssetUpload({ projectId, onDone }) {
  const fileRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const addFiles = (files) => {
    const parsed = [...files].map((file, index) => {
      const suggestion = parseAssetFilename(file.name);
      return {
        file,
        originalFilename: suggestion.originalFilename,
        title: suggestion.title,
        assetType: suggestion.assetType,
        sortHint: suggestion.sortHint ?? index + 1,
        isPublic: false,
        allowDownload: false,
        altText: '',
        description: '',
      };
    });
    setRows((prev) => [...prev, ...parsed]);
    if (fileRef.current) fileRef.current.value = '';
  };

  const patchRow = (index, patch) => setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  const removeRow = (index) => setRows((prev) => prev.filter((_, i) => i !== index));

  const saveAll = async () => {
    if (!rows.length) return;
    setBusy(true);
    setError('');
    try {
      const records = [];
      for (const row of rows) {
        let file_url = '';
        let file_uri = '';
        if (row.isPublic) {
          const uploaded = await base44.integrations.Core.UploadPublicFile({ file: row.file });
          file_url = uploaded?.file_url || '';
        } else {
          const uploaded = await base44.integrations.Core.UploadPrivateFile({ file: row.file });
          file_uri = uploaded?.file_uri || '';
        }
        records.push({
          project_id: projectId,
          title: row.title || row.originalFilename,
          description: row.description,
          asset_type: row.assetType,
          file_url,
          file_uri,
          is_public: row.isPublic,
          allow_download: row.allowDownload,
          alt_text: row.altText,
          sort_order: Number(row.sortHint) || 0,
          original_filename: row.originalFilename,
        });
      }
      await base44.entities.PortfolioAsset.bulkCreate(records);
      setRows([]);
      onDone?.();
    } catch (e) {
      setError(e.message || 'The bulk upload failed. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-md border border-border bg-background/40 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Bulk upload</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground/80">
            Filename convention <code className="text-primary/90">client-project-asset-type-description-01.ext</code> —
            e.g. <code className="text-primary/90">acme-rebrand-logo-primary-color-01.png</code>. Filenames are parsed
            into suggestions only; nothing is saved until you review every row below.
          </p>
        </div>
        <label className="btn-forge inline-flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest">
          <UploadCloud className="h-4 w-4" /> Select files
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files || [])}
          />
        </label>
      </div>

      {rows.length > 0 && (
        <div className="mt-5 space-y-3">
          {rows.map((row, index) => (
            <div key={`${row.originalFilename}-${index}`} className="rounded-md border border-border/70 bg-card/40 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-xs text-muted-foreground/80">{row.originalFilename}</p>
                <button type="button" onClick={() => removeRow(index)} className="text-muted-foreground/60 hover:text-destructive" aria-label="Remove file">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label className="block">
                  <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Title</span>
                  <input className="admin-input py-1.5 text-sm" value={row.title} onChange={(e) => patchRow(index, { title: e.target.value })} />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Asset type</span>
                  <select className="admin-input py-1.5 text-sm" value={row.assetType} onChange={(e) => patchRow(index, { assetType: e.target.value })}>
                    {ASSET_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Alt text</span>
                  <input className="admin-input py-1.5 text-sm" value={row.altText} onChange={(e) => patchRow(index, { altText: e.target.value })} placeholder="Describe what is visibly shown" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Display order</span>
                  <input type="number" className="admin-input py-1.5 text-sm" value={row.sortHint} onChange={(e) => patchRow(index, { sortHint: e.target.value })} />
                </label>
                <div className="flex items-end gap-4 text-xs text-foreground">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 accent-[#d9622c]" checked={row.isPublic} onChange={(e) => patchRow(index, { isPublic: e.target.checked })} />
                    Public
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="h-4 w-4 accent-[#d9622c]" checked={row.allowDownload} onChange={(e) => patchRow(index, { allowDownload: e.target.checked })} />
                    Downloadable
                  </label>
                </div>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-xs text-muted-foreground/70">Private files use protected storage and never appear on the public site.</p>
            <button
              type="button"
              onClick={saveAll}
              disabled={busy}
              className="btn-forge shrink-0 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest disabled:opacity-50"
            >
              {busy ? 'Saving…' : `Save ${rows.length} asset${rows.length === 1 ? '' : 's'}`}
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </div>
  );
}