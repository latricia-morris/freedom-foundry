import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { token } = body;

    if (!token) return Response.json({ error: 'Token required' }, { status: 400 });

    const links = await base44.asServiceRole.entities.ShareLink.filter({ token, is_active: true });
    const link = links?.[0];
    if (!link) return Response.json({ error: 'Invalid or expired link' }, { status: 404 });

    let profile = null;
    if (link.profile_type === 'personal') {
      profile = await base44.asServiceRole.entities.PersonalBrandProfile.get(link.profile_id);
    } else if (link.profile_type === 'corporate') {
      profile = await base44.asServiceRole.entities.CorporateBrandProfile.get(link.profile_id);
    } else if (link.profile_type === 'media_kit') {
      profile = await base44.asServiceRole.entities.MediaKit.get(link.profile_id);
    }

    if (!profile) return Response.json({ error: 'Profile not found' }, { status: 404 });

    return Response.json({ profile_type: link.profile_type, profile });
  } catch (error) {
    console.error('get-shared-profile error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}