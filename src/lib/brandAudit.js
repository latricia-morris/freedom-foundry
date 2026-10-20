import { base44 } from '@/api/base44Client';

export const BRAND_KEY = 'ff_audit_brand';
export const getStoredBrand = () => { try { return localStorage.getItem(BRAND_KEY) || ''; } catch { return ''; } };
export const storeBrand = (k) => { try { localStorage.setItem(BRAND_KEY, k); } catch { /* ignore */ } };

export async function auditCall(action, payload = {}) {
  const res = await base44.functions.invoke('brandAudit', { action, ...payload });
  if (res.data?.error) throw new Error(res.data.error);
  return res.data;
}

/** Opens Stripe Checkout top-level; must be called synchronously from a click. */
export async function goToCheckout(createSession) {
  const isFramed = window.self !== window.top;
  const tab = isFramed ? window.open('', '_blank') : null;
  if (isFramed && !tab) throw new Error('Allow popups to continue to checkout.');
  if (tab) tab.opener = null;
  try {
    const data = await createSession();
    if (!data.url) { tab?.close(); return data; }
    if (tab) tab.location.replace(data.url); else window.location.assign(data.url);
    return data;
  } catch (e) { tab?.close(); throw e; }
}

export const ACTIVE = ['submitted', 'information_needed', 'queued', 'in_review', 'ready_for_call', 'call_completed'];
export const STATUS_LABEL = {
  draft: 'Saved', awaiting_payment: 'Awaiting payment', submitted: 'Submitted', information_needed: 'Information needed',
  queued: 'Queued', in_review: 'In review', ready_for_call: 'Ready for findings call', call_completed: 'Call completed',
  released: 'Released', unable_to_proceed: 'Unable to proceed', cancelled: 'Cancelled',
};

export const TIERS = {
  courtesy: { name: 'Visibility & Credibility', price: 'Complimentary' },
  website: { name: 'Website Discoverability & Conversion Readiness', price: '$697 one-time payment', short: '$697' },
  complete: { name: 'Complete Brand Health Review', price: '$1,497 one-time payment', short: '$1,497' },
};

export const STEPS = ['Choose your review', 'Confirm your details', 'Complete your request'];
export const WEBSITE_SCOPE = 'We select and review your core pages and the main path to inquiry or purchase. This is not a page-by-page review of every article, product, or location. Your report identifies the pages assessed.';
export const CREDIT_NOTE = 'If you hire us for an approved implementation engagement of six months or longer, eligible assessment fees can be credited evenly across monthly service payments, not deducted upfront.';
export const TERMS_TEXT = 'Your purchase covers professional assessment, analysis, and recommendations within the stated scope. Purchases are non-refundable, except where required by law. Implementation is not included unless expressly stated.';
export const DELIVERY_TEXT = 'After payment, we’ll arrange your findings call with time to prepare your assessment beforehand. We’ll discuss the findings and next steps together, then release your report and included recommendations to your dashboard.';

export function normalizeUrl(v) {
  const s = String(v || '').trim();
  if (!s) return '';
  try { const u = new URL(s.includes('://') ? s : `https://${s}`); return ['http:', 'https:'].includes(u.protocol) && u.hostname.includes('.') ? u.href : null; } catch { return null; }
}