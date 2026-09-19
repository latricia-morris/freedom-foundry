import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { resendConfigured } from '../../shared/email/config.ts';
import { sendAdminNotificationEmail } from '../../shared/email/service.ts';

// Sends the admin-inbox notification when an important record is created.
// Invoked by entity-trigger workflows (no user auth in that context), so this
// endpoint is guarded by an allowlist of kinds and is idempotent: at most one
// admin email per record, ever.

const HANDLERS = {
  contact_submission: 'ContactSubmission',
  bug_report: 'BugReport',
  service_request: 'ServiceRequestSubmission',
};

export default async function(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const kind = String(body.kind || '');
    const id = String(body.id || '');
    const entityName = HANDLERS[kind];
    if (!entityName || !id) {
      return Response.json({ error: 'Unknown notification kind or missing record id' }, { status: 400 });
    }
    if (!resendConfigured()) {
      return Response.json({ skipped: 'Resend API key not configured — no email sent.' });
    }

    const base44 = createClientFromRequest(req);
    const service = base44.asServiceRole;

    // Idempotency: never notify twice for the same record.
    const prior = await service.entities.EmailLog.filter({
      template_key: 'admin_notification',
      related_entity: kind,
      related_id: id,
    }).catch(() => []);
    if ((prior || []).length) return Response.json({ ok: true, skipped: 'already notified' });

    let record = null;
    try { record = await service.entities[entityName].get(id); } catch (_) { /* missing */ }
    if (!record) return Response.json({ error: 'Record not found' }, { status: 404 });

    let heading = '';
    let message = '';
    let context = [];

    if (kind === 'contact_submission') {
      heading = 'New contact submission';
      message = record.message || '';
      context = [
        { label: 'Name', value: `${record.first_name || ''} ${record.last_name || ''}`.trim() },
        { label: 'Email', value: record.email || '' },
        { label: 'Topic', value: record.category || 'general' },
        { label: 'Status', value: record.status || 'new' },
      ];
    } else if (kind === 'bug_report') {
      const typeLabel = record.type === 'feature_request' ? 'Feature request' : 'Bug report';
      heading = `New ${typeLabel.toLowerCase()} in the support queue`;
      message = record.description || '';
      context = [
        { label: 'Type', value: typeLabel },
        { label: 'Page', value: record.page_url || '—' },
        { label: 'Screenshots', value: String((record.screenshot_urls || []).length) },
        { label: 'Status', value: record.status || 'open' },
      ];
    } else {
      heading = `New service request — ${record.service_type || 'Member services'}`;
      message = record.notes || record.objective || '';
      context = [
        { label: 'Service', value: record.service_type || '' },
        { label: 'Client status', value: record.client_status || '' },
        { label: 'Objective', value: record.objective || '—' },
        { label: 'Timeline', value: record.timeline || '—' },
      ];
    }

    const result = await sendAdminNotificationEmail(service, { heading, message, context, relatedEntity: kind, relatedId: id });
    if (!result.ok) console.error('admin notification failed:', result.error);
    return Response.json({ ok: result.ok, error: result.error || '' });
  } catch (error) {
    console.error('send-admin-notification error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}