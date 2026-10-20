import { studioQuote } from './studioPricing.ts';
import { AGENCY, CONSENTS, CONSENTS_VERSION } from './content.ts';
export const isStudio = doc => doc?.content?.studio?.schema_version === 2;
export function studioBlockers(doc) {
  const errors = [], studio = doc.content?.studio || {}, recipient = doc.recipient || {};
  if (!recipient.full_name || !recipient.contracting_party_name) errors.push('Resolve recipient and contracting party.');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(recipient.notice_email || recipient.email || '')) errors.push('A valid signing and delivery email is required.');
  const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const from = studio.document_recipient || {};
  if (!studio.identity_confirmed && ((from.full_name && norm(from.full_name) !== norm(recipient.full_name)) || (from.company_name && norm(from.company_name) !== norm(recipient.company_name)))) errors.push('Review the document/client identity conflict.');
  for (const b of studio.blocks || []) if (b.section === 'unmapped' && !b.reviewed) errors.push(`Place or review unmapped passage ${b.id}.`);
  for (const i of studio.issues || []) if (!i.resolved && i.blocking !== false && !(studio.services || []).some(s => s.id === i.service_id && s.acceptance_mode === 'future')) errors.push(i.note || i.kind);
  for (const s of studio.services || []) {
    if (!['included','optional_now','future'].includes(s.acceptance_mode)) errors.push(`Confirm acceptance mode for ${s.name}.`);
    if (s.quantity != null && s.named_items?.length > s.quantity && s.acceptance_mode === 'included') errors.push(`Check named item quantity for ${s.name}.`);
  }
  const quote = studioQuote(doc.investment);
  errors.push(...quote.errors.filter(e => !e.startsWith('Select exactly one alternative')));
  if (quote.totalCents <= 0 && !(doc.investment?.items || []).some(i => i.alternative_group)) errors.push('Initial accepted scope must have a positive price.');
  if (!(doc.timeline?.phases || []).some(p => p.acceptance_mode !== 'future')) errors.push('Add the initial project timeline.');
  if (!(doc.agreement_sections || []).length) errors.push('Applicable agreement language is required.');
  return [...new Set(errors)];
}
export function publicStudio(doc) {
  const s = doc.content.studio;
  return { id: doc.id, title: doc.title, project_type: doc.project_type, version: doc.version || 1, status: doc.status, issue_date: doc.issue_date, expiry_date: doc.expiry_date, currency: doc.currency || 'USD', recipient: doc.recipient, sections_visible: doc.sections_visible, media: doc.media,
    content: { studio: { schema_version: 2, blocks: (s.blocks || []).filter(b => b.section !== 'unmapped' && b.visible !== false).map(b => ({ id: b.id, text: b.text, section: b.section, layer: b.layer, service_id: b.service_id, acceptance_mode: b.acceptance_mode })), services: s.services || [], presentation: s.presentation || [] } },
    investment: doc.investment, timeline: doc.timeline, agreement_sections: doc.agreement_sections, agreement_version: doc.agreement_version, agency: AGENCY, consents: CONSENTS, consents_version: CONSENTS_VERSION, content_digest: doc.content_digest || '', signing: doc.signing || {} };
}
export function studioDigestPayload(doc) {
  const { id, status, content_digest, signing, ...frozen } = publicStudio(doc);
  return frozen;
}