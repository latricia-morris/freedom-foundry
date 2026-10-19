import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import DriveBrowser from '@/components/portal/DriveBrowser';
import { FolderOpen } from 'lucide-react';

/**
 * Client-facing section on Brand Assets: the Google Drive folder the agency
 * linked to the client's portal, browsable alongside linked external assets.
 */
export default function ClientDriveFolder() {
  const [folder, setFolder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    base44.functions.invoke('get-portal-brands')
      .then((res) => {
        if (!active) return;
        const brands = res.data?.brands || [];
        const withFolder = brands.find((b) => b.drive_folder_id);
        setFolder(
          withFolder
            ? {
                id: withFolder.drive_folder_id,
                name: withFolder.drive_folder_name || withFolder.company_name || 'Brand Files',
              }
            : null
        );
      })
      .catch(() => { if (active) setFolder(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <section className="mb-10">
        <div className="mb-4 flex items-center gap-2">
          <FolderOpen className="icon-warm h-4 w-4" strokeWidth={1.5} />
          <h2 className="font-heading text-xl text-foreground">Google Drive</h2>
        </div>
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  if (!folder) return null;

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-2">
        <FolderOpen className="icon-warm h-4 w-4" strokeWidth={1.5} />
        <h2 className="font-heading text-xl text-foreground">Google Drive</h2>
      </div>
      <DriveBrowser rootFolderId={folder.id} rootFolderName={folder.name} title={folder.name} />
    </section>
  );
}