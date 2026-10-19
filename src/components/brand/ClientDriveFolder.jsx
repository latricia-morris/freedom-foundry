import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DriveBrowser from '@/components/portal/DriveBrowser';

/** The folder linked directly to this member's client, independent of plan. */
export default function ClientDriveFolder() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['portal-asset-folders'],
    queryFn: async () => {
      const response = await base44.functions.invoke('get-portal-brands', {});
      return response.data;
    },
    refetchOnWindowFocus: true,
  });
  const folder = data?.brands?.find((brand) => brand.drive_folder_id);

  if (isPending) return (
    <section className="mb-10 flex justify-center py-10" aria-label="Loading shared folder">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
    </section>
  );
  if (isError) return (
    <section className="mb-10 text-sm text-muted-foreground" role="alert">
      Your shared folder could not be loaded. <button type="button" onClick={() => refetch()} className="underline">Try again</button>
    </section>
  );
  if (!folder) return null;

  return (
    <section className="mb-10">
      <DriveBrowser
        key={folder.drive_folder_id}
        rootFolderId={folder.drive_folder_id}
        rootFolderName={folder.drive_folder_name || folder.company_name || 'Brand Files'}
        headingOutside
      />
    </section>
  );
}