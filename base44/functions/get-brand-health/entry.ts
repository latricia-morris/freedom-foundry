import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Client-facing Digital Brand Health data: resolves the logged-in user to
// their agency client record by email and returns their audits. Clients
// receive only status facts for unpublished audits and only
// consultant-approved content for published ones — draft scores, internal
// notes, and internal evidence never leave the server for a client.
const PUBLISHED = 'published_to_client';

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !user.email) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const svc = base44.asServiceRole;
    const clients = await svc.entities.AgencyClient.filter({}, '-created_date', 300);
    const email = (user.email || '').toLowerCase();
    const client = (clients || []).find(
      (c) =>
        (c.primary_contact_email || '').toLowerCase() === email ||
        (c.portal_member_emails || []).some((e) => (e || '').toLowerCase() === email)
    );
    if (!client) return Response.json({ client: null });

    const audits = await svc.entities.BrandHealthAudit.filter({ agency_client_id: client.id }, '-created_date', 100);
    const notes = await svc.entities.ConsultantNote.filter({ agency_client_id: client.id }, '-created_date', 300);
    const credits = await svc.entities.AuditCredit.filter({ agency_client_id: client.id }, '-created_date', 100);

    const publishedIds = new Set((audits || []).filter((a) => a.status === PUBLISHED).map((a) => a.id));

    const findings = (notes || [])
      .filter((n) => n.visibility === 'client_facing' && publishedIds.has(n.audit_id))
      .map((n) => ({
        audit_id: n.audit_id,
        title: n.title,
        body: n.body,
        component: n.component,
        priority: n.priority,
        attachments: n.attachments,
        published_at: n.published_at,
      }));

    const creditInfo = (credits || [])
      .filter((c) => publishedIds.has(c.audit_id) && c.credit_eligible)
      .map((c) => ({
        audit_id: c.audit_id,
        amount_cents: c.amount_cents,
        total_credit_cents: c.total_credit_cents,
        monthly_credit_cents: c.monthly_credit_cents,
        remaining_cents: Math.max(0, (c.total_credit_cents || 0) - (c.applied_cents || 0)),
        status: c.status,
        expiration_date: c.expiration_date,
        qualifying_package: c.qualifying_package,
        package_duration_months: c.package_duration_months,
      }));

    // Admins browsing the member portal get the same client-shaped findings
    // and credits so the page renders identically, plus the raw records.
    if (user.role === 'admin') {
      return Response.json({
        client: { company_name: client.company_name },
        audits: audits || [],
        notes: notes || [],
        findings,
        credits: creditInfo,
      });
    }

    const publicAudit = (a) => {
      const base = {
        id: a.id,
        component: a.component,
        package_tier: a.package_tier,
        status: a.status,
        intake_received_date: a.intake_received_date,
        review_scheduled_date: a.review_scheduled_date,
        info_requested_note: a.info_requested_note,
      };
      if (a.status !== PUBLISHED) return base;
      return {
        ...base,
        score: a.score,
        subscores: a.subscores,
        show_subscores: a.show_subscores !== false,
        consultant_summary: a.consultant_summary,
        action_plan: a.action_plan,
        matrix_channels: a.matrix_channels,
        matrix_stages: a.matrix_stages,
        matrix_strategy_note: a.matrix_strategy_note,
        reviewed_date: a.reviewed_date,
        published_at: a.published_at,
        evidence: (a.evidence || []).filter((e) => !e.internal_only),
      };
    };

    return Response.json({
      client: { company_name: client.company_name },
      audits: (audits || []).map(publicAudit),
      findings,
      credits: creditInfo,
    });
  } catch (error) {
    console.error('get-brand-health failed', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}