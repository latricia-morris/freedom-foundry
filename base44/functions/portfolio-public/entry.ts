import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

/**
 * Public portfolio data endpoint.
 *  - list: published, non-confidential projects (cards only)
 *  - get:  one published case study by slug + public assets + related work
 *  - check-link: admin-only website health check
 * Drafts and private assets are never returned here — they are only reachable
 * through the admin entity API, which the public site never uses.
 */
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const action = payload.action || 'list';
    const svc = base44.asServiceRole;

    const cardFields = (project, assets) => {
      const publicAssets = (assets || []).filter((a) => a.is_public && a.file_url);
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
        service_categories: project.service_categories || [],
        deliverable_categories: project.deliverable_categories || [],
        is_featured: !!project.is_featured,
        order: project.order || 0,
        year,
        featured_image_url: featured ? featured.file_url : '',
        featured_image_alt: featured ? (featured.alt_text || project.title || '') : (project.title || ''),
      };
    };

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
      const publicAssets = (assets || [])
        .filter((a) => a.is_public && a.file_url)
        .map((a) => ({
          id: a.id,
          title: a.title,
          caption: a.caption || '',
          description: a.description || '',
          asset_type: a.asset_type,
          file_url: a.file_url,
          alt_text: a.alt_text || a.title,
          sort_order: a.sort_order || 0,
          allow_download: !!a.allow_download,
        }));

      let related = [];
      const relatedIds = (project.related_project_ids || []).filter(Boolean);
      if (relatedIds.length) {
        const all = await svc.entities.PortfolioProject.filter({ status: 'published' }, 'order', 500).catch(() => []);
        const allAssets = await svc.entities.PortfolioAsset.filter({ project_id: { $exists: true } }, 'sort_order', 1000).catch(() => []);
        const assetsByProject = {};
        for (const asset of allAssets || []) {
          if (!asset.is_public || !asset.file_url) continue;
          (assetsByProject[asset.project_id] = assetsByProject[asset.project_id] || []).push(asset);
        }
        related = (all || [])
          .filter((p) => relatedIds.includes(p.id) && !p.confidential && (p.slug || '').trim())
          .map((p) => cardFields(p, assetsByProject[p.id] || []));
      }

      const showWebsite = Boolean(
        project.client_website_url
        && project.website_public
        && ['reachable', 'redirecting'].includes(project.website_link_status),
      );

      return Response.json({
        project: {
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
          og_image_url: project.og_image_url || '',
          website_url: showWebsite ? project.client_website_url : '',
        },
        assets: publicAssets,
        related,
      });
    }

    if (action === 'check-link') {
      const user = await base44.auth.me();
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