import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { memberBrands } from '../../shared/portal/memberBrands.ts';

const pickProject = (p) => ({
  id: p.id, client_id: p.client_id, name: p.name, status: p.status, health: p.client_project_health,
  start_date: p.client_start_date || null, target_date: p.client_target_completion_date || null,
});
const pickTask = (t) => ({ id: t.id, project_id: t.project_id, title: t.title, phase: t.phase || '', status: t.status, due_date: t.client_due_date || null });
const pickDeliverable = (d) => ({ id: d.id, project_id: d.project_id, title: d.title, status: d.review_status, due_date: d.client_due_date || null, version: d.version_number || 1 });
const pickInvoice = (i) => ({
  id: i.id, client_id: i.agency_client_id, number: i.invoice_number, status: i.status, issue_date: i.issue_date, due_date: i.due_date,
  items: i.items || [], subtotal: i.subtotal || 0, tax_amount: i.tax_amount || 0, total: i.total || 0, currency: i.currency || 'USD', paid_date: i.paid_date || null, payment_terms: i.payment_terms || '', notes: i.notes || '',
});
const pickMessage = (m) => ({ id: m.id, client_id: m.agency_client_id, project_id: m.project_id || null, body: m.body, from_client: !!m.is_from_client, sender_name: m.sender_name || '', created_date: m.created_date });

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { action, agency_client_id, project_id, body } = await req.json().catch(() => ({}));
    if (!['workspace', 'send'].includes(action)) return Response.json({ error: 'Unknown action' }, { status: 400 });

    const sr = base44.asServiceRole;
    const brands = await memberBrands(base44, user, 'workspace');
    const ids = brands.map((b) => b.id);

    if (action === 'send') {
      const text = String(body || '').trim();
      if (!text || text.length > 4000) return Response.json({ error: 'Message must be 1 to 4000 characters' }, { status: 400 });
      if (!ids.includes(agency_client_id)) return Response.json({ error: 'Not found' }, { status: 404 });
      if (project_id) {
        const p = await sr.entities.Project.get(project_id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
        if (!p || p.client_id !== agency_client_id || !p.client_portal_enabled) return Response.json({ error: 'Not found' }, { status: 404 });
      }
      const m = await sr.entities.ClientMessage.create({
        agency_client_id, project_id: project_id || undefined, body: text, is_from_client: true,
        sender_name: user.full_name || user.email, sender_email: user.email, read_by_agency: false,
      });
      return Response.json({ message: pickMessage(m) });
    }

    if (!ids.length) return Response.json({ clients: [], projects: [], tasks: [], deliverables: [], invoices: [], messages: [] });
    const projects = (await sr.entities.Project.filter({ client_id: { $in: ids }, client_portal_enabled: true }, { sort: '-updated_date', limit: 50 })).items;
    const pids = projects.map((p) => p.id);
    const [tasks, deliverables, invoices, messages] = await Promise.all([
      pids.length ? sr.entities.ProjectTask.filter({ project_id: { $in: pids }, client_visible: true }, { sort: 'sort_order', limit: 500 }) : { items: [] },
      pids.length ? sr.entities.Deliverable.filter({ project_id: { $in: pids }, client_visible: true }, { sort: 'client_due_date', limit: 200 }) : { items: [] },
      sr.entities.CrmInvoice.filter({ agency_client_id: { $in: ids }, client_visible: true, status: { $ne: 'draft' } }, { sort: '-issue_date', limit: 100 }),
      sr.entities.ClientMessage.filter({ agency_client_id: { $in: ids } }, { sort: '-created_date', limit: 200 }),
    ]);
    return Response.json({
      clients: brands.map((b) => ({ id: b.id, name: b.company_name })),
      projects: projects.map(pickProject),
      tasks: tasks.items.map(pickTask),
      deliverables: deliverables.items.map(pickDeliverable),
      invoices: invoices.items.map(pickInvoice),
      messages: messages.items.reverse().map(pickMessage),
    });
  } catch (error) {
    console.error('crmClient failed', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}