import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { groundingHeader, WORK_TYPE_LIST, DETAIL_TAG_LIST } from '../../shared/portfolio/voice.ts';

/**
 * Grounded portfolio copy generation.
 *  - intake:   draft a past-client project record from the client's website,
 *              uploaded reference materials, and the admin's description
 *  - generate: draft the case-study narrative from stored project facts
 *  - rewrite:  rewrite one section at a chosen strength, per the voice rules
 * Every action is admin-only and grounded strictly in the supplied source
 * material. Unsupported sections come back as [NEEDS REVIEW], never invented.
 */

const INTAKE_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    client_name: { type: 'string' },
    industry: { type: 'string' },
    short_summary: { type: 'string' },
    work_types: { type: 'array', items: { type: 'string' } },
    detail_tags: { type: 'array', items: { type: 'string' } },
    slug: { type: 'string' },
    seo_title: { type: 'string' },
    meta_description: { type: 'string' },
    target_keywords: { type: 'array', items: { type: 'string' } },
    missing: { type: 'array', items: { type: 'string' } },
  },
  required: ['title', 'client_name', 'short_summary', 'missing'],
};

const NARRATIVE_SCHEMA = {
  type: 'object',
  properties: {
    short_summary: { type: 'string' },
    challenge: { type: 'string' },
    objectives: { type: 'string' },
    scope_of_work: { type: 'string' },
    strategy: { type: 'string' },
    deliverables: { type: 'string' },
    missing: { type: 'array', items: { type: 'string' } },
  },
  required: ['missing'],
};

const REWRITE_SCHEMA = {
  type: 'object',
  properties: { text: { type: 'string' } },
  required: ['text'],
};

const STRENGTH_INSTRUCTIONS = {
  light: 'Polish lightly. Fix voice-rule violations and tighten wording. Preserve the meaning and length.',
  moderate: 'Rewrite clearly. Keep the same facts and roughly the same length, with sharper sentences.',
  strong: 'Rewrite from the facts. A full restructure is allowed, but no new facts may enter.',
};

async function fetchWebsiteText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FreedomFoundryIntake/1.0)' },
    });
    if (!res.ok) return { text: '', error: `The site returned ${res.status}.` };
    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
    return { text: text.slice(0, 6000), error: '' };
  } catch (error) {
    return { text: '', error: error.name === 'AbortError' ? 'The site timed out.' : 'The site could not be fetched.' };
  } finally {
    clearTimeout(timer);
  }
}

function stringArray(value, max) {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === 'string' && item.trim()).slice(0, max);
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const action = body.action;
    const payload = body.payload && typeof body.payload === 'object' ? body.payload : {};

    if (action === 'intake') {
      const websiteUrl = typeof payload.website_url === 'string' ? payload.website_url.trim() : '';
      const description = typeof payload.description === 'string' ? payload.description.trim().slice(0, 2000) : '';
      const fileUrls = stringArray(payload.file_urls, 5);
      if (!websiteUrl && !description && !fileUrls.length) {
        return Response.json({ error: 'Add a website URL, a description, or reference files first.' }, { status: 400 });
      }
      if (websiteUrl && !/^https?:\/\/.+\..+/i.test(websiteUrl)) {
        return Response.json({ error: 'Enter a valid http(s) website URL.' }, { status: 400 });
      }

      const site = websiteUrl ? await fetchWebsiteText(websiteUrl) : { text: '', error: '' };
      const context = [
        site.text ? `Client website content (${websiteUrl}):\n${site.text}` : '',
        description ? `Admin description of the engagement:\n${description}` : '',
        fileUrls.length ? 'Reference files are attached to this request.' : '',
      ].filter(Boolean).join('\n\n') || 'No source material was provided.';

      const prompt = groundingHeader(context) + `
Draft the initial record for this past-client portfolio project.
- Choose work_types ONLY from: ${WORK_TYPE_LIST.join(' | ')}
- Choose detail_tags ONLY from: ${DETAIL_TAG_LIST.join(' | ')}
- slug: lowercase, hyphen-separated, from the title.
- seo_title: at most 60 characters. meta_description: at most 155 characters.
- target_keywords: 3-6 search phrases this case study should rank for, grounded in the source material.
- Use [NEEDS REVIEW] for any field the source material does not support, and name those fields in "missing".
- Never invent results, metrics, timelines, or services.`;

      const draft = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        file_urls: fileUrls.length ? fileUrls : undefined,
        response_json_schema: INTAKE_SCHEMA,
      });
      return Response.json({ draft, website_fetch: site.error || 'ok' });
    }

    if (action === 'generate') {
      const project = payload.project && typeof payload.project === 'object' ? payload.project : {};
      const facts = [
        `Title: ${project.title || '[NEEDS REVIEW]'}`,
        `Client: ${project.client_name || '[NEEDS REVIEW]'}`,
        `Industry: ${project.industry || '[NEEDS REVIEW]'}`,
        `Work types: ${(project.work_types || []).join(', ') || '[NEEDS REVIEW]'}`,
        `Scope of work notes: ${project.scope_of_work || ''}`,
        `Deliverables notes: ${project.deliverables || ''}`,
        `Target keywords: ${(project.target_keywords || []).join(', ')}`,
        `Uploaded asset titles and types: ${(project.asset_summaries || []).join('; ')}`,
        `Existing summary (may be partial): ${project.short_summary || ''}`,
      ].join('\n');
      const context = facts || 'No project facts were provided.';

      const prompt = groundingHeader(context) + `
Draft the case-study narrative sections from the facts above.
- 2 to 4 sentences per section. The summary is one or two sentences.
- deliverables: one deliverable per line, no bullets or numbering, drawn only from the facts.
- Use [NEEDS REVIEW] for any section the facts do not support, and name those sections in "missing".
- Never invent results, metrics, timelines, or client quotes.`;

      const narrative = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: NARRATIVE_SCHEMA,
      });
      return Response.json({ narrative });
    }

    if (action === 'rewrite') {
      const text = typeof payload.text === 'string' ? payload.text.trim().slice(0, 4000) : '';
      const strength = ['light', 'moderate', 'strong'].includes(payload.strength) ? payload.strength : 'light';
      const context = typeof payload.context === 'string' ? payload.context.trim().slice(0, 2000) : '';
      if (!text) return Response.json({ error: 'There is no text to rewrite yet.' }, { status: 400 });

      const prompt = groundingHeader(context || 'The original text below is the only source material.') + `
${STRENGTH_INSTRUCTIONS[strength]}
Keep the result under the same length as the original. Return only the rewritten text.

Original text:
${text}`;

      const rewritten = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: REWRITE_SCHEMA,
      });
      return Response.json({ text: rewritten.text });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('portfolio-draft error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}