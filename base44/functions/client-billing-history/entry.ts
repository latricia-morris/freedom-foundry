import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Client-facing billing history: resolves the logged-in user to their agency
// client record by email and returns ONLY their own QuickBooks billing records.
// Isolation is enforced server-side; clients never read other clients' data.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !user.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const svc = base44.asServiceRole;
    const clients = await svc.entities.AgencyClient.filter({}, '-created_date', 300);
    const email = (user.email || '').toLowerCase();
    const client = (clients || []).find(
      (c) => (c.primary_contact_email || '').toLowerCase() === email
    );
    if (!client) {
      return Response.json({ client: null, records: [] });
    }
    const records = await svc.entities.ClientBillingRecord.filter(
      { agency_client_id: client.id },
      '-txn_date',
      500
    );
    return Response.json({
      client: { company_name: client.company_name },
      records: records || [],
    });
  } catch (error) {
    console.error('client-billing-history failed', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}