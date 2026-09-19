import React, { useRef, useState } from 'react';
import { FileText, Loader2, UploadCloud, X } from 'lucide-react';
import apiClient from '@/api/client';
import { guessFileType, parseClientFiles } from '@/lib/clientImport';

export default function ImportUploadStep({ client, onParsed, onError }) {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState('');

  const addFiles = (list) => {
    setFiles((previous) => {
      const next = [...previous];
      for (const file of list) {
        if (!next.some((f) => f.name === file.name && f.size === file.size)) next.push(file);
      }
      return next;
    });
  };

  const removeFile = (index) => setFiles((previous) => previous.filter((_, i) => i !== index));

  const run = async () => {
    if (!files.length || status === 'uploading' || status === 'parsing') return;
    setStatus('uploading');
    try {
      const uploaded = [];
      for (let i = 0; i < files.length; i++) {
        setProgress(`Uploading ${i + 1} of ${files.length} — ${files[i].name}`);
        const res = await apiClient.integrations.Core.UploadPublicFile({ file: files[i] });
        const url = res?.file_url || res?.url;
        if (!url) throw new Error(`${files[i].name} could not be uploaded.`);
        uploaded.push({ name: files[i].name, url });
      }
      setStatus('parsing');
      const label = `${client.first_name || ''} ${client.last_name || ''} ${client.email || ''}`.trim();
      setProgress('Analyzing the brand files and mapping content...');
      const draft = await parseClientFiles(uploaded.map((f) => f.url), label);
      const assets = uploaded.map((f) => ({
        title: f.name,
        file_url: f.url,
        file_type: guessFileType(f.name),
        description: '',
      }));
      setStatus('idle');
      setProgress('');
      onParsed(draft, uploaded, assets);
    } catch (error) {
      setStatus('idle');
      setProgress('');
      onError(error?.message || 'The files could not be analyzed. Please try again.');
    }
  };

  const busy = status === 'uploading' || status === 'parsing';

  return (
    <div className="dashboard-card border border-border p-6">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="w-full flex flex-col items-center gap-3 rounded-xl border border-dashed border-border hover:border-primary/50 transition-colors px-6 py-10 disabled:opacity-60"
      >
        <UploadCloud className="w-9 h-9 text-primary" strokeWidth={1.2} />
        <span className="text-sm text-foreground font-medium">Upload the client's brand files</span>
        <span className="text-xs text-muted-foreground text-center max-w-md">
          Brand guidelines, bios, strategy documents, font and color notes — PDFs, docs, images, and text files all work.
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.md,.rtf,.png,.jpg,.jpeg,.svg,.webp,.gif,.ppt,.pptx,.csv,.json"
        onChange={(event) => {
          addFiles(event.target.files || []);
          event.target.value = '';
        }}
      />

      {files.length > 0 && (
        <ul className="mt-5 space-y-2">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className="flex items-center gap-3 rounded-lg border border-border bg-background/40 px-3 py-2.5">
              <FileText className="w-4 h-4 text-primary shrink-0" strokeWidth={1.5} />
              <span className="flex-1 min-w-0 text-sm text-foreground truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                disabled={busy}
                className="text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs text-muted-foreground">
          {files.length} {files.length === 1 ? 'file' : 'files'} ready
        </p>
        <button
          type="button"
          onClick={run}
          disabled={!files.length || busy}
          className="btn-forge inline-flex items-center gap-2 rounded-md px-6 py-3 text-xs uppercase tracking-widest disabled:opacity-50"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
          {status === 'uploading' ? 'Uploading' : status === 'parsing' ? 'Analyzing' : 'Upload & Parse'}
        </button>
      </div>

      {busy && progress && (
        <p className="mt-3 text-xs text-muted-foreground animate-pulse">{progress}</p>
      )}
    </div>
  );
}