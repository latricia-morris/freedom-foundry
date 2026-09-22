import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Client-facing visibility reports: resolves the logged-in user to their agency
// client record by email and returns their own report snapshots. Non-admin
// callers receive records with gated fields stripped server-side, so fixes,
// competitor mapping, and analyst notes never leave the server for a client.
// recommended_fixes is released to clients only when the report's
// suggestions_client_visible toggle is explicitly enabled.
const GATED_FIELDS = [
  'competitor_map',
  'analyst_notes',
  'raw_input_text',
  'source_model',
  'next_checkin_date',
];

function stripReport(record) {
  const copy = { ...record };
  for (const field of GATED_FIELDS) delete copy[field];
  if (!record.suggestions_client_visible) delete copy.recommended_fixes;
  // Full audit sections: internal-only sections never leave the server, and
  // self-test to-do sections release only with the recommendations toggle.
  copy.audit_sections = (record.audit_sections || [])
    .filter((s) => s.client_visible !== false || (s.release_with_recommendations && record.suggestions_client_visible))
    .map((s) => ({
      title: s.title,
      order: s.order,
      methodology: s.methodology,
      body: s.body,
      table: s.table,
    }));
  return copy;
}

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
      return Response.json({ client: null, reports: [] });
    }
    const reports = await svc.entities.VisibilityReport.filter(
      { agency_client_id: client.id },
      '-report_date',
      100
    );
    const isAdmin = user.role === 'admin';
    return Response.json({
      is_admin: isAdmin,
      client: {
        company_name: client.company_name,
        access_tier: client.status === 'active' ? 'client' : 'prospect',
      },
      reports: (reports || []).map((r) => (isAdmin ? r : stripReport(r))),
    });
  } catch (error) {
    console.error('get-visibility-reports failed', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}