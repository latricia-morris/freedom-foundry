export const STAGES = [
  { key: 'lead', label: 'Lead', probability: 10 },
  { key: 'qualified', label: 'Qualified', probability: 30 },
  { key: 'proposal', label: 'Proposal sent', probability: 50 },
  { key: 'negotiation', label: 'Negotiation', probability: 75 },
  { key: 'won', label: 'Won', probability: 100 },
  { key: 'lost', label: 'Lost', probability: 0 },
];
export const ACTIVITIES = ['strategy', 'design', 'development', 'copywriting', 'meeting', 'admin', 'other'];
export const EXPENSE_CATEGORIES = ['software', 'contractors', 'advertising', 'travel', 'equipment', 'office', 'other'];
export const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
export const EVENT_TYPES = ['meeting', 'call', 'deadline', 'review', 'other'];

export const today = () => new Date().toLocaleDateString('en-CA');
export const hours = (minutes) => `${((minutes || 0) / 60).toFixed(1)}h`;
export const shortDate = (d) => (d ? new Date(`${String(d).slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—');

export function invoiceTotals(items = [], taxRate = 0) {
  const subtotal = items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0), 0);
  const tax_amount = Math.round(subtotal * (Number(taxRate) || 0)) / 100;
  return { subtotal, tax_amount, total: subtotal + tax_amount };
}