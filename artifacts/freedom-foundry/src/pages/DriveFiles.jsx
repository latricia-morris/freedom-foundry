import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Download, File, Folder, FolderOpen, RefreshCw, Search, Eye } from 'lucide-react';
import { useAuth } from '@clerk/react';
import { useDriveFiles } from '@/hooks/use-drive-delivery';
import { ClientDriveReviewModal } from '@/components/delivery/ClientDriveReviewModal';
import apiClient from '@/api/client';

function formatBytes(value) {
  if (!Number.isFinite(value) || value <= 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return `${(value / (1024 ** index)).toFixed(index ? 1 : 0)} ${units[index]}`;
}

export default function DriveFiles() {
  const [profileId, setProfileId] = useState(null);
  const [folderId, setFolderId] = useState(null);
  const [filter, setFilter] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [memberRole, setMemberRole] = useState('user');

  // We need the profile ID first. We fetch it via auth me.
  useEffect(() => {
    apiClient.auth.me().then(me => {
      // In a real app this might come from route params or context.
      // Assuming for now the corporate brand profile is attached to the user or accessible.
      // Fallback to fetching the first corporate profile if needed.
      apiClient.entities.CorporateBrandProfile.list().then(profiles => {
        if (profiles.length > 0) {
          setProfileId(profiles[0].id);
          // check role
          const member = profiles[0].account_members?.find(m => m.email === me.email);
          if (member) setMemberRole(member.role);
          if (profiles[0].owner_id === me.id) setMemberRole('owner');
        } else {
            // handle no profile error
            setProfileId(-1); // dummy to stop loading
        }
      }).catch(() => setProfileId(-1));
    });
  }, []);

  const { data, isLoading, isError, error, refetch } = useDriveFiles(profileId > 0 ? profileId : null, folderId);

  const loading = isLoading || profileId === null;
  const loadError = isError ? error.message : (profileId === -1 ? 'No corporate brand profile found.' : '');

  const files = useMemo(() => {
    const term = filter.trim().toLowerCase();
    return term ? (data?.files || []).filter((file) => file.name.toLowerCase().includes(term)) : data?.files || [];
  }, [data, filter]);

  return (
    <div className="max-w-5xl animate-fade-in text-foreground relative z-0">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 relative z-10">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Brand Portal</span>
          <h1 className="mt-1 font-heading text-3xl font-light">Client <span className="molten-text italic">Files</span></h1>
          <p className="mt-1 text-sm text-muted-foreground">Review drafts and download released assets from your corporate brand.</p>
        </div>
        <button type="button" onClick={() => refetch()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</button>
      </div>

      {loadError ? <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/10 p-8 text-center"><p className="text-sm text-destructive">{loadError}</p><button type="button" onClick={() => refetch()} className="mt-3 rounded-lg border border-destructive/30 px-3 py-2 text-sm text-destructive">Try again</button></div>
      : loading && !data ? <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" /></div> : !data?.root ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center"><FolderOpen className="mx-auto h-10 w-10 text-muted-foreground" /><h2 className="mt-4 font-heading text-2xl">No client folder assigned</h2><p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Your agency has not assigned a delivery folder to this account yet.</p></div>
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between relative z-10">
            <nav aria-label="Folder breadcrumbs" className="flex min-w-0 flex-wrap items-center gap-1 text-sm">
              {(data.breadcrumbs || []).map((crumb, index) => <React.Fragment key={crumb.id}><button type="button" onClick={() => setFolderId(crumb.id)} className={`max-w-48 truncate rounded-md px-2 py-1 ${index === data.breadcrumbs.length - 1 ? 'font-medium text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}>{crumb.name}</button>{index < data.breadcrumbs.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}</React.Fragment>)}
            </nav>
            <label className="flex min-w-0 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 sm:w-64"><Search className="h-4 w-4 shrink-0 text-muted-foreground" /><span className="sr-only">Filter this folder</span><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter this folder" className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" /></label>
          </div>
          {data.incomplete && <p className="mb-3 text-xs text-muted-foreground">This folder contains more than 1,000 items. Showing the first 1,000.</p>}
          <div className="overflow-hidden rounded-2xl border border-border bg-card relative z-0">
            {files.length ? files.map((item, index) => (
              <div key={item.id} className={`flex min-h-16 items-center gap-3 px-4 py-3 sm:px-5 ${index ? 'border-t border-border' : ''}`}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                  {item.is_folder ? <Folder className="h-5 w-5 text-primary" /> : <File className="h-5 w-5 text-muted-foreground" />}
                </div>
                
                <button 
                  type="button" 
                  disabled={!item.is_folder && item.visibility !== 'review' && item.visibility !== 'released'} 
                  onClick={() => {
                    if (item.is_folder) {
                      setFolderId(item.id);
                    } else if (item.visibility === 'review' || item.visibility === 'released') {
                      setSelectedFile(item);
                    }
                  }} 
                  className={`min-w-0 flex-1 text-left ${item.is_folder || item.visibility === 'review' || item.visibility === 'released' ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                >
                  <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    {!item.is_folder && item.visibility && (
                      <span className={`inline-flex rounded-sm px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider ${
                        item.visibility === 'released' ? 'bg-emerald-500/10 text-emerald-500' : 
                        item.visibility === 'review' ? 'bg-amber-500/10 text-amber-500' : 
                        'bg-muted text-muted-foreground'
                      }`}>
                        {item.visibility}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {item.is_folder ? 'Folder' : formatBytes(item.size) || 'Google file'}
                      {item.modified_time ? ` · Updated ${new Date(item.modified_time).toLocaleDateString()}` : ''}
                    </span>
                  </div>
                </button>
                
                <div className="flex items-center gap-2 shrink-0">
                  {item.is_folder ? (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <>
                      {(item.visibility === 'review' || item.visibility === 'released') && (
                         <button 
                           onClick={() => setSelectedFile(item)}
                           className="rounded-lg p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors" 
                           title="Review Asset"
                         >
                           <Eye className="h-4 w-4" />
                         </button>
                      )}
                      
                      {item.visibility === 'released' && (
                        <a 
                          href={apiClient.driveFiles.downloadUrl(profileId, item.id)} 
                          className="rounded-lg p-2 text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors" 
                          title={`Download ${item.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>
            )) : <div className="p-10 text-center text-sm text-muted-foreground">{filter ? 'No files match this filter.' : 'This folder is empty.'}</div>}
          </div>
        </>
      )}

      {selectedFile && (
        <ClientDriveReviewModal
          isOpen={!!selectedFile}
          onClose={() => setSelectedFile(null)}
          file={selectedFile}
          profileId={profileId}
          currentFolderId={folderId}
          role={memberRole}
        />
      )}
    </div>
  );
}