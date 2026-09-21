import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Admin-only: turns a pasted or uploaded AI visibility audit into a strict
// six-category structured draft. Unstated values come back null, never guessed.
const EXTRACTION_SCHEMA = {
  type: 'object',
  properties: {
    composite_score: { anyOf: [{ type: 'integer' }, { type: 'null' }] },
    category_scores: {
      type: 'object',
      properties: {
        entity_recognition: { anyOf: [{ type: 'integer' }, { type: 'null' }] },
        structured_data: { anyOf: [{ type: 'integer' }, { type: 'null' }] },
        trusted_source_citations: { anyOf: [{ type: 'integer' }, { type: 'null' }] },
        topical_authority: { anyOf: [{ type: 'integer' }, { type: 'null' }] },
        documented_outcomes: { anyOf: [{ type: 'integer' }, { type: 'null' }] },
        social_channel_presence: { anyOf: [{ type: 'integer' }, { type: 'null' }] },
      },
      additionalProperties: false,
    },
    key_findings: { type: 'array', items: { type: 'string' } },
    recommended_fixes: { type: 'array', items: { type: 'string' } },
    competitors_mentioned: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          positioning: { type: 'string' },
        },
        required: ['name'],
        additionalProperties: false,
      },
    },
    report_date_mentioned: { anyOf: [{ type: 'string' }, { type: 'null' }] },
  },
  required: [
    'composite_score',
    'category_scores',
    'key_findings',
    'recommended_fixes',
    'competitors_mentioned',
    'report_date_mentioned',
  ],
};

const PROMPT = `You will receive raw text from an AI-generated brand visibility audit. Extract the following into strict JSON. If a value is not clearly stated in the text, return null for that field. Do not guess or estimate.

Required JSON shape:
{
  "composite_score": integer or null,
  "category_scores": {
    "entity_recognition": integer or null,
    "structured_data": integer or null,
    "trusted_source_citations": integer or null,
    "topical_authority": integer or null,
    "documented_outcomes": integer or null,
    "social_channel_presence": integer or null
  },
  "key_findings": [array of short strings],
  "recommended_fixes": [array of short strings],
  "competitors_mentioned": [array of {name, positioning}],
  "report_date_mentioned": string or null
}

Notes:
- Some audits score five categories out of 20 points each and omit structured data or social channel presence entirely. For any of the six categories the text does not clearly score, return null for that category.
- key_findings and recommended_fixes must be short plain-language strings taken directly from the text.
- competitors_mentioned: each object needs a name and a short positioning description. Return an empty array if none are mentioned.
Return only the JSON object, no other text.`;

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const payload = await req.json().catch(() => ({}));
    const rawText = (payload.raw_text || '').trim();
    const fileUrl = (payload.file_url || '').trim();
    if (!rawText && !fileUrl) {
      return Response.json({ error: 'Provide pasted audit text or an uploaded report file.' }, { status: 400 });
    }

    const prompt = rawText ? `${PROMPT}\n\n--- AUDIT TEXT ---\n${rawText}` : PROMPT;
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      file_urls: fileUrl ? [fileUrl] : undefined,
      response_json_schema: EXTRACTION_SCHEMA,
    });
    const draft = result?.data ?? result;

    return Response.json({
      draft,
      confidence_flags: Object.entries(draft?.category_scores || {})
        .filter(([, value]) => value === null || value === undefined)
        .map(([key]) => key),
    });
  } catch (error) {
    console.error('visibility-extract failed', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}