import { useOutletContext } from 'react-router-dom';

/**
 * The brand selected in the Brand Portal sidebar
 * ({ brand, brands, isAdmin, preview }). `preview` is set when an admin is
 * viewing a client's portal instead of their own.
 */
export function usePortalBrand() {
  return useOutletContext() || { brand: null, brands: [], isAdmin: false, preview: null };
}