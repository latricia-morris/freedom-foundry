/** Match only clients associated with the authenticated member's email. */
export async function memberBrands(base44, user) {
  const email = String(user.email || '').trim().toLowerCase();
  if (!email) return [];
  const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = { $regex: `^\\s*${escaped}\\s*$`, $options: 'i' };
  const page = await base44.asServiceRole.entities.AgencyClient.filter(
    { $or: [{ primary_contact_email: match }, { billing_contact_email: match }, { portal_member_emails: match }] },
    { sort: '-created_date', limit: 100, fields: ['company_name', 'drive_folder_id', 'drive_folder_name'] }
  );
  return page.items;
}