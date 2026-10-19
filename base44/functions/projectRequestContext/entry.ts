import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { memberBrands } from '../../shared/portal/memberBrands.ts';
import { accountProfile, SERVICES, TIMELINES, STATUSES } from '../../shared/projectRequests.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Please sign in.' }, { status: 401 });
    const [brands, account] = await Promise.all([memberBrands(base44, user), accountProfile(base44, user)]);
    const ids = brands.map((brand) => brand.id);
    let hasCompletedAudit = false;
    if (ids.length) {
      const [audits, reports] = await Promise.all([
        base44.asServiceRole.entities.BrandHealthAudit.count({ agency_client_id: { $in: ids }, $or: [{ status: 'published_to_client' }, { reviewed_date: { $exists: true, $nin: ['', null] } }] }),
        base44.asServiceRole.entities.VisibilityReport.count({ agency_client_id: { $in: ids }, verification_status: 'human_reviewed' }),
      ]);
      hasCompletedAudit = audits > 0 || reports > 0;
    }
    return Response.json({ account, brands: brands.map(({ id, company_name }) => ({ id, company_name })), hasCompletedAudit, services: SERVICES, timelines: TIMELINES, statuses: STATUSES, user_id: user.id });
  } catch (error) {
    console.error('projectRequestContext:', error.message);
    return Response.json({ error: 'Account details could not be loaded.' }, { status: 500 });
  }
}