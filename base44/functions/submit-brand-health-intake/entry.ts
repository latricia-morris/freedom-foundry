import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Client intake submission for Digital Brand Health audits. The client
// completes intake only — this verifies the logged-in user belongs to the
// audit's agency client, stores the answers, and marks intake received.
// Clients cannot touch any other audit field.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !user.email) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let body: any = null;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }
    const auditId = body?.audit_id;
    const intakeData = body?.intake_data;
    if (!auditId || typeof intakeData !== 'object' || intakeData === null) {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    const svc = base44.asServiceRole;
    const clients = await svc.entities.AgencyClient.filter({}, '-created_date', 300);
    const email = (user.email || '').toLowerCase();
    const client = (clients || []).find(
      (c) =>
        (c.primary_contact_email || '').toLowerCase() === email ||
        (c.portal_member_emails || []).some((e) => (e || '').toLowerCase() === email),
    );
    if (!client) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const audit = await svc.entities.BrandHealthAudit.get(auditId);
    if (!audit || audit.agency_client_id !== client.id) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
    if (audit.status === 'published_to_client' || audit.status === 'archived') {
      return Response.json({ error: 'Intake is closed for this audit' }, { status: 409 });
    }
    if (audit.intake_received_date) {
      return Response.json({ error: 'Intake has already been submitted' }, { status: 409 });
    }

    const today = new Date().toISOString().slice(0, 10);
    const patch: Record<string, unknown> = {
      intake_data: intakeData,
      intake_received_date: today,
    };
    if (audit.status === 'requested') patch.status = 'intake_received';

    await svc.entities.BrandHealthAudit.update(auditId, patch);
    return Response.json({ ok: true, intake_received_date: today });
  } catch (error) {
    console.error('submit-brand-health-intake failed', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}