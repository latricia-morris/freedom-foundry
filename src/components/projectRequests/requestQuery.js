export const EMPTY_FILTERS = { services: [], timeline: '', firm: '', deadlineFrom: '', deadlineTo: '', budget: '', basis: '', min: '', max: '', status: '' };
export default function requestQuery(filters, userId) {
  const query = { request_kind: 'project_request' };
  if (userId) query.$or = [{ user_id: userId }, { created_by_id: userId }];
  if (!filters) return query;
  if (filters.services.length) query.service_options = { $in: filters.services };
  if (filters.timeline) query.timeline_window = filters.timeline;
  if (filters.firm) query.deadline_firm = filters.firm === 'firm';
  if (filters.deadlineFrom || filters.deadlineTo) query.deadline_date = { ...(filters.deadlineFrom ? { $gte: filters.deadlineFrom } : {}), ...(filters.deadlineTo ? { $lte: filters.deadlineTo } : {}) };
  if (filters.budget === 'provided') query.budget_provided = true;
  if (filters.budget === 'not_provided') query.budget_provided = { $ne: true };
  if (filters.budget === 'help') query.budget_help_requested = true;
  if (filters.basis) { query.budget_basis = filters.basis; query.$and = [{ budget_provided: true }]; }
  if (filters.min !== '') query.budget_max = { $gte: Number(filters.min) };
  if (filters.max !== '') query.budget_min = { $lte: Number(filters.max) };
  if (filters.status) query.status = filters.status;
  return query;
}