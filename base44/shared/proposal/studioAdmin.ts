import { STUDIO_SCHEMA, sourceBlocks, parserPrompt, assembleStudio } from './studioParser.ts';
import { isStudio, studioBlockers, publicStudio, studioDigestPayload } from './studioDocument.ts';
import { studioQuote } from './studioPricing.ts';
import { annotateStudioSource } from './studioSource.ts';

const hash = async text => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)))).map(b => b.toString(16).padStart(2,'0')).join('');
const fields = ['agency_client_id','title','project_type','recipient','content','investment','timeline','agreement_sections','agreement_version','sections_visible','media','issue_date','expiry_date','currency','parse_review','admin_notes'];
export async function studioAdminAction(svc, user, body) {
  if (body.action === 'parse-studio') {
    const markdown = String(body.markdown || '');
    if (markdown.trim().length < 40 || markdown.length > 250000) return Response.json({ error: 'Provide a complete Markdown document under 250,000 characters.' }, { status: 400 });
    const client = await svc.entities.AgencyClient.get(body.agency_client_id);
    if (!client) return Response.json({ error: 'Select the client record first.' }, { status: 400 });
    const extracted = await svc.integrations.Core.InvokeLLM({ prompt: parserPrompt(sourceBlocks(markdown), client), response_json_schema: STUDIO_SCHEMA });
    const proposal = assembleStudio(markdown, extracted, client);
    return Response.json({ proposal, quote: studioQuote(proposal.investment) });
  }
  if (body.action === 'quote-studio') {
    const doc = body.payload || await svc.entities.ProposalDoc.get(body.proposal_id);
    if (!isStudio(doc)) return Response.json({ error: 'Not a composed Studio document.' }, { status: 400 });
    const quote = studioQuote(doc.investment, body.selections || {});
    return Response.json({ quote, blockers: studioBlockers(doc), invoice_preview: { version: doc.version || 1, lines: quote.lines, total_cents: quote.totalCents, deposit_cents: quote.depositCents, obligations: quote.obligations } });
  }
  if (body.action === 'save-draft' && isStudio(body.payload)) {
    const payload = body.payload, existing = body.proposal_id ? await svc.entities.ProposalDoc.get(body.proposal_id) : null;
    if (existing && existing.status !== 'draft') return Response.json({ error: 'Published versions are frozen. Create a new draft version to edit.' }, { status: 409 });
    const client = await svc.entities.AgencyClient.get(body.agency_client_id || payload.agency_client_id);
    const update = Object.fromEntries(fields.filter(k => payload[k] !== undefined).map(k => [k, payload[k]]));
    update.agency_client_id = client.id;
    // Preserve original bytes even though other fields are editable.
    update.source_markdown = existing?.source_markdown ?? String(payload.source_markdown || '');
    annotateStudioSource(update);
    if (existing && payload.source_markdown !== existing.source_markdown && body.confirm_reimport !== true) return Response.json({ error: 'Compare the new import before replacing the saved source.' }, { status: 409 });
    if (body.confirm_reimport === true) {
      update.source_markdown = String(payload.source_markdown || '');
      update.content.studio.source_imports = [...(existing?.content?.studio?.source_imports || []), ...(existing ? [{ markdown: existing.source_markdown, content: existing.content, investment: existing.investment, timeline: existing.timeline, replaced_at: new Date().toISOString() }] : [])];
    }
    const originals = sourceBlocks(update.source_markdown);
    if (originals.some(b => !update.content.studio.blocks.some(x => x.id === b.id && x.source === b.source))) return Response.json({error:'Every original source passage must remain in the source review ledger.'},{status:400});
    update.parsed_source_hash = await hash(update.source_markdown);
    if (!existing) { update.status = 'draft'; update.version = 1; }
    const saved = existing ? await svc.entities.ProposalDoc.update(existing.id, update) : await svc.entities.ProposalDoc.create(update);
    return Response.json({ id: saved.id || existing.id, proposal: saved });
  }
  if (body.action === 'new-version') {
    const original = await svc.entities.ProposalDoc.get(body.proposal_id);
    if (original.signing?.status === 'signed') return Response.json({error:'The accepted agreement is immutable. Create a separately scoped amendment instead.'},{status:409});
    const copy = Object.fromEntries(fields.filter(k => original[k] !== undefined).map(k => [k, original[k]]));
    const doc = await svc.entities.ProposalDoc.create({ ...copy, source_markdown: original.source_markdown || '', status: 'draft', version: (original.version || 1) + 1, parsed_payload_cache: { previous_id: original.id } });
    return Response.json({ id: doc.id, proposal: doc });
  }
  if (body.action === 'publish') {
    const doc = await svc.entities.ProposalDoc.get(body.proposal_id);
    if (!isStudio(doc)) return null;
    if (doc.status !== 'draft') return Response.json({ error: 'Only a draft can be issued. Published versions stay frozen.' }, { status: 409 });
    const blockers = studioBlockers(doc);
    if (doc.content.studio.blocks.some(b => /~[\d,]+\s*\/\s*mo\b/i.test(b.text) && b.visible !== false && b.section !== 'unmapped')) blockers.push('Remove unverified search-volume figures from client copy.');
    if (blockers.length) return Response.json({ error: 'blocked', blockers }, { status: 400 });
    const approved = studioDigestPayload(doc), digest = await hash(JSON.stringify(approved));
    if (body.approved_digest !== digest) return Response.json({ error: 'Preview the saved draft again before publishing; the content has changed.' }, { status: 409 });
    const token = crypto.randomUUID().replaceAll('-','') + crypto.randomUUID().replaceAll('-','');
    await svc.entities.ProposalDoc.update(doc.id, { status: 'published', share_token: token, tokens: [{ token, version: doc.version || 1, active: true, created_at: new Date().toISOString() }], content_digest: digest, parsed_payload_cache: { ...(doc.parsed_payload_cache || {}), issued_snapshot: approved, approved_digest: digest, approved_by: user.id, approved_at: new Date().toISOString() }, publish_blockers: [] });
    const previousId = doc.parsed_payload_cache?.previous_id;
    if (previousId) {
      const previous = await svc.entities.ProposalDoc.get(previousId);
      if (['published','viewed','changes_requested'].includes(previous.status) && previous.signing?.status !== 'signed') await svc.entities.ProposalDoc.update(previousId,{status:'superseded'});
    }
    return Response.json({ token, version: doc.version || 1, digest });
  }
  if (body.action === 'preview-studio') {
    const doc = await svc.entities.ProposalDoc.get(body.proposal_id);
    if (!isStudio(doc)) return Response.json({ proposal: doc });
    const approved = studioDigestPayload(doc), digest = await hash(JSON.stringify(approved));
    return Response.json({ proposal: publicStudio(doc), digest, quote: studioQuote(doc.investment), blockers: studioBlockers(doc) });
  }
  return null;
}