import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import {
  computeMai,
  opportunityScore,
  channelPosition,
  stageCoverageMap,
  DEFAULT_MATRIX_WEIGHTS,
} from '../../shared/brandHealth/matrix.ts';

// Client-facing Digital Brand Health data: resolves the logged-in user to
// their agency client record by email and returns their audits. Clients
// receive only status facts for unpublished audits and only
// consultant-approved content for published ones — draft scores, internal
// notes, scoring weights, formulas, and internal evidence never leave the
// server for a client.
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
        (c.portal_member_emails || []).some((e) => (e || '').toLowerCase() === email),
    );
    if (!client) return Response.json({ client: null });

    const audits = await svc.entities.BrandHealthAudit.filter({ agency_client_id: client.id }, '-created_date', 100);
    const notes = await svc.entities.ConsultantNote.filter({ agency_client_id: client.id }, '-created_date', 300);
    const credits = await svc.entities.AuditCredit.filter({ agency_client_id: client.id }, '-created_date', 100);

    const publishedIds = new Set((audits || []).filter((a) => a.status === PUBLISHED).map((a) => a.id));

    // Marketing Matrix: channels and leverage opportunities are separate
    // consultant-owned records. Only client-visible records belonging to a
    // published audit are shaped for the client — and only precomputed chart
    // positions and the consultant-written summary cross the wire, never the
    // internal ratings or the opportunity-score formula.
    const matrixChannelsRaw = await svc.entities.MatrixChannel.filter({ agency_client_id: client.id }, 'sort_order', 300);
    const leverageRaw = await svc.entities.LeverageOpportunity.filter({ agency_client_id: client.id }, '-created_date', 300);

    const matrixChannels = (matrixChannelsRaw || [])
      .filter((c) => c.client_visible && publishedIds.has(c.audit_id))
      .map((c) => {
        const audit = (audits || []).find((a) => a.id === c.audit_id);
        const pos = channelPosition(c as Record<string, unknown>);
        return {
          audit_id: c.audit_id,
          channel_name: c.channel_name,
          category: c.category,
          description: c.description,
          strategic_role: c.strategic_role,
          journey_stage: c.journey_stage,
          consultant_priority: c.consultant_priority,
          client_notes: c.client_notes,
          x: pos.x,
          y: pos.y,
          opportunity: opportunityScore(
            c as Record<string, unknown>,
            stageCoverageMap((audit?.journey_coverage || []) as Array<{ stage?: string; coverage?: number }>),
          ),
        };
      });

    const leverage = (leverageRaw || [])
      .filter((o) => o.client_visible && publishedIds.has(o.audit_id))
      .map((o) => ({
        audit_id: o.audit_id,
        title: o.title,
        category: o.category,
        client_summary: o.client_summary,
        related_journey_stages: o.related_journey_stages,
        priority: o.priority,
      }));

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

    // Every user — admin previewing the portal included — receives the same
    // client-shaped audit payload so the member pages render identically.
    // Admins additionally keep the raw consultant notes below.
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

      const out = {
        ...base,
        score: a.score,
        subscores: a.subscores,
        show_subscores: a.show_subscores !== false,
        consultant_summary: a.consultant_summary,
        action_plan: a.action_plan,
        reviewed_date: a.reviewed_date,
        published_at: a.published_at,
        evidence: (a.evidence || []).filter((e) => !e.internal_only),
      };

      if (a.component === 'marketing_matrix') {
        const scores = a.matrix_scores || {};
        const matrixScoresPublic = {};
        for (const k of ['channel_fit', 'journey_coverage', 'channel_integration', 'execution_readiness']) {
          const s = scores[k];
          if (s && s.client_visible && typeof s.score === 'number') {
            matrixScoresPublic[k] = { score: s.score, client_label: s.client_label || null };
          }
        }
        out.matrix_scores_public = matrixScoresPublic;
        out.journey_public = (a.journey_coverage || [])
          .filter((s) => s && s.client_visible)
          .map((s) => ({
            stage: s.stage,
            coverage: typeof s.coverage === 'number' ? s.coverage : null,
            status: s.status,
            client_notes: s.client_notes,
          }));
        if (a.mai_visible) {
          const weights = { ...DEFAULT_MATRIX_WEIGHTS, ...(a.matrix_weights || {}) };
          const mai = computeMai(scores as Record<string, { score?: number }>, weights as Record<string, number>);
          if (mai !== null) {
            out.mai = mai;
            out.mai_label = a.mai_label || 'Market Alignment Index';
          }
        }
      }
      return out;
    };

    const payload = {
      client: { company_name: client.company_name },
      audits: (audits || []).map(publicAudit),
      matrix: matrixChannels,
      leverage,
      findings,
      credits: creditInfo,
    };

    if (user.role === 'admin') {
      payload.notes = notes || [];
    }

    return Response.json(payload);
  } catch (error) {
    console.error('get-brand-health failed', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}