import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const call = async (payload) => (await base44.functions.invoke('igniteClient', payload)).data;

export const useGuidelines = (folderId, enabled = true, brandId) => useQuery({
  queryKey: ['glx', folderId || 'mine', brandId || 'all'],
  queryFn: () => call({ action: 'guidelines', folder_id: folderId, agency_client_id: brandId }),
  enabled,
});

export const usePortalProjects = () => useQuery({ queryKey: ['ig-portal'], queryFn: () => call({ action: 'portal' }) });

export const usePortalProject = (projectId) => useQuery({
  queryKey: ['ig-portal-project', projectId],
  queryFn: () => call({ action: 'project', project_id: projectId }),
  enabled: !!projectId,
  retry: false,
});