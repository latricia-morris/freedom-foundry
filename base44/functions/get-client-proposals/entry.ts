import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Client-facing proposal list: resolves the logged-in user to their agency
// client record(s) by contact email / portal membership and returns their own
// proposals with client-safe fields and friendly status labels. Drafts and
// internal-only records never leave the server.
const HIDDEN_STATUSES = ['draft', 'internal_review', 'superseded', 'cancelled'];

function statusLabel(proposal) {
  if (proposal.project_activation_status === 'activated') return 'Completed';
  if (['accepted_awaiting_deposit', 'deposit_checkout_opened', 'deposit_paid'].includes(proposal.status)) {
    return 'Signed & accepted';
  }
  if (['sent', 'viewed', 'selections_in_progress'].includes(proposal.status)) return 'For review';
  if (proposal.status === 'expired') return 'Expired';
  if (proposal.status === 'declined') return 'Declined';
  return null;
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
    const mine = (clients || []).filter(
      (c) =>
        (c.primary_contact_email || '').toLowerCase() === email ||
        (c.portal_member_emails || []).some((e) => (e || '').toLowerCase() === email)
    );
    if (mine.length === 0) {
      return Response.json({ proposals: [] });
    }
    const ids = mine.map((c) => c.id);
    const { items } = await svc.entities.Proposal.filter(
      { client_id: { $in: ids } },
      '-created_date',
      100
    );
    const proposals = (items || [])
      .filter((p) => !HIDDEN_STATUSES.includes(p.status))
      .map((p) => ({
        id: p.id,
        title: p.title,
        proposal_number: p.proposal_number || null,
        status_label: statusLabel(p) || 'For review',
        date: p.signed_at || p.sent_at || p.accepted_at || p.created_date,
        share_token: p.share_token || null,
        signature_status: p.signature_status || null,
      }));
    return Response.json({ proposals });
  } catch (error) {
    console.error('get-client-proposals failed', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}