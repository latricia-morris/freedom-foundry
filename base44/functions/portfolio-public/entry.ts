import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

/**
 * Public portfolio data endpoint.
 *  - list:    published, non-confidential projects (cards only)
 *  - get:     one published case study by slug + public assets + related work
 *  - preview: admin-only draft preview of any project through the same shape
 *  - check-link: admin-only website health check
 * Drafts and private assets are never returned publicly — they are only
 * reachable through the admin entity API or the admin-gated preview.
 */

const WORK_TYPES = [
  'Branding & Rebranding',
  'Brand Refresh',
  'Brand Identity & Design',
  'Brand Strategy',
  'Web Design & Digital Presence',
  'Marketing & Brand Presence Management',
];

// Legacy category labels → the six public work types (read-time fallback).
const LEGACY_TO_WORK_TYPE = {
  'Brand Strategy': 'Brand Strategy',
  'Rebranding': 'Branding & Rebranding',
  'Brand Identity': 'Brand Identity & Design',
  'Logo Design': 'Brand Identity & Design',
  'Messaging & Copywriting': 'Marketing & Brand Presence Management',
  'Website Design': 'Web Design & Digital Presence',
  'Website Copywriting': 'Marketing & Brand Presence Management',
  'UX / UI and Digital Experience': 'Web Design & Digital Presence',
  'Print Collateral': 'Brand Identity & Design',
  'Packaging': 'Brand Identity & Design',
  'Event / Trade Show Design': 'Brand Identity & Design',
  'Social and Campaign Creative': 'Marketing & Brand Presence Management',
  'Email and Digital Marketing Assets': 'Marketing & Brand Presence Management',
  'Brand Guidelines': 'Brand Identity & Design',
  'Logos & Identity Marks': 'Brand Identity & Design',
  'Color Palette': 'Brand Identity & Design',
  'Typography': 'Brand Identity & Design',
  'Patterns & Icons': 'Brand Identity & Design',
  'Website': 'Web Design & Digital Presence',
  'UX / UI': 'Web Design & Digital Presence',
  'Website Copy': 'Marketing & Brand Presence Management',
  'Events & Trade Shows': 'Brand Identity & Design',
  'Social': 'Marketing & Brand Presence Management',
  'Email': 'Marketing & Brand Presence Management',
  'Ads & Campaigns': 'Marketing & Brand Presence Management',
};

function projectWorkTypes(project) {
  if (Array.isArray(project.work_types) && project.work_types.length) return project.work_types;
  const mapped = [];
  for (const category of [
    ...(project.service_categories || []),
    ...(project.deliverable_categories || []),
  ]) {
    const workType = WORK_TYPES.includes(category) ? category : LEGACY_TO_WORK_TYPE[category];
    if (workType && !mapped.includes(workType)) mapped.push(workType);
  }
  return mapped;
}

function slimAsset(a) {
  return {
    id: a.id,
    title: a.title,
    caption: a.caption || '',
    description: a.description || '',
    asset_type: a.asset_type,
    file_url: a.file_url,
    alt_text: a.alt_text || a.title,
    sort_order: a.sort_order || 0,
    allow_download: !!a.allow_download,
  };
}

function cardFields(project, assets) {
  const publicAssets = (assets || []).filter((a) => a.is_public && a.file_url && a.asset_type !== 'before_after');
  const featured = publicAssets.find((a) => a.asset_type === 'featured_image') || publicAssets[0] || null;
  const year = project.project_year
    || String(new Date(project.updated_date || project.created_date || Date.now()).getFullYear());
  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    client_name: project.client_name,
    industry: project.industry || '',
    location_served: project.location_served || '',
    short_summary: project.short_summary || '',
    work_types: projectWorkTypes(project),
    is_featured: !!project.is_featured,
    order: project.order || 0,
    year,
    featured_image_url: project.featured_image_url || (featured ? featured.file_url : ''),
    featured_image_alt: project.featured_image_alt
      || (featured ? (featured.alt_text || project.title || '') : (project.title || '')),
  };
}

function detailFields(project, publicAssets) {
  return {
    ...cardFields(project, publicAssets),
    challenge: project.challenge || '',
    objectives: project.objectives || '',
    scope_of_work: project.scope_of_work || '',
    strategy: project.strategy || '',
    deliverables: project.deliverables || '',
    results: project.results || '',
    testimonial: project.testimonial || '',
    testimonial_source: project.testimonial_source || '',
    credit_notes: project.credit_notes || '',
    primary_service_category: project.primary_service_category || '',
    seo_title: project.seo_title || '',
    meta_description: project.meta_description || '',
    canonical_url: project.canonical_url || '',
    og_title: project.og_title || '',
    og_description: project.og_description || '',
    og_image_url: project.og_image_url || project.featured_image_url || '',
    website_url: websiteVisible(project) ? project.client_website_url : '',
  };
}

function websiteVisible(project) {
  return Boolean(
    project.client_website_url
      && project.website_public
      && ['reachable', 'redirecting'].includes(project.website_link_status),
  );
}

async function relatedCards(base44, project) {
  const relatedIds = (project.related_project_ids || []).filter(Boolean);
  if (!relatedIds.length) return [];
  const all = await base44.entities.PortfolioProject.filter({ status: 'published' }, 'order', 500).catch(() => []);
  const allAssets = await base44.entities.PortfolioAsset.filter({ project_id: { $exists: true } }, 'sort_order', 1000).catch(() => []);
  const assetsByProject = {};
  for (const asset of allAssets || []) {
    if (!asset.is_public || !asset.file_url) continue;
    (assetsByProject[asset.project_id] = assetsByProject[asset.project_id] || []).push(asset);
  }
  return (all || [])
    .filter((p) => relatedIds.includes(p.id) && !p.confidential && (p.slug || '').trim())
    .map((p) => cardFields(p, assetsByProject[p.id] || []));
}

function beforeAfterPairs(project, publicAssets) {
  const byId = new Map(publicAssets.map((a) => [a.id, a]));
  return (project.before_after_pairs || [])
    .filter((pair) => pair && byId.has(pair.before_asset_id) && byId.has(pair.after_asset_id))
    .map((pair) => ({
      caption: pair.caption || '',
      before: byId.get(pair.before_asset_id),
      after: byId.get(pair.after_asset_id),
    }));
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const action = payload.action || 'list';
    const svc = base44.asServiceRole;

    if (action === 'list') {
      const projects = await svc.entities.PortfolioProject.filter({ status: 'published' }, 'order', 500);
      const assets = await svc.entities.PortfolioAsset.filter({ project_id: { $exists: true } }, 'sort_order', 1000).catch(() => []);
      const byProject = {};
      for (const asset of assets || []) {
        if (!asset.is_public || !asset.file_url) continue;
        (byProject[asset.project_id] = byProject[asset.project_id] || []).push(asset);
      }
      const items = (projects || [])
        .filter((p) => !p.confidential && (p.slug || '').trim())
        .map((p) => cardFields(p, byProject[p.id] || []));
      return Response.json({ items });
    }

    if (action === 'get') {
      const slug = String(payload.slug || '').trim();
      const rows = await svc.entities.PortfolioProject.filter({ slug }, 'order', 5).catch(() => []);
      const project = (rows || []).find((p) => p.slug === slug && p.status === 'published' && !p.confidential);
      if (!project) return Response.json({ error: 'Case study not found' }, { status: 404 });

      const assets = await svc.entities.PortfolioAsset.filter({ project_id: project.id }, 'sort_order', 500).catch(() => []);
      const publicAssets = (assets || []).filter((a) => a.is_public && a.file_url).map(slimAsset);

      const related = await relatedCards(svc, project);
      return Response.json({
        project: detailFields(project, publicAssets),
        assets: publicAssets,
        before_after: beforeAfterPairs(project, publicAssets),
        related,
      });
    }

    if (action === 'preview') {
      const user = await base44.auth.me().catch(() => null);
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
      const projectId = String(payload.id || '').trim();
      if (!projectId) return Response.json({ error: 'A project id is required.' }, { status: 400 });
      const project = await svc.entities.PortfolioProject.get(projectId).catch(() => null);
      if (!project) return Response.json({ error: 'Project not found' }, { status: 404 });

      const assets = await svc.entities.PortfolioAsset.filter({ project_id: project.id }, 'sort_order', 500).catch(() => []);
      const publicAssets = (assets || []).filter((a) => a.is_public && a.file_url).map(slimAsset);
      const related = await relatedCards(svc, project).catch(() => []);

      return Response.json({
        preview: true,
        project: { ...detailFields(project, publicAssets), status: project.status },
        assets: publicAssets,
        before_after: beforeAfterPairs(project, publicAssets),
        related,
      });
    }

    if (action === 'check-link') {
      const user = await base44.auth.me().catch(() => null);
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
      const url = String(payload.url || '').trim();
      if (!/^https?:\/\/.+\..+/i.test(url)) {
        return Response.json({ error: 'Enter a valid http(s) URL.' }, { status: 400 });
      }
      let status = 'error';
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        let res = await fetch(url, { method: 'HEAD', redirect: 'manual', signal: controller.signal });
        if (res.status === 405 || res.status === 403) {
          res = await fetch(url, { method: 'GET', redirect: 'manual', signal: controller.signal });
        }
        clearTimeout(timer);
        if (res.status >= 200 && res.status < 300) status = 'reachable';
        else if (res.status >= 300 && res.status < 400) status = 'redirecting';
        else status = 'error';
      } catch (error) {
        status = error.name === 'AbortError' ? 'timeout' : 'error';
      }
      const checkedAt = new Date().toISOString();
      if (payload.project_id) {
        await svc.entities.PortfolioProject.update(payload.project_id, {
          website_link_status: status,
          website_last_checked: checkedAt,
        });
      }
      return Response.json({ status, checked_at: checkedAt });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}