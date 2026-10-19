export const SERVICES = ['Brand Strategy & Rebranding', 'Logo Work & Visual Identity', 'Web Design & Development', 'Website Optimization', 'Graphic Design', 'Copywriting', 'Brand Coaching', 'Ad Campaign', 'Email Campaign', 'Apps & Digital Tools', 'Other / Help Me Scope It'];
export const TIMELINES = [
  { value: 'asap', label: 'As soon as possible' },
  { value: 'one_month', label: 'Within a month' },
  { value: 'one_to_three_months', label: 'Within 1–3 months' },
  { value: 'three_to_six_months', label: 'Within 3–6 months' },
  { value: 'flexible', label: 'My timing is flexible' },
  { value: 'specific_deadline', label: 'I have a specific deadline' },
];
export const STATUSES = [{ value: 'submitted', label: 'New' }, { value: 'save_for_later', label: 'Saved for later' }, { value: 'in_progress', label: 'In progress' }, { value: 'scheduled', label: 'Scheduled' }, { value: 'completed', label: 'Completed' }];

// Only a complete, unambiguous amount/range is normalized. The original is never replaced.
export function normalizeBudget(original) {
  const text = String(original || '').trim();
  const amount = '(?:\\d{1,3}(?:,\\d{3})+|\\d+)(?:\\.\\d{1,2})?\\s*[kK]?';
  const match = text.match(new RegExp(`^(?:USD\\s*)?\\$?\\s*(${amount})(?:\\s*(?:-|–|—|to)\\s*\\$?\\s*(${amount}))?(?:\\s*USD)?$`, 'i'));
  if (!match) return {};
  const number = (value) => Number(value.replace(/[,\skK]/g, '')) * (/[kK]/.test(value) ? 1000 : 1);
  const min = number(match[1]);
  const max = match[2] ? number(match[2]) : min;
  return Number.isFinite(min) && Number.isFinite(max) && min <= max ? { budget_min: min, budget_max: max } : {};
}

export async function accountProfile(base44, user) {
  const page = await base44.entities.UserProfile.filter({ $or: [{ user_id: user.id }, { created_by_id: user.id }] }, { sort: '-updated_date', limit: 1 });
  const profile = page.items[0] || {};
  return { name: [profile.first_name, profile.last_name].filter(Boolean).join(' ') || user.full_name || user.email, email: user.email, company_name: profile.business_name || '' };
}