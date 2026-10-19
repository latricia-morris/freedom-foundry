import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { Image } from '@/components/ui/image';

const MAX_IMAGES = 25;

export default function BoardDetail({ board, onBack, onChange }) {
  const [urls, setUrls] = useState({});
  const [uploading, setUploading] = useState(false);
  const images = board.images || [];
  const remaining = MAX_IMAGES - images.length;

  useEffect(() => {
    let active = true;
    setUrls({});
    (async () => {
      const next = {};
      for (const img of images) {
        if (!img?.file_uri) continue;
        try {
          const res = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: img.file_uri });
          next[img.file_uri] = res.signed_url;
        } catch {
          next[img.file_uri] = null;
        }
      }
      if (active) setUrls(next);
    })();
    return () => { active = false; };
  }, [board.id, images.length]);

  const handleUpload = async (fileList) => {
    const files = [...fileList].slice(0, remaining);
    if (!files.length || uploading) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const res = await base44.integrations.Core.UploadPrivateFile({ file });
        if (res.file_uri) uploaded.push({ file_uri: res.file_uri, name: file.name });
      }
      if (uploaded.length) {
        const next = [...images, ...uploaded];
        await base44.entities.BrainHubItem.update(board.id, { images: next });
        onChange({ ...board, images: next });
      }
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (img) => {
    const next = images.filter((i) => i.file_uri !== img.file_uri);
    await base44.entities.BrainHubItem.update(board.id, { images: next });
    onChange({ ...board, images: next });
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> All boards
        </button>
        <h2 className="font-heading text-2xl text-foreground">{board.title}</h2>
        <span className="text-xs text-muted-foreground">{images.length} of {MAX_IMAGES} images</span>
        <label
          className={`ml-auto inline-flex items-center gap-2 rounded-sm px-4 py-2.5 text-sm font-semibold transition-opacity ${
            remaining > 0
              ? 'btn-forge cursor-pointer'
              : 'pointer-events-none border border-border text-muted-foreground opacity-60'
          }`}
        >
          {uploading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Uploading&hellip;</>
          ) : (
            <><ImagePlus className="h-4 w-4" strokeWidth={1.5} /> Add images</>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading || remaining <= 0}
            onChange={(e) => { handleUpload(e.target.files); e.target.value = ''; }}
          />
        </label>
      </div>

      {remaining <= 0 && (
        <p className="mb-4 text-xs text-muted-foreground">This board is full. Remove an image to add another.</p>
      )}

      {images.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">No images yet. Add up to {MAX_IMAGES}.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <div key={img.file_uri} className="group relative overflow-hidden rounded-xl border border-border bg-card">
              {urls[img.file_uri] ? (
                <Image src={urls[img.file_uri]} alt={img.name || board.title} className="aspect-square w-full" />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
              <button
                type="button"
                onClick={() => removeImage(img)}
                aria-label="Remove image"
                className="absolute right-2 top-2 rounded-lg bg-black/60 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/80 focus:opacity-100 group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}