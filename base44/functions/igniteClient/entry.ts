import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { memberBrands } from '../../shared/portal/memberBrands.ts';

const pickProject = (l) => ({ id: l.id, folder_id: l.folder_id, name: l.name, strategy_text: l.strategy_text || '', event_date: l.event_date || null, phases: l.phases || [] });
const pickTask = (t) => ({
  id: t.id, title: t.title, phase: t.phase || 'Unphased', status: t.status || 'Drafting', done: !!t.done,
  due_date: t.due_date || null, assignee_name: t.assignee_name || '', strategic_outcome: t.strategic_outcome || '',
  subtasks: (t.subtasks || []).map((s) => ({ title: s.subtask_title, done: !!s.is_completed })),
});

async function signedUrl(sr, uri) {
  if (!uri) return null;
  const res = await sr.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 3600 });
  return res.signed_url;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { action, folder_id, project_id, agency_client_id } = await req.json().catch(() => ({}));
    if (!['portal', 'project', 'guidelines'].includes(action)) return Response.json({ error: 'Unknown action' }, { status: 400 });

    const sr = base44.asServiceRole;
    const isAdmin = user.role === 'admin' || user.role === 'super_admin';

    // Folders this caller may see: admins may target any folder; members only folders linked to their client accounts.
    let folders = [];
    if (isAdmin && folder_id) {
      const f = await sr.entities.IgniteFolder.get(folder_id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
      folders = f ? [f] : [];
    } else {
      const brands = await memberBrands(base44, user, 'ignite');
      // Optional: narrow to the brand selected in the portal.
      const ids = brands.map((b) => b.id).filter((id) => !agency_client_id || id === agency_client_id);
      if (ids.length) {
        const page = await sr.entities.IgniteFolder.filter({ agency_client_id: { $in: ids } }, { sort: 'name', limit: 50 });
        folders = page.items;
      }
      if (folder_id) folders = folders.filter((f) => f.id === folder_id);
    }
    const folderIds = folders.map((f) => f.id);

    if (action === 'portal') {
      if (!folderIds.length) return Response.json({ clients: [] });
      const lists = await sr.entities.IgniteList.filter({ folder_id: { $in: folderIds }, is_template: false }, { sort: 'name', limit: 200 });
      return Response.json({
        clients: folders.map((f) => ({ id: f.id, name: f.name, projects: lists.items.filter((l) => l.folder_id === f.id).map(pickProject) })),
      });
    }

    if (action === 'project') {
      if (!project_id) return Response.json({ error: 'project_id is required' }, { status: 400 });
      const list = await sr.entities.IgniteList.get(project_id).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
      if (!list || list.is_template || (!isAdmin && !folderIds.includes(list.folder_id))) return Response.json({ error: 'Not found' }, { status: 404 });
      const folder = folders.find((f) => f.id === list.folder_id) || await sr.entities.IgniteFolder.get(list.folder_id);
      const tasks = await sr.entities.IgniteTask.filter({ list_id: list.id }, { sort: 'sort_order', limit: 500 });
      return Response.json({ client: { id: folder.id, name: folder.name }, project: pickProject(list), tasks: tasks.items.map(pickTask) });
    }

    // guidelines
    if (!folderIds.length) return Response.json({ guideline: null });
    const page = await sr.entities.IgniteGuideline.filter({ folder_id: { $in: folderIds } }, { sort: '-updated_date', limit: 50 });
    const has = (g) => g.source_file_uri || g.published_url || g.pdf_file_uri;
    const g = folderIds.map((id) => page.items.find((x) => x.folder_id === id && has(x))).find(Boolean);
    if (!g) return Response.json({ guideline: null });

    let source_text = null;
    if (g.source_file_uri) {
      const url = await signedUrl(sr, g.source_file_uri);
      const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (!res.ok) throw new Error(`Could not load guideline source (${res.status})`);
      source_text = await res.text();
    }
    return Response.json({
      guideline: {
        client_name: folders.find((f) => f.id === g.folder_id)?.name || '',
        source_name: g.source_name || null,
        source_format: g.source_format || 'html',
        source_text,
        published_url: g.published_url || null,
        pdf_url: await signedUrl(sr, g.pdf_file_uri),
        pdf_name: g.pdf_name || null,
      },
    });
  } catch (error) {
    console.error('igniteClient error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}