import apiClient from '@/api/client';
import { base44 } from '@/api/base44Client';

const ENTITY = {
  corporate: 'CorporateBrandProfile',
  personal: 'PersonalBrandProfile',
  media_kit: 'MediaKit',
  guidelines: 'BrandGuidelines',
  assets: 'BrandAsset',
};

const call = async (payload) => (await base44.functions.invoke('brandContent', payload)).data;

/**
 * Read/write one brand content area. With a selected brand, everything goes
 * through the brand-scoped server function; without one (members who are not
 * linked to a brand), the member's own records are used as before.
 */
export function brandStore(kind, brandId) {
  const entity = apiClient.entities[ENTITY[kind]];
  if (!brandId) {
    return {
      load: async () => (await entity.filter({}, '-created_date', 1))?.[0] || null,
      list: async () => ({ items: (await entity.filter({}, '-created_date', 100)) || [], links: undefined }),
      create: (data) => entity.create(data),
      update: (id, data) => entity.update(id, data),
      remove: (id) => entity.delete(id),
    };
  }
  const base = { kind, agency_client_id: brandId };
  return {
    load: async () => (await call({ ...base, action: 'get' })).record || null,
    list: async () => {
      const d = await call({ ...base, action: 'get' });
      return { items: d.items || [], links: d.links || [] };
    },
    create: async (data) => (await call({ ...base, action: 'save', data })).record,
    update: async (id, data) => (await call({ ...base, action: 'save', id, data })).record,
    remove: (id) => call({ ...base, action: 'delete', id }),
  };
}