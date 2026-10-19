import apiClient from '@/api/client';

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

function makeShareToken() {
  if (window.crypto && window.crypto.getRandomValues) {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}${Math.random().toString(36).slice(2, 12)}`;
}

export async function createShareLink(profileType, profileId, brandName) {
  const shareLink = await apiClient.entities.ShareLink.create({
    token: makeShareToken(),
    profile_type: profileType,
    profile_id: profileId ? String(profileId) : null,
    is_active: true,
  });
  const slug = generateSlug(brandName);
  const typeSlug = getProfileTypeSlug(profileType);
  return `${window.location.origin}/member/${slug}/${typeSlug}?k=${shareLink.token}`;
}