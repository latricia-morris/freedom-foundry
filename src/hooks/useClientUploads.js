import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const call = async (payload) => (await base44.functions.invoke('clientUploads', payload)).data;

/** Intake files for one brand: list, send, open and mark reviewed. */
export function useClientUploads(brandId) {
  const qc = useQueryClient();
  const key = ['client-uploads', brandId];
  const [progress, setProgress] = useState('');
  const { data, isLoading } = useQuery({ queryKey: key, enabled: !!brandId, queryFn: () => call({ action: 'list', agency_client_id: brandId }) });

  const upload = async (files, note) => {
    const sent = [];
    for (const [i, file] of files.entries()) {
      setProgress(`Uploading ${i + 1} of ${files.length}: ${file.name}`);
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      sent.push({ file_uri, file_name: file.name, size: file.size, mime_type: file.type });
    }
    setProgress('Saving…');
    qc.setQueryData(key, await call({ action: 'record', agency_client_id: brandId, files: sent, note }));
    setProgress('');
  };

  const open = async (id) => {
    const tab = window.open('', '_blank');
    const { url } = await call({ action: 'open', agency_client_id: brandId, upload_id: id });
    if (tab) tab.location.replace(url); else window.location.assign(url);
  };

  const review = async (id) => qc.setQueryData(key, await call({ action: 'review', agency_client_id: brandId, upload_id: id }));

  return { data, isLoading, upload, open, review, progress };
}