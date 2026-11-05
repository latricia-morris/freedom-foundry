import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Paths a Team Member may open. The server enforces the same areas on data.
export const TEAM_PATHS = [
  '/brand-portal/workspace', '/brand-portal/uploads', '/brand-portal/ignite', '/brand-portal/corporate',
  '/brand-portal/personal', '/brand-portal/media-kit', '/brand-portal/guidelines', '/brand-portal/assets',
];
export const teamCanOpen = (path) => TEAM_PATHS.some((p) => path === p || path.startsWith(`${p}/`));

/** The signed-in user's brands and brand roles. */
export function useBrandAccess() {
  const { data, isLoading } = useQuery({
    queryKey: ['portal-brands'],
    queryFn: async () => (await base44.functions.invoke('get-portal-brands', {})).data,
    staleTime: 60000,
  });
  const brands = data?.brands || [];
  const isAdmin = !!data?.is_admin;
  const restricted = !isAdmin && brands.length > 0 && brands.every((b) => b.role === 'team_member');
  const managed = brands.filter((b) => isAdmin || b.role === 'owner' || b.role === 'brand_admin');
  return { brands, isAdmin, restricted, managed, isLoading };
}

const SELECTED_KEY = 'ff-portal-brand';

/** The brand chosen in the portal selector, remembered between visits. */
export function useSelectedBrand(brands) {
  const [id, setId] = useState(() => window.localStorage.getItem(SELECTED_KEY) || '');
  const brand = brands.find((b) => b.id === id) || brands[0] || null;
  const select = (next) => {
    window.localStorage.setItem(SELECTED_KEY, next);
    setId(next);
  };
  return [brand, select];
}