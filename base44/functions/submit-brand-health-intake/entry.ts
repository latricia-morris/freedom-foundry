import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { baselineStatus, computeMatrixState, matrixFlags } from '../../shared/brandHealth/matrix.ts';

// Client intake submission for Digital Brand Health audits. The client
// completes intake only — this verifies the logged-in user belongs to the
// audit's agency client, stores the answers, and marks intake received.
//
// Two modes:
//   intake   (default) — the full locked intake, submitted once.
//   baseline           — the remaining baseline items only, merged into the
//                        existing intake answers. Never re-opens the intake
//                        and never touches consultant findings, scores, or
//                        results.
//
// Clients can never edit findings, scoring, or results: client_can_edit stays
// false and no other audit field is writable through this endpoint.
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
    const mode = body?.mode === 'baseline' ? 'baseline' : 'intake';
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
    if (audit.status === 'archived') {
      return Response.json({ error: 'This audit is closed' }, { status: 409 });
    }
    if (mode === 'intake' && audit.intake_received_date) {
      return Response.json({ error: 'Intake has already been submitted' }, { status: 409 });
    }
    if (mode === 'intake' && audit.status === 'published_to_client') {
      return Response.json({ error: 'Intake is closed for this audit' }, { status: 409 });
    }

    const today = new Date().toISOString().slice(0, 10);
    const mergedIntake = mode === 'baseline'
      ? { ...(audit.intake_data || {}), ...intakeData }
      : intakeData;

    const patch: Record<string, unknown> = {
      intake_data: mergedIntake,
      last_updated_by: user.email,
      last_updated_at: new Date().toISOString(),
      client_can_edit: false,
    };
    if (mode === 'intake') {
      patch.intake_received_date = today;
      if (audit.status === 'requested') patch.status = 'intake_received';
    }

    // Marketing Matrix: recompute readiness so the client lands on the right
    // screen next (results when findings/baseline allow, otherwise only the
    // missing baseline items).
    if (audit.component === 'marketing_matrix') {
      const candidate = { ...audit, intake_data: mergedIntake, intake_received_date: mode === 'intake' ? today : audit.intake_received_date };
      const flags = matrixFlags(candidate);
      const baseline = baselineStatus(candidate);
      Object.assign(patch, {
        findings_loaded: flags.findings_loaded,
        client_intake_complete: flags.client_intake_complete,
        minimum_baseline_met: baseline.minimum_baseline_met,
        missing_baseline_fields: baseline.missing_baseline_fields,
        matrix_state: computeMatrixState({
          findings_loaded: flags.findings_loaded,
          client_intake_complete: flags.client_intake_complete,
          minimum_baseline_met: baseline.minimum_baseline_met,
        }),
        matrix_ready: flags.matrix_ready,
        data_source: flags.data_source,
      });
    }

    await svc.entities.BrandHealthAudit.update(auditId, patch);
    return Response.json({
      ok: true,
      mode,
      intake_received_date: patch.intake_received_date || audit.intake_received_date || null,
      matrix_state: patch.matrix_state || null,
      missing_baseline_fields: patch.missing_baseline_fields || [],
    });
  } catch (error) {
    console.error('submit-brand-health-intake failed', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}