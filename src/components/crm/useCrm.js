import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export const E = base44.entities;

/** One page of records for an entity, refreshed by key prefix after any change. */
export function useRecords(key, entity, query = {}, sort = '-created_date', limit = 200) {
  return useQuery({
    queryKey: ['crm', key, query],
    queryFn: async () => (await E[entity].filter(query, { sort, limit })).items,
  });
}

export function useRefresh() {
  const qc = useQueryClient();
  return (...keys) => keys.forEach((k) => qc.invalidateQueries({ queryKey: ['crm', k] }));
}

export function useClientOptions() {
  return useQuery({
    queryKey: ['crm', 'client-options'],
    queryFn: async () => (await E.AgencyClient.filter({ status: { $ne: 'archived' } }, { sort: 'company_name', limit: 300, fields: ['company_name'] })).items,
  });
}

export function useProjectOptions() {
  return useQuery({
    queryKey: ['crm', 'project-options'],
    queryFn: async () => (await E.Project.filter({ status: { $ne: 'archived' } }, { sort: 'name', limit: 300, fields: ['name', 'client_id'] })).items,
  });
}