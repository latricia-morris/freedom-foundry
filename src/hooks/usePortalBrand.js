import { useOutletContext } from 'react-router-dom';

/** The brand selected in the Brand Portal sidebar ({ brand, brands, isAdmin }). */
export function usePortalBrand() {
  return useOutletContext() || { brand: null, brands: [], isAdmin: false };
}