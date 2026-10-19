import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function useRequestContext() {
  return useQuery({ queryKey: ['project-request-context'], queryFn: async () => (await base44.functions.invoke('projectRequestContext', {})).data, staleTime: 30000, retry: 1 });
}