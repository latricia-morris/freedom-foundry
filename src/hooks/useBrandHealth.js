import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { usePortalBrand } from '@/hooks/usePortalBrand';

/** Shared Digital Brand Health data fetch for the client-facing subpages. */
export function useBrandHealth() {
  const { brand } = usePortalBrand();
  const brandId = brand?.id;
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  const reload = useCallback(() => {
    base44.functions
      .invoke('get-brand-health', { client_id: brandId })
      .then((res) => {
        setData(res.data);
        setError(false);
      })
      .catch(() => setError(true));
  }, [brandId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, error, reload };
}