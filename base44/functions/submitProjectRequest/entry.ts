import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { memberBrands } from '../../shared/portal/memberBrands.ts';
import { accountProfile, SERVICES, TIMELINES, normalizeBudget } from '../../shared/projectRequests.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Please sign in to submit your request.' }, { status: 401 });
    const body = await req.json();
    const fail = (error) => Response.json({ error }, { status: 400 });
    if (!/^[a-zA-Z0-9-]{20,80}$/.test(body.submission_key || '')) return fail('A submission reference is required.');
    const previous = await base44.entities.ServiceRequestSubmission.filter({ created_by_id: user.id, submission_key: body.submission_key }, { limit: 1 });
    if (previous.items.length) return Response.json({ record: previous.items[0], duplicate: true });
    const services = Array.isArray(body.service_options) ? [...new Set(body.service_options)] : [];
    if (!services.length || services.some((item) => !SERVICES.includes(item))) return fail('Select at least one service.');
    const notes = String(body.notes || '');
    if (!/[\p{L}\p{N}]/u.test(notes)) return fail('Tell us what needs to be created or improved.');
    const timing = TIMELINES.find((item) => item.value === body.timeline_window);
    if (!timing) return fail('Select your preferred timing.');
    if (body.acknowledged !== true) return fail('Please acknowledge the project review and start conditions.');
    const specific = timing.value === 'specific_deadline';
    if (specific && (!/^\d{4}-\d{2}-\d{2}$/.test(body.deadline_date || '') || new Date(`${body.deadline_date}T00:00:00Z`).toISOString().slice(0, 10) !== body.deadline_date)) return fail('Choose a valid desired completion date.');
    const link = String(body.link || '').trim();
    if (link) { let parsed; try { parsed = new URL(link); } catch { return fail('Enter a complete reference link beginning with https:// or http://.'); } if (!['https:', 'http:'].includes(parsed.protocol)) return fail('Use an http:// or https:// reference link.'); }
    const attachments = Array.isArray(body.attachments) ? body.attachments : [];
    if (attachments.length > 2) return fail('Attach no more than two files.');
    for (const attachment of attachments) {
      if (!attachment.file_uri || !attachment.name || /^https?:/i.test(attachment.file_uri)) return fail('Attach files using the private upload control.');
      const validation = await base44.functions.invoke('scan-upload', { file_uri: attachment.file_uri, filename: attachment.name });
      if (!validation.data?.ok) return fail(`${attachment.name}: ${validation.data?.reason || 'The file could not be validated.'}`);
    }
    const [brands, account] = await Promise.all([memberBrands(base44, user), accountProfile(base44, user)]);
    const brand = brands.find((item) => item.id === body.agency_client_id);
    if ((body.agency_client_id && !brand) || (brands.length > 1 && !brand)) return fail('Select a brand associated with your account.');
    const selectedBrand = brand || (brands.length === 1 ? brands[0] : null);
    const original = String(body.budget_original || '');
    const record = await base44.entities.ServiceRequestSubmission.create({
      request_kind: 'project_request', service_type: services.join(', '), service_options: services, project_type: services,
      request_purpose: body.request_purpose === 'brand_health_index' ? 'brand_health_index' : 'project',
      submission_key: body.submission_key, status: 'submitted', save_for_later: false, user_id: user.id,
      contact_name: account.name, contact_email: account.email, company_name: selectedBrand?.company_name || account.company_name,
      agency_client_id: selectedBrand?.id || '', brand_name: selectedBrand?.company_name || account.company_name,
      notes, timeline: timing.label, timeline_window: timing.value,
      deadline_date: specific ? body.deadline_date : '', deadline_firm: specific && body.deadline_firm === true, deadline_note: specific ? String(body.deadline_note || '') : '',
      budget_original: original, budget_provided: !!original.trim(), budget_basis: body.budget_basis === 'monthly' ? 'monthly' : 'total_project', budget_help_requested: body.budget_help_requested === true,
      ...normalizeBudget(original), inspiration_file_uris: attachments.map((file) => file.file_uri),
      details: { message: notes, link, attachments: attachments.map((file) => file.name) },
      deposit_acknowledged: true, acknowledged_at: new Date().toISOString(),
      acknowledgment_text: 'I understand that this request is subject to review and does not start a project. If accepted, the scope, payment terms, and schedule will be confirmed in a proposal. Work begins only after the signed proposal and required initial payment have been received.',
    });
    return Response.json({ record });
  } catch (error) {
    console.error('submitProjectRequest:', error.message);
    return Response.json({ error: 'The request could not be sent. Your entries are still here; please try again.' }, { status: 500 });
  }
}