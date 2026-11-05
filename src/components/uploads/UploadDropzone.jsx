import React, { useRef, useState } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';

const MAX_MB = 50;
const fmt = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

/** Pick files (click or drag), review the list, then send them all at once. */
export default function UploadDropzone({ onUpload, busy, progress }) {
  const input = useRef(null);
  const [files, setFiles] = useState([]);
  const [note, setNote] = useState('');
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState('');

  const add = (list) => {
    const next = Array.from(list || []);
    const tooBig = next.filter((f) => f.size > MAX_MB * 1048576);
    setError(tooBig.length ? `${tooBig.map((f) => f.name).join(', ')} ${tooBig.length > 1 ? 'are' : 'is'} over ${MAX_MB} MB.` : '');
    setFiles((prev) => [...prev, ...next.filter((f) => f.size <= MAX_MB * 1048576)]);
  };

  const submit = async () => {
    setError('');
    try {
      await onUpload(files, note.trim());
      setFiles([]); setNote('');
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Upload failed. Please try again.');
    }
  };

  return (
    <div className="dashboard-card p-6 sm:p-8">
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }}
        disabled={busy}
        className={`forged-well flex w-full cursor-pointer flex-col items-center justify-center gap-3 px-6 py-12 text-center transition-colors duration-200 ${drag ? 'border-primary' : 'hover:border-primary/50'}`}
      >
        <UploadCloud className="h-9 w-9 text-primary" strokeWidth={1.25} />
        <span className="font-heading text-2xl font-light text-foreground">Drop files here or browse</span>
        <span className="text-xs text-muted-foreground">Logos, photos, documents, decks, fonts · up to {MAX_MB} MB each</span>
      </button>
      <input ref={input} type="file" multiple className="hidden" onChange={(e) => { add(e.target.files); e.target.value = ''; }} />

      {files.length > 0 && (
        <ul className="mt-5 divide-y divide-border/50 border border-border/60">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center gap-3 px-4 py-2.5">
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">{f.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{fmt(f.size)}</span>
              <button type="button" disabled={busy} onClick={() => setFiles((p) => p.filter((_, j) => j !== i))} aria-label={`Remove ${f.name}`} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <label className="mt-5 block">
        <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">Note for the team (optional)</span>
        <textarea className="admin-input min-h-20 text-sm" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. These are our current logos and last year’s event photos." disabled={busy} />
      </label>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">{busy && progress ? progress : `${files.length} file${files.length === 1 ? '' : 's'} selected`}</span>
        <button type="button" onClick={submit} disabled={busy || !files.length} className="btn-forge inline-flex min-h-11 items-center gap-2 rounded-md px-5 py-2.5 text-xs font-semibold uppercase tracking-widest disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
          {busy ? 'Uploading…' : 'Send Files'}
        </button>
      </div>
    </div>
  );
}