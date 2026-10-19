import React from 'react';
import { FolderOpen, RefreshCw } from 'lucide-react';

export default function FolderBrowserHeader({ name, loading, onRefresh, outside = false }) {
  const Heading = outside ? 'h2' : 'h3';
  return (
    <div className={outside ? 'mb-4 flex items-center justify-between gap-3' : 'flex items-center justify-between gap-3 border-b border-border px-5 py-4'}>
      <div className="flex min-w-0 items-center gap-2.5">
        <FolderOpen className="icon-warm h-4 w-4 shrink-0" strokeWidth={1.5} />
        <Heading className={outside ? 'font-heading text-xl text-foreground break-words' : 'font-heading text-lg text-foreground break-words'}>{name}</Heading>
      </div>
      <button type="button" onClick={onRefresh} disabled={loading} className="inline-flex shrink-0 items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60">
        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
      </button>
    </div>
  );
}