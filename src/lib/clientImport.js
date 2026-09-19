import apiClient from '@/api/client';

export const IMPORT_FILE_TYPES = ['logo', 'design_asset', 'print_collateral', 'digital_asset', 'deliverable', 'other'];

export function guessFileType(name = '') {
  const n = name.toLowerCase();
  if (n.includes('logo')) return 'logo';
  if (/\.(pdf|ai|eps|indd)$/.test(n)) return 'print_collateral';
  if (/\.(png|jpe?g|svg|webp|gif|psd|fig)$/.test(n)) return 'design_asset';
  if (/\.(mp4|mov|zip|mp3|wav)$/.test(n)) return 'digital_asset';
  return 'other';
}

const str = { type: 'string' };

export const IMPORT_SCHEMA = {
  type: 'object',
  properties: {
    personal: {
      type: 'object',
      properties: {
        first_name: str, last_name: str,
        short_bio: str, long_bio: str,
        brand_voice: str, brand_tonality: str, positioning: str,
        heading_font: str, subheading_font: str, body_font: str, accent_font: str,
        phone: str, email: str, website: str,
        location_city: str, location_state: str, location_country: str,
        social_links: {
          type: 'array',
          items: { type: 'object', properties: { platform: str, url: str }, required: ['platform', 'url'], additionalProperties: false },
        },
        book_links: {
          type: 'array',
          items: { type: 'object', properties: { title: str, url: str }, required: ['title', 'url'], additionalProperties: false },
        },
      },
      additionalProperties: false,
    },
    corporate: {
      type: 'object',
      properties: {
        company_name: str, tagline: str, mission_statement: str,
        brand_voice: str, brand_tonality: str, brand_personality: str,
        positioning: str, target_audience: str,
        phone: str, email: str, website: str,
        location_city: str, location_state: str, location_country: str,
        colors: {
          type: 'array',
          items: { type: 'object', properties: { name: str, hex: str }, required: ['name', 'hex'], additionalProperties: false },
        },
      },
      additionalProperties: false,
    },
    guidelines: {
      type: 'object',
      properties: {
        heading_font: str, subheading_font: str, body_font: str, accent_font: str,
        logo_usage_notes: str, color_usage_notes: str, typography_notes: str,
        photography_style: str, tone_notes: str, brand_dont_list: str, additional_standards: str,
      },
      additionalProperties: false,
    },
    media_kit: {
      type: 'object',
      properties: {
        short_bio: str, long_bio: str,
        phone: str, email: str, website: str,
        location_city: str, location_state: str, location_country: str,
        social_links: {
          type: 'array',
          items: { type: 'object', properties: { platform: str, url: str }, required: ['platform', 'url'], additionalProperties: false },
        },
        feature_links: {
          type: 'array',
          items: { type: 'object', properties: { label: str, url: str }, required: ['label', 'url'], additionalProperties: false },
        },
        book_links: {
          type: 'array',
          items: { type: 'object', properties: { title: str, url: str }, required: ['title', 'url'], additionalProperties: false },
        },
      },
      additionalProperties: false,
    },
  },
  required: ['personal', 'corporate', 'guidelines', 'media_kit'],
  additionalProperties: false,
};

export function buildParsePrompt(clientLabel) {
  return [
    'You are loading a branding agency client portal from the client uploaded brand materials attached below.',
    'The files may include brand guidelines, bios, strategy documents, font notes, color specs, and similar materials.',
    'Extract the client information and place each piece of content into the matching section and field of the JSON structure.',
    'Rules:',
    '- Use the exact wording from the documents where available, lightly cleaned for clarity and consistent capitalization.',
    '- If a field is not present in the files, use an empty string "". Never invent facts, numbers, dates, or quotes.',
    '- For lists (social_links, book_links, feature_links, colors), only include entries actually found in the files.',
    '- social_links use platform + url. book_links use title + url. feature_links use label + url. colors use name + hex.',
    '- Put brand voice / tonality / positioning descriptions into their matching fields; do not duplicate content across unrelated fields.',
    `- The client is: ${clientLabel || 'a branding agency client'}.`,
  ].join('\n');
}

export async function parseClientFiles(fileUrls, clientLabel) {
  const result = await apiClient.integrations.Core.InvokeLLM({
    prompt: buildParsePrompt(clientLabel),
    file_urls: fileUrls,
    response_json_schema: IMPORT_SCHEMA,
  });
  return result || {};
}

export function normalizeDraft(raw = {}) {
  const section = (key) => (raw[key] && typeof raw[key] === 'object' ? raw[key] : {});
  const arrays = (obj, key) => (Array.isArray(obj[key]) ? obj[key].filter((row) => row && typeof row === 'object') : []);
  const personal = section('personal');
  const corporate = section('corporate');
  const guidelines = section('guidelines');
  const mediaKit = section('media_kit');
  const assets = Array.isArray(raw.assets) ? raw.assets.filter((a) => a && a.file_url) : [];
  return {
    personal: {
      ...personal,
      social_links: arrays(personal, 'social_links'),
      book_links: arrays(personal, 'book_links'),
    },
    corporate: {
      ...corporate,
      colors: arrays(corporate, 'colors'),
    },
    guidelines: { ...guidelines },
    media_kit: {
      ...mediaKit,
      social_links: arrays(mediaKit, 'social_links'),
      feature_links: arrays(mediaKit, 'feature_links'),
      book_links: arrays(mediaKit, 'book_links'),
    },
    assets,
  };
}