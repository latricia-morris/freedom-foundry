import React, { useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { STATUS_LABELS } from '@/lib/learn';

export const LABEL = 'mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground';
export const GHOST = 'inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground';

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className={LABEL}>{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function StatusSelect({ value, onChange }) {
  return (
    <select aria-label="Status" className="admin-input" value={value || 'draft'} onChange={(e) => onChange(e.target.value)}>
      {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
    </select>
  );
}

/** Uploads one file. Public files get a permanent link (images); private files stay behind member access. */
export function UploadButton({ label = 'Upload', accept, isPublic = false, onUploaded }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      if (isPublic) {
        const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
        onUploaded({ file_url, file_name: file.name });
      } else {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        onUploaded({ file_uri, file_name: file.name });
      }
    } catch (err) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <label className={`${GHOST} cursor-pointer`}>
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} {busy ? 'Uploading…' : label}
      <input type="file" accept={accept} className="hidden" onChange={pick} disabled={busy} />
    </label>
  );
}