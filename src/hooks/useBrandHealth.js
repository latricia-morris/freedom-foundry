import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

/** Shared Digital Brand Health data fetch for the client-facing subpages. */
export function useBrandHealth() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  const reload = useCallback(() => {
    base44.functions
      .invoke('get-brand-health', {})
      .then((res) => {
        setData(res.data);
        setError(false);
      })
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, error, reload };
}