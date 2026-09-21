import React, { useRef, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import { parseAssetFilename } from '@/lib/portfolioData';

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif)$/i;

/** Featured image picker: choose from uploaded public assets or upload directly. */
export default function FeaturedImageCard({ form, assets, onChange }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const candidates = (assets || []).filter((a) => a.is_public && a.file_url && IMAGE_EXT.test(a.file_url));
  const current = form.featured_image_url || '';

  const uploadDirect = async (file) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const uploaded = await base44.integrations.Core.UploadPublicFile({ file });
      const url = uploaded?.file_url || '';
      if (url) {
        onChange({
          featured_image_url: url,
          featured_image_alt: form.featured_image_alt || parseAssetFilename(file.name).title,
        });
      }
    } catch (e) {
      setError(e.message || 'The upload failed.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="dashboard-card space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-heading text-2xl text-foreground">Featured image</h3>
          <p className="text-xs text-muted-foreground/70">
            Powers the portfolio card, the case-study hero, and the share image.
          </p>
        </div>
        <label className="btn-forge inline-flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest">
          <UploadCloud className="h-4 w-4" /> {busy ? 'Uploading…' : 'Upload'}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => uploadDirect(e.target.files?.[0])}
          />
        </label>
      </div>

      {current && (
        <div className="overflow-hidden rounded-md border border-border">
          <Image
            src={current}
            alt={form.featured_image_alt || form.title || 'Featured image'}
            fittingType="fill"
            className="aspect-[4/3] w-full"
          />
        </div>
      )}

      {candidates.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Choose from uploaded assets</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {candidates.map((asset) => {
              const active = asset.file_url === current;
              return (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => onChange({ featured_image_url: asset.file_url, featured_image_alt: asset.alt_text || asset.title })}
                  title={asset.title}
                  className={`h-14 w-14 overflow-hidden rounded-sm border transition-colors ${
                    active ? 'border-primary' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Image src={asset.file_url} alt={asset.alt_text || asset.title} fittingType="fill" className="h-14 w-14" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      <label className="block">
        <span className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">Featured image alt text</span>
        <input
          className="admin-input"
          value={form.featured_image_alt || ''}
          onChange={(e) => onChange({ featured_image_alt: e.target.value })}
          placeholder="Describe what is visibly shown"
        />
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}