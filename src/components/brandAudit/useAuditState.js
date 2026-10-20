import { useQuery } from '@tanstack/react-query';
import { auditCall } from '@/lib/brandAudit';

export default function useAuditState(brandKey) {
  return useQuery({
    queryKey: ['brand-audit', brandKey || 'default'],
    queryFn: () => auditCall('state', { brand_key: brandKey || undefined }),
  });
}