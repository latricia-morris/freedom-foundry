import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { roleForBrand, canManage, normalizeEmail } from '../../shared/portal/memberBrands.ts';

const ROLES = ['brand_admin', 'team_member'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const pick = (m) => ({ id: m.id, email: m.email, role: m.role, added_by_email: m.added_by_email || '', created_date: m.created_date });

// Brand access management: list, add, change role, remove.
// Allowed for agency admins and the brand's owner / Brand Admins only.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { action, agency_client_id, email, role, membership_id } = await req.json().catch(() => ({}));
    if (!['list', 'add', 'update', 'remove'].includes(action)) return Response.json({ error: 'Unknown action' }, { status: 400 });
    if (!agency_client_id) return Response.json({ error: 'agency_client_id is required' }, { status: 400 });

    const myRole = await roleForBrand(base44, user, agency_client_id);
    if (!canManage(myRole)) return Response.json({ error: 'You cannot manage access for this brand.' }, { status: 403 });

    const db = base44.asServiceRole.entities;
    const client = await db.AgencyClient.get(agency_client_id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!client) return Response.json({ error: 'Not found' }, { status: 404 });
    const owners = [...new Set([client.primary_contact_email, client.billing_contact_email].map(normalizeEmail).filter(Boolean))];

    const loadMember = async () => {
      const m = membership_id ? await db.BrandMembership.get(membership_id).catch((e) => (e.status === 404 ? null : Promise.reject(e))) : null;
      return m && m.agency_client_id === agency_client_id ? m : null;
    };

    if (action === 'add') {
      const clean = normalizeEmail(email);
      if (!EMAIL_RE.test(clean)) return Response.json({ error: 'Enter a valid email address.' }, { status: 400 });
      if (!ROLES.includes(role)) return Response.json({ error: 'Choose Brand Admin or Team Member.' }, { status: 400 });
      if (owners.includes(clean)) return Response.json({ error: 'This person is already the brand owner.' }, { status: 400 });
      const existing = (await db.BrandMembership.filter({ agency_client_id, email: clean }, { limit: 1 })).items[0];
      if (existing) await db.BrandMembership.update(existing.id, { role });
      else await db.BrandMembership.create({ agency_client_id, email: clean, role, added_by_email: normalizeEmail(user.email) });
      const users = await db.User.filter({ email: clean });
      if (!(users?.items || users || []).length) await base44.asServiceRole.users.inviteUser(clean, 'user');
    }

    if (action === 'update') {
      if (!ROLES.includes(role)) return Response.json({ error: 'Choose Brand Admin or Team Member.' }, { status: 400 });
      const m = await loadMember();
      if (!m) return Response.json({ error: 'Not found' }, { status: 404 });
      await db.BrandMembership.update(m.id, { role });
    }

    if (action === 'remove') {
      const m = await loadMember();
      if (!m) return Response.json({ error: 'Not found' }, { status: 404 });
      await db.BrandMembership.delete(m.id);
    }

    const members = await db.BrandMembership.filter({ agency_client_id }, { sort: 'created_date', limit: 200 });
    return Response.json({ brand: { id: client.id, name: client.company_name }, owners, members: members.items.map(pick), my_role: myRole });
  } catch (error) {
    console.error('brandTeam failed', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}