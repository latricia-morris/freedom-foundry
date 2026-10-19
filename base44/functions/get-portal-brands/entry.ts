import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { memberBrands } from '../../shared/portal/memberBrands.ts';

// Returns every agency client (brand) the signed-in member is linked to —
// matched by primary contact, billing contact, or the client's portal member
// emails. Used by the client portal to offer a brand switcher.

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const clients = await memberBrands(base44, user);
    const brands = clients.map((c) => ({
        id: c.id,
        company_name: c.company_name,
        drive_folder_id: c.drive_folder_id || null,
        drive_folder_name: c.drive_folder_name || null,
      }));

    return Response.json({ brands });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}