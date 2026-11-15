// Shared helpers for the Academy (courses and books).
import { base44 } from '@/api/base44Client';

export const STATUS_LABELS = { draft: 'Draft', published: 'Published', archived: 'Archived' };

export const money = (cents, currency = 'usd') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: (currency || 'usd').toUpperCase() }).format((cents || 0) / 100);

export const priceLabel = (o) => (o.is_free || !o.price_cents ? 'Free' : money(o.price_cents, o.currency));

/** Calls the learner API and returns its data. */
export async function learnApi(action, payload = {}) {
  const res = await base44.functions.invoke('learn', { action, ...payload });
  return res.data;
}

/** Turns a YouTube or Vimeo link into its player address; null for anything else. */
export function videoEmbedUrl(url) {
  const u = (url || '').trim();
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0&modestbranding=1`;
  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

/** The https address inside pasted embed code (or a plain link). Nothing else from the code is used. */
export function embedSrc(code) {
  const c = (code || '').trim();
  const m = c.match(/<iframe[^>]*\ssrc=["'](https:\/\/[^"']+)["']/i);
  if (m) return m[1];
  return /^https:\/\/\S+$/.test(c) ? c : null;
}

/** The worksheet prompt with the learner's answers filled in. */
export function composePrompt(worksheet, answers) {
  const qs = worksheet?.questions || [];
  const block = qs
    .map((q, i) => `${i + 1}. ${q.label}\n${(answers?.[q.id] || '').trim() || '(not answered)'}`)
    .join('\n\n');
  const template = (worksheet?.prompt_template || '').trim();
  if (template.includes('{{answers}}')) return template.replace(/\{\{answers\}\}/g, block);
  return [template, block].filter(Boolean).join('\n\n');
}

export const formatTime = (s) => {
  if (!Number.isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};