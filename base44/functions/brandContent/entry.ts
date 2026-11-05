import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { roleForBrand, normalizeEmail } from '../../shared/portal/memberBrands.ts';

// Brand-scoped content for the shared portal pages. Anyone with a role on the
// brand (owner, Brand Admin, Team Member, agency admin) reads and edits the
// brand's own records, never their personal account's records.
const ENTITIES = {
  corporate: 'CorporateBrandProfile',
  personal: 'PersonalBrandProfile',
  media_kit: 'MediaKit',
  guidelines: 'BrandGuidelines',
  assets: 'BrandAsset',
};
const SYSTEM = ['id', 'created_date', 'updated_date', 'created_by_id', 'created_by', 'user_id', 'agency_client_id', 'is_sample'];
const clean = (d) => Object.fromEntries(Object.entries(d || {}).filter(([k]) => !SYSTEM.includes(k)));
const rows = (r) => r?.items || r || [];

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { action, kind, agency_client_id, id, data } = await req.json().catch(() => ({}));
    const name = ENTITIES[kind];
    if (!name || !['get', 'save', 'delete'].includes(action)) return Response.json({ error: 'Unknown request' }, { status: 400 });
    if (!agency_client_id) return Response.json({ error: 'agency_client_id is required' }, { status: 400 });
    if (action === 'delete' && kind !== 'assets') return Response.json({ error: 'Only assets can be deleted' }, { status: 400 });

    const role = await roleForBrand(base44, user, agency_client_id);
    if (!role) return Response.json({ error: 'You do not have access to this brand.' }, { status: 403 });

    const db = base44.asServiceRole.entities;
    const client = await db.AgencyClient.get(agency_client_id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
    if (!client) return Response.json({ error: 'Not found' }, { status: 404 });

    // The brand owner's account holds content saved before brand scoping existed.
    const ownerEmails = [...new Set([client.primary_contact_email, client.billing_contact_email].map(normalizeEmail).filter(Boolean))];
    const ownerIds = ownerEmails.length ? rows(await db.User.filter({ email: { $in: ownerEmails } })).map((u) => u.id) : [];
    const E = db[name];
    const belongs = (r) => r.agency_client_id === agency_client_id
      || (!r.agency_client_id && (ownerIds.includes(r.user_id) || ownerIds.includes(r.created_by_id)));

    if (action === 'get') {
      const limit = kind === 'assets' ? 200 : 5;
      const [scoped, legacy] = await Promise.all([
        E.filter({ agency_client_id }, { sort: '-created_date', limit }),
        ownerIds.length
          ? E.filter({ $or: [{ user_id: { $in: ownerIds } }, { created_by_id: { $in: ownerIds } }] }, { sort: '-created_date', limit })
          : [],
      ]);
      const brandRows = rows(scoped);
      const ownerRows = rows(legacy).filter((r) => !r.agency_client_id);
      if (kind !== 'assets') return Response.json({ record: brandRows[0] || ownerRows[0] || null });

      const seen = new Set();
      const items = [...brandRows, ...ownerRows]
        .filter((r) => !seen.has(r.id) && seen.add(r.id))
        .sort((a, b) => String(b.created_date).localeCompare(String(a.created_date)));
      const linkOr = [
        ...(ownerIds.length ? [{ user_id: { $in: ownerIds } }] : []),
        ...(ownerEmails.length ? [{ user_email: { $in: ownerEmails } }] : []),
      ];
      const links = linkOr.length ? rows(await db.ClientAssetLink.filter({ $or: linkOr }, { sort: '-created_date', limit: 50 })) : [];
      return Response.json({ items, links });
    }

    if (id) {
      const existing = await E.get(id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
      if (!existing || !belongs(existing)) return Response.json({ error: 'Not found' }, { status: 404 });
      if (action === 'delete') {
        await E.delete(id);
        return Response.json({ ok: true });
      }
      const record = await E.update(id, clean(data));
      return Response.json({ record });
    }
    if (action === 'delete') return Response.json({ error: 'id is required' }, { status: 400 });

    const record = await E.create({ ...clean(data), agency_client_id, ...(ownerIds[0] ? { user_id: ownerIds[0] } : {}) });
    return Response.json({ record });
  } catch (error) {
    console.error('brandContent failed', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}