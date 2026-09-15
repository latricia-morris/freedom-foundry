import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Download, File, Folder, FolderOpen, RefreshCw, Search } from 'lucide-react';
import apiClient from '@/api/client';

function formatBytes(value) {
  if (!Number.isFinite(value) || value <= 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / (1024 ** index)).toFixed(index ? 1 : 0)} ${units[index]}`;
}

export default function DriveFiles() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  const load = async (folderId) => {
    setLoading(true); setError(''); setData(null);
    try {
      setData(await apiClient.driveFiles.browse({ profileId: data?.profile_id, folderId }));
    } catch (requestError) {
      setError(requestError.message || 'Client files could not be loaded.');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const files = useMemo(() => {
    const term = filter.trim().toLowerCase();
    return term ? (data?.files || []).filter((file) => file.name.toLowerCase().includes(term)) : data?.files || [];
  }, [data, filter]);

  return (
    <div className="max-w-5xl animate-fade-in text-foreground">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Brand Portal</span>
          <h1 className="mt-1 font-heading text-3xl font-light">Client <span className="molten-text italic">Files</span></h1>
          <p className="mt-1 text-sm text-muted-foreground">Browse and download the latest files shared with your corporate brand.</p>
        </div>
        <button type="button" onClick={() => load(data?.current_folder?.id)} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</button>
      </div>

      {error ? <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/10 p-8 text-center"><p className="text-sm text-destructive">{error}</p><button type="button" onClick={() => load()} className="mt-3 rounded-lg border border-destructive/30 px-3 py-2 text-sm text-destructive">Try again</button></div>
      : loading && !data ? <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" /></div> : !data?.root ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center"><FolderOpen className="mx-auto h-10 w-10 text-muted-foreground" /><h2 className="mt-4 font-heading text-2xl">No client folder assigned</h2><p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Your brand administrator has not assigned a Google Drive folder to this account yet.</p></div>
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
            <nav aria-label="Folder breadcrumbs" className="flex min-w-0 flex-wrap items-center gap-1 text-sm">
              {(data.breadcrumbs || []).map((crumb, index) => <React.Fragment key={crumb.id}><button type="button" onClick={() => load(crumb.id)} className={`max-w-48 truncate rounded-md px-2 py-1 ${index === data.breadcrumbs.length - 1 ? 'font-medium text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}>{crumb.name}</button>{index < data.breadcrumbs.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}</React.Fragment>)}
            </nav>
            <label className="flex min-w-0 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 sm:w-64"><Search className="h-4 w-4 shrink-0 text-muted-foreground" /><span className="sr-only">Filter this folder</span><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter this folder" className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" /></label>
          </div>
          {data.incomplete && <p className="mb-3 text-xs text-muted-foreground">This folder contains more than 1,000 items. Showing the first 1,000.</p>}
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {files.length ? files.map((item, index) => (
              <div key={item.id} className={`flex min-h-16 items-center gap-3 px-4 py-3 sm:px-5 ${index ? 'border-t border-border' : ''}`}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">{item.is_folder ? <Folder className="h-5 w-5 text-primary" /> : <File className="h-5 w-5 text-muted-foreground" />}</div>
                <button type="button" disabled={!item.is_folder} onClick={() => item.is_folder && load(item.id)} className={`min-w-0 flex-1 text-left ${item.is_folder ? 'cursor-pointer' : 'cursor-default'}`}>
                  <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.is_folder ? 'Folder' : formatBytes(item.size) || 'Google file'}{item.modified_time ? ` · Updated ${new Date(item.modified_time).toLocaleDateString()}` : ''}</p>
                </button>
                {item.is_folder ? <ChevronRight className="h-4 w-4 text-muted-foreground" /> : <a href={apiClient.driveFiles.downloadUrl(data.profile_id, item.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label={`Download ${item.name}`}><Download className="h-4 w-4" /></a>}
              </div>
            )) : <div className="p-10 text-center text-sm text-muted-foreground">{filter ? 'No files match this filter.' : 'This folder is empty.'}</div>}
          </div>
        </>
      )}
    </div>
  );
}