import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getPreviewClientId } from '@/lib/portalPreview';

// Paths a Team Member may open. The server enforces the same areas on data.
export const TEAM_PATHS = [
  '/brand-portal/workspace', '/brand-portal/uploads', '/brand-portal/ignite', '/brand-portal/corporate',
  '/brand-portal/personal', '/brand-portal/media-kit', '/brand-portal/guidelines', '/brand-portal/assets',
];
export const teamCanOpen = (path) => TEAM_PATHS.some((p) => path === p || path.startsWith(`${p}/`));

/**
 * The signed-in user's brands and brand roles.
 *
 * When an admin is previewing a client's portal, this resolves to that single
 * brand with the primary contact's brand_admin role, so every portal page reads
 * the client's real content while the admin keeps their own account.
 */
export function useBrandAccess() {
  const previewClientId = getPreviewClientId();
  const { data, isLoading } = useQuery({
    queryKey: ['portal-brands', previewClientId],
    queryFn: async () => {
      if (previewClientId) {
        const client = await base44.entities.AgencyClient.get(previewClientId);
        return {
          is_admin: true,
          preview: {
            client_id: client.id,
            company_name: client.company_name || 'Client',
            contact_name: client.primary_contact_name || '',
            contact_email: client.primary_contact_email || '',
          },
          brands: [
            {
              id: client.id,
              company_name: client.company_name,
              drive_folder_id: client.drive_folder_id || null,
              drive_folder_name: client.drive_folder_name || null,
              role: 'brand_admin',
            },
          ],
        };
      }
      return (await base44.functions.invoke('get-portal-brands', {})).data;
    },
    staleTime: 60000,
  });
  const brands = data?.brands || [];
  const preview = data?.preview || null;
  // Preview shows the primary contact's experience, not the app admin's.
  const isAdmin = preview ? false : !!data?.is_admin;
  const restricted = !isAdmin && brands.length > 0 && brands.every((b) => b.role === 'team_member');
  const managed = brands.filter((b) => isAdmin || b.role === 'owner' || b.role === 'brand_admin');
  return { brands, isAdmin, restricted, managed, isLoading, preview };
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