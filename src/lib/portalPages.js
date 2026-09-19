// Shared Brand Portal page registry — used by the admin content manager
// (choosing where an item lands) and the member-side renderer.
export const PORTAL_PAGES = [
  { key: 'overview', label: 'Portal Overview', path: '/brand-portal' },
  { key: 'big_picture', label: 'Big Picture', path: '/brand-portal/big-picture' },
  { key: 'corporate', label: 'Corporate Brand', path: '/brand-portal/corporate' },
  { key: 'personal', label: 'Personal Brand', path: '/brand-portal/personal' },
  { key: 'media_kit', label: 'Media Kit', path: '/brand-portal/media-kit' },
  { key: 'guidelines', label: 'Brand Guidelines', path: '/brand-portal/guidelines' },
  { key: 'assets', label: 'Brand Assets', path: '/brand-portal/assets' },
  { key: 'brand_up', label: 'Brand Up', path: '/brand-portal/brand-up' },
  { key: 'checklist', label: 'Brand Checklist', path: '/brand-portal/checklist' },
  { key: 'ignite', label: 'Ignite OS', path: '/brand-portal/ignite' },
  { key: 'request_services', label: 'Request Brand Services', path: '/brand-portal/request-services' },
];

export function pageKeyFromPath(pathname) {
  const match = PORTAL_PAGES.find((page) => page.path === pathname);
  return match ? match.key : null;
}