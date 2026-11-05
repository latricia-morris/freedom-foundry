// Brand-scoped portal access.
// owner        — the brand's primary or billing contact (full portal, can manage access)
// brand_admin  — full portal for that brand, can manage access
// team_member  — only the areas in TEAM_AREAS for that brand
// Brand roles never change a user's account-wide role.

export const TEAM_AREAS = ['workspace', 'uploads', 'ignite', 'corporate', 'personal', 'media_kit', 'guidelines', 'assets'];
const RANK = { owner: 3, brand_admin: 2, team_member: 1 };
const FIELDS = ['company_name', 'drive_folder_id', 'drive_folder_name', 'primary_contact_email', 'billing_contact_email'];

const norm = (v) => String(v || '').trim().toLowerCase();
const exact = (email) => ({ $regex: `^\\s*${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, $options: 'i' });

/** Every brand the user can open, with their role on it. */
export async function brandAccess(base44, user) {
  const email = norm(user.email);
  if (!email) return [];
  const db = base44.asServiceRole.entities;
  const [owned, memberships] = await Promise.all([
    db.AgencyClient.filter(
      { $or: [{ primary_contact_email: exact(email) }, { billing_contact_email: exact(email) }] },
      { sort: '-created_date', limit: 100, fields: FIELDS }
    ),
    db.BrandMembership.filter({ email }, { limit: 100, fields: ['agency_client_id', 'role'] }),
  ]);
  const roles = new Map(owned.items.map((c) => [c.id, 'owner']));
  for (const m of memberships.items) {
    const current = roles.get(m.agency_client_id);
    if (!current || RANK[m.role] > RANK[current]) roles.set(m.agency_client_id, m.role);
  }
  const missing = [...roles.keys()].filter((id) => !owned.items.some((c) => c.id === id));
  const extra = missing.length
    ? (await db.AgencyClient.filter({ id: { $in: missing } }, { limit: 100, fields: FIELDS })).items
    : [];
  return [...owned.items, ...extra].map((c) => ({ ...c, role: roles.get(c.id) }));
}

/**
 * Brands the user may use for one portal area. Areas outside TEAM_AREAS
 * (or no area) exclude brands where the user is only a Team Member.
 */
export async function memberBrands(base44, user, area = '') {
  const brands = await brandAccess(base44, user);
  return TEAM_AREAS.includes(area) ? brands : brands.filter((b) => b.role !== 'team_member');
}

/** Role on one brand, or null. Agency admins act as owners everywhere. */
export async function roleForBrand(base44, user, brandId) {
  if (user.role === 'admin') return 'owner';
  const brands = await brandAccess(base44, user);
  return brands.find((b) => b.id === brandId)?.role || null;
}

export const canManage = (role) => role === 'owner' || role === 'brand_admin';
export { norm as normalizeEmail };