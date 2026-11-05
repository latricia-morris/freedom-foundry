import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { roleForBrand, canManage } from '../../shared/portal/memberBrands.ts';

const MAX_FILES = 20;
const pick = (u, full) => ({
  id: u.id, file_name: u.file_name, size: u.size || 0, mime_type: u.mime_type || '', status: u.status || 'new',
  uploaded_by_email: u.uploaded_by_email || '', uploaded_by_name: u.uploaded_by_name || '', created_date: u.created_date,
  ...(full ? { note: u.note || '' } : {}),
});

// Client file intake per brand — kept apart from approved Brand Assets.
// Any brand member may send files; only agency admins, the owner and Brand Admins may open or mark them reviewed.
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { action, agency_client_id, files, note, upload_id } = await req.json().catch(() => ({}));
    if (!['list', 'record', 'open', 'review'].includes(action)) return Response.json({ error: 'Unknown action' }, { status: 400 });
    if (!agency_client_id) return Response.json({ error: 'agency_client_id is required' }, { status: 400 });

    const role = await roleForBrand(base44, user, agency_client_id);
    if (!role) return Response.json({ error: 'Not found' }, { status: 404 });
    const manager = canManage(role);
    const sr = base44.asServiceRole;
    const db = sr.entities;

    if (action === 'record') {
      const list = Array.isArray(files) ? files : [];
      if (!list.length || list.length > MAX_FILES) return Response.json({ error: `Send between 1 and ${MAX_FILES} files at a time.` }, { status: 400 });
      if (list.some((f) => !f?.file_uri || !String(f.file_uri).trim() || !f?.file_name)) return Response.json({ error: 'Each file needs a name and upload reference.' }, { status: 400 });
      await db.ClientUpload.bulkCreate(list.map((f) => ({
        agency_client_id, file_uri: String(f.file_uri), file_name: String(f.file_name).slice(0, 255),
        size: Number(f.size) || 0, mime_type: String(f.mime_type || '').slice(0, 120), note: String(note || '').slice(0, 2000),
        uploaded_by_email: user.email, uploaded_by_name: user.full_name || '', status: 'new',
      })));
    }

    if (action === 'open' || action === 'review') {
      if (!manager) return Response.json({ error: 'Only brand admins can review intake files.' }, { status: 403 });
      const u = upload_id ? await db.ClientUpload.get(upload_id).catch((e) => (e.status === 404 ? null : Promise.reject(e))) : null;
      if (!u || u.agency_client_id !== agency_client_id) return Response.json({ error: 'Not found' }, { status: 404 });
      if (action === 'open') {
        const res = await sr.integrations.Core.CreateFileSignedUrl({ file_uri: u.file_uri, expires_in: 600 });
        return Response.json({ url: res.signed_url });
      }
      await db.ClientUpload.update(u.id, { status: 'reviewed' });
    }

    const client = await db.AgencyClient.get(agency_client_id);
    const page = await db.ClientUpload.filter({ agency_client_id }, { sort: '-created_date', limit: 100 });
    return Response.json({
      folder_name: `${client.company_name} — Client Uploads`,
      can_review: manager,
      uploads: page.items.map((u) => pick(u, manager)),
    });
  } catch (error) {
    console.error('clientUploads failed', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}