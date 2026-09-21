import React, { useRef, useState } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { ASSET_TYPES, parseAssetFilename } from '@/lib/portfolioData';

/** Portfolio asset type → client asset library file type. */
const BRAND_ASSET_TYPE = {
  logo_primary: 'logo', logo_alternate: 'logo', logo_variations: 'logo',
  business_cards: 'print_collateral', letterhead: 'print_collateral', brochures: 'print_collateral',
  pamphlets: 'print_collateral', sell_sheets: 'print_collateral', flyers: 'print_collateral',
  signage: 'print_collateral', environmental: 'print_collateral', packaging: 'print_collateral',
  labels: 'print_collateral', event_materials: 'print_collateral',
  web_screenshot: 'digital_asset', web_mobile: 'digital_asset', ux_ui: 'design_asset',
  wireframes: 'design_asset', social_templates: 'digital_asset', social_graphics: 'digital_asset',
  ad_creative: 'digital_asset', email_templates: 'digital_asset', digital_ads: 'digital_asset',
  campaign_visuals: 'digital_asset', photography: 'design_asset', video: 'digital_asset',
  brand_guidelines: 'deliverable', decks: 'deliverable', reports: 'deliverable',
  custom_documents: 'deliverable',
};

/**
 * Bulk asset upload with filename-convention parsing.
 * Filename convention: client-project-asset-type-description-01.ext
 * Every suggestion is reviewed and confirmed here before anything is saved.
 */
export default function BulkAssetUpload({ projectId, clientUserId, onDone }) {
  const fileRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);
  const [bulkType, setBulkType] = useState('other');
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
        isPublic: true,
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
      if (clientUserId) {
        const syncable = records.filter((r) => r.file_url);
        if (syncable.length) {
          await base44.entities.BrandAsset.bulkCreate(syncable.map((r) => ({
            user_id: clientUserId,
            title: r.title,
            description: r.description,
            file_url: r.file_url,
            file_type: BRAND_ASSET_TYPE[r.asset_type] || 'other',
            uploaded_by: 'Portfolio intake',
          })));
        }
      }
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
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-border/70 bg-background/40 p-3">
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground">Set one category for all rows</span>
            <select
              value={bulkType}
              onChange={(e) => setBulkType(e.target.value)}
              aria-label="Category for all rows"
              className="admin-input w-auto py-1.5 text-sm"
            >
              {ASSET_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <button
              type="button"
              onClick={() => setRows((prev) => prev.map((row) => ({ ...row, assetType: bulkType })))}
              className="rounded-md border border-border px-3 py-1.5 text-[11px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              Apply to all
            </button>
            <span className="text-[11px] text-muted-foreground/60">Then override any row individually below.</span>
          </div>
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