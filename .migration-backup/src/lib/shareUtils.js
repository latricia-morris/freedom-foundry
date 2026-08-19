import { base44 } from '@/api/base44Client';

export function generateSlug(name) {
  return (name || 'member')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50) || 'member';
}

export function getProfileTypeSlug(profileType) {
  const map = {
    personal: 'personalbranding',
    corporate: 'corporatebranding',
    media_kit: 'mediakit',
  };
  return map[profileType] || 'personalbranding';
}

export function parseProfileTypeSlug(slug) {
  const map = {
    personalbranding: 'personal',
    corporatebranding: 'corporate',
    mediakit: 'media_kit',
  };
  return map[slug] || 'personal';
}

export async function createShareLink(profileType, profileId, brandName) {
  const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
  await base44.entities.ShareLink.create({
    token,
    profile_type: profileType,
    profile_id: profileId,
    is_active: true,
  });
  const slug = generateSlug(brandName);
  const typeSlug = getProfileTypeSlug(profileType);
  return `${window.location.origin}/member/${slug}/${typeSlug}?k=${token}`;
}