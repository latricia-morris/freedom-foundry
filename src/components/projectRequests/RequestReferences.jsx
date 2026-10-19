import React from 'react';
import { Paperclip, X } from 'lucide-react';
import { ACCEPT } from '@/components/projectRequests/useRequestFiles';

export default function RequestReferences({ uploads, link, onLink }) {
  return <section className="space-y-3" aria-labelledby="references-title">
    <h2 id="references-title" className="font-heading text-2xl">Add references</h2>
    <p className="text-sm text-muted-foreground">Upload up to two files and include a reference link if helpful. Neither is required.</p>
    <p id="file-help" className="text-xs text-muted-foreground">PDF, Word (.docx), PNG, JPG/JPEG, WebP, GIF, TXT, CSV. Up to 10 MB per file. Files are stored privately.</p>
    <div className="space-y-2" aria-live="polite">
      {uploads.files.map((file) => <div key={file.key} className="flex items-start gap-2 rounded-[7px] border border-border bg-input p-3">
        <Paperclip className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1"><p className="break-all text-sm">{file.name}</p><p className="text-xs text-muted-foreground">{file.status}</p></div>
        <button type="button" aria-label={`Remove ${file.name}`} disabled={uploads.uploading} onClick={() => uploads.remove(file.key)} className="shrink-0 rounded-[7px] p-2"><X className="h-4 w-4" /></button>
      </div>)}
    </div>
    <label className="block text-sm">Choose reference files<input aria-label="Choose reference files" aria-describedby="file-help" className="mt-2 block w-full min-w-0 rounded-[7px] border border-border bg-input p-3 text-sm file:mr-3 file:rounded-[7px] file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-secondary-foreground" type="file" accept={ACCEPT} multiple disabled={uploads.uploading} onChange={(e) => { const selected = [...e.target.files]; e.target.value = ''; uploads.add(selected); }} /></label>
    {uploads.error && <p role="alert" className="text-sm text-destructive">{uploads.error}</p>}
    <label className="block text-sm">Reference link<input id="reference-link" type="url" className="admin-input mt-2" value={link} onChange={(e) => onLink(e.target.value)} placeholder="https://" /></label>
  </section>;
}