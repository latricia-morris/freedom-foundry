import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Returns every agency client (brand) the signed-in member is linked to —
// matched by primary contact, billing contact, or the client's portal member
// emails. Used by the client portal to offer a brand switcher.

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const email = (user.email || '').trim().toLowerCase();
    if (!email) return Response.json({ brands: [] });

    const svc = base44.asServiceRole;
    const clients = (await svc.entities.AgencyClient.filter({}, '-created_date', 500).catch(() => [])) || [];

    const brands = clients
      .filter((c) => {
        const extra = Array.isArray(c.portal_member_emails) ? c.portal_member_emails : [];
        const emails = [c.primary_contact_email, c.billing_contact_email, ...extra]
          .map((e) => (e || '').trim().toLowerCase())
          .filter(Boolean);
        return emails.includes(email);
      })
      .map((c) => ({ id: c.id, company_name: c.company_name }));

    return Response.json({ brands });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}