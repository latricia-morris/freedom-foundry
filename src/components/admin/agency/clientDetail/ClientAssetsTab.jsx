import React, { useEffect, useState } from 'react';
import { ArrowLeft, Folder, FolderOpen } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import DriveBrowser from '@/components/portal/DriveBrowser';
import LinkDriveFolderCard from '@/components/admin/agency/clientDetail/LinkDriveFolderCard';
import { resolvePortalUser } from '@/lib/clientPortalData';

/** Every Google Drive folder tied to the client: linked folder, portal links, and project folders. */
export default function ClientAssetsTab({ client }) {
  const [roots, setRoots] = useState(null);
  const [openRoot, setOpenRoot] = useState(null);
  const [clientFolder, setClientFolder] = useState(
    client.drive_folder_id
      ? { id: client.drive_folder_id, name: client.drive_folder_name || 'Client folder', source: 'client' }
      : null
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const user = await resolvePortalUser(client).catch(() => null);
      const projectFolders = await base44.entities.Project.filter({ client_id: client.id }, '-created_date', 100)
        .then((rows) => (rows || [])
          .filter((p) => p.drive_folder_id)
          .map((p) => ({ id: p.drive_folder_id, name: p.name, source: 'project' })))
        .catch(() => []);
      let portalFolders = [];
      if (user) {
        portalFolders = await base44.entities.PortalContent.filter({ type: 'drive_link', user_id: user.id }, '-created_date', 50)
          .then((rows) => (rows || [])
            .filter((r) => r.drive_folder_id)
            .map((r) => ({ id: r.drive_folder_id, name: r.drive_folder_name || r.title || 'Portal folder', source: 'portal' })))
          .catch(() => []);
      }
      if (!active) return;
      const seen = new Set();
      setRoots([...portalFolders, ...projectFolders].filter((f) => (seen.has(f.id) ? false : seen.add(f.id))));
    })();
    return () => { active = false; };
  }, [client.id]);

  const allRoots = [...(clientFolder ? [clientFolder] : []), ...(roots || [])];

  if (roots === null) {
    return <div className="flex justify-center py-16"><div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" /></div>;
  }

  if (openRoot) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpenRoot(null)}
          className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> All folders
        </button>
        <DriveBrowser
          rootFolderId={openRoot.id}
          rootFolderName={openRoot.name}
          title={openRoot.name}
        />
      </div>
    );
  }

  return (
    <div>
      <LinkDriveFolderCard
        clientId={client.id}
        linkedFolder={clientFolder}
        onLinked={(folder) => setClientFolder({ ...folder, source: 'client' })}
        onUnlinked={() => setClientFolder(null)}
      />
      {allRoots.length === 0 ? (
        <div className="dashboard-card p-8 text-center">
          <FolderOpen className="mx-auto mb-3 h-6 w-6 icon-warm" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">
            No Google Drive folders yet. Link a folder above, or folders appear here once a project
            or their portal has one.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allRoots.map((folder) => (
            <button
              key={folder.id}
              type="button"
              onClick={() => setOpenRoot(folder)}
              className="dashboard-card p-5 text-left transition-colors hover:border-primary/40"
            >
              <div className="mb-3 flex items-center justify-between">
                <Folder className="h-5 w-5 icon-warm" strokeWidth={1.5} />
                <span className="rounded-sm border border-border px-2 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
                  {folder.source === 'portal' ? 'Portal' : folder.source === 'client' ? 'Client' : 'Project'}
                </span>
              </div>
              <p className="truncate text-sm font-medium text-foreground">{folder.name}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground/60">Browse files</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}