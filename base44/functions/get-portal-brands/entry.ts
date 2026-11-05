import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { brandAccess, TEAM_AREAS } from '../../shared/portal/memberBrands.ts';

// Returns every brand the signed-in member can open, with their brand role.
// Used by the portal for the brand switcher and for role-based navigation.

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const clients = await brandAccess(base44, user);
    const brands = clients.map((c) => ({
      id: c.id,
      company_name: c.company_name,
      drive_folder_id: c.drive_folder_id || null,
      drive_folder_name: c.drive_folder_name || null,
      role: c.role,
    }));

    return Response.json({ brands, is_admin: user.role === 'admin', team_areas: TEAM_AREAS });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}