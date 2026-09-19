/**
 * Portfolio & case-study shared logic: category lists, filename parsing,
 * SEO drafting, publish checklist, display helpers.
 */

export const SERVICE_CATEGORIES = [
  'Brand Strategy',
  'Rebranding',
  'Brand Identity',
  'Logo Design',
  'Messaging & Copywriting',
  'Website Design',
  'Website Copywriting',
  'UX / UI and Digital Experience',
  'Print Collateral',
  'Packaging',
  'Event / Trade Show Design',
  'Social and Campaign Creative',
  'Email and Digital Marketing Assets',
];

export const ASSET_TYPES = [
  { value: 'featured_image', label: 'Featured image' },
  { value: 'brand_guidelines', label: 'Brand guidelines / brand book' },
  { value: 'logo_primary', label: 'Primary logos' },
  { value: 'logo_alternate', label: 'Alternate logo marks' },
  { value: 'logo_variations', label: 'Logo variations' },
  { value: 'color_palette', label: 'Color palette assets' },
  { value: 'typography', label: 'Typography / font-kit visuals' },
  { value: 'pattern_icons', label: 'Brand pattern, icon, or illustration' },
  { value: 'web_screenshot', label: 'Website screenshots' },
  { value: 'web_mobile', label: 'Mobile website screenshots' },
  { value: 'web_video', label: 'Website walkthrough or launch video' },
  { value: 'ux_ui', label: 'UX / UI screens' },
  { value: 'wireframes', label: 'Wireframes or process visuals' },
  { value: 'business_cards', label: 'Business cards' },
  { value: 'letterhead', label: 'Letterhead and stationery' },
  { value: 'brochures', label: 'Brochures' },
  { value: 'pamphlets', label: 'Pamphlets' },
  { value: 'sell_sheets', label: 'Sell sheets' },
  { value: 'flyers', label: 'Flyers' },
  { value: 'decks', label: 'Presentation decks' },
  { value: 'reports', label: 'Reports' },
  { value: 'custom_documents', label: 'Custom documents' },
  { value: 'signage', label: 'Signage' },
  { value: 'environmental', label: 'Vehicle / environmental graphics' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'labels', label: 'Labels' },
  { value: 'event_materials', label: 'Trade-show / event materials' },
  { value: 'social_templates', label: 'Social media templates' },
  { value: 'social_graphics', label: 'Social media graphics' },
  { value: 'ad_creative', label: 'Paid ad creative' },
  { value: 'email_templates', label: 'Email templates' },
  { value: 'digital_ads', label: 'Digital ads' },
  { value: 'campaign_visuals', label: 'Campaign visuals' },
  { value: 'photography', label: 'Photography' },
  { value: 'video', label: 'Video' },
  { value: 'before_after', label: 'Before-and-after assets' },
  { value: 'other', label: 'Other / custom asset category' },
];

export const ASSET_TYPE_LABELS = Object.fromEntries(ASSET_TYPES.map((t) => [t.value, t.label]));

export const DELIVERABLE_CATEGORIES = [
  'Brand Guidelines',
  'Logos & Identity Marks',
  'Color Palette',
  'Typography',
  'Patterns & Icons',
  'Website',
  'UX / UI',
  'Website Copy',
  'Print Collateral',
  'Packaging',
  'Events & Trade Shows',
  'Social',
  'Email',
  'Ads & Campaigns',
  'Photography',
  'Video',
  'Decks & Documents',
  'Before & After',
  'Other',
];

export const IMAGE_ASSET_TYPES = new Set([
  'featured_image', 'logo_primary', 'logo_alternate', 'logo_variations',
  'color_palette', 'typography', 'pattern_icons', 'web_screenshot', 'web_mobile',
  'ux_ui', 'wireframes', 'business_cards', 'letterhead', 'brochures',
  'pamphlets', 'sell_sheets', 'flyers', 'signage', 'environmental',
  'packaging', 'labels', 'event_materials', 'social_templates',
  'social_graphics', 'ad_creative', 'email_templates', 'digital_ads',
  'campaign_visuals', 'photography', 'before_after',
]);

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function displayYear(project) {
  if (project?.project_year) return String(project.project_year);
  const stamp = project?.updated_date || project?.created_date;
  return stamp ? String(new Date(stamp).getFullYear()) : '';
}

/** True when the public "Visit Site" button may be shown. */
export function websiteVisible(project) {
  return Boolean(
    project?.client_website_url
    && project?.website_public
    && ['reachable', 'redirecting'].includes(project?.website_link_status),
  );
}

/* ── Bulk-upload filename parsing ────────────────────────────────────────────
 * Expected convention: client-project-asset-type-description-01.ext
 * Suggestions only — every row is confirmed on the review screen. */

const FILENAME_TOKENS = {
  featured: 'featured_image', hero: 'featured_image',
  guidelines: 'brand_guidelines', brandbook: 'brand_guidelines',
  logo: 'logo_primary', wordmark: 'logo_primary',
  web: 'web_screenshot', homepage: 'web_screenshot', site: 'web_screenshot',
  desktop: 'web_screenshot', mobile: 'web_mobile', walkthrough: 'web_video',
  ux: 'ux_ui', ui: 'ux_ui', wireframe: 'wireframes', process: 'wireframes',
  card: 'business_cards', stationery: 'letterhead', letterhead: 'letterhead',
  brochure: 'brochures', pamphlet: 'pamphlets', sell: 'sell_sheets',
  flyer: 'flyers', deck: 'decks', presentation: 'decks', report: 'reports',
  doc: 'custom_documents', signage: 'signage', vehicle: 'environmental',
  environmental: 'environmental', packaging: 'packaging', label: 'labels',
  event: 'event_materials', tradeshow: 'event_materials',
  social: 'social_graphics', template: 'social_templates',
  email: 'email_templates', ad: 'ad_creative', ads: 'digital_ads',
  campaign: 'campaign_visuals', photo: 'photography', video: 'video',
  before: 'before_after', color: 'color_palette', palette: 'color_palette',
  font: 'typography', type: 'typography', pattern: 'pattern_icons',
  icon: 'pattern_icons',
};

function capitalize(token) {
  return token ? token.charAt(0).toUpperCase() + token.slice(1) : token;
}

export function parseAssetFilename(filename) {
  const original = String(filename || '');
  const base = original.replace(/\.[^.]+$/, '');
  const tokens = base.split(/[-_\s]+/).filter(Boolean).map((t) => t.toLowerCase());
  let assetType = 'other';
  let descriptionTokens = tokens.length > 2 ? tokens.slice(2) : [...tokens];

  const matchIndex = tokens.findIndex((t) => FILENAME_TOKENS[t]);
  if (matchIndex >= 0) {
    assetType = FILENAME_TOKENS[tokens[matchIndex]];
    descriptionTokens = tokens.slice(matchIndex + 1);
  }

  let sortHint = null;
  let titleTokens = [...descriptionTokens];
  const last = titleTokens[titleTokens.length - 1];
  if (last && /^\d+$/.test(last)) {
    sortHint = parseInt(last, 10);
    titleTokens = titleTokens.slice(0, -1);
  }

  const title = titleTokens.length
    ? titleTokens.map(capitalize).join(' ')
    : capitalize(base);
  return { assetType, title, sortHint, originalFilename: original };
}

/* ── SEO draft (editable template — never auto-published) ─────────────────── */

export function seoDraft(project) {
  const category = project.primary_service_category
    || (project.service_categories || [])[0]
    || 'Brand';
  const client = project.client_name || project.title || 'Client';
  const seoTitle = `${client} — ${category} Case Study | Freedom Foundry`.slice(0, 60);
  const summary = (project.short_summary || `${client} ${category.toLowerCase()} work by Freedom Foundry.`).trim();
  const metaDescription = summary.length > 155 ? `${summary.slice(0, 152).trimEnd()}...` : summary;
  return {
    seo_title: seoTitle,
    meta_description: metaDescription,
    og_title: `${client} — ${category}`,
    og_description: metaDescription,
  };
}

/* ── Pre-publish checklist ─────────────────────────────────────────────────── */

export function publishChecklist(project, publicAssets = []) {
  const publicImages = (publicAssets || []).filter((a) => a.file_url);
  const featured = publicImages.find((a) => a.asset_type === 'featured_image') || publicImages[0];
  return [
    { key: 'title', label: 'Title completed', pass: Boolean((project.title || '').trim()) },
    { key: 'client', label: 'Client name completed', pass: Boolean((project.client_name || '').trim()) },
    { key: 'slug', label: 'URL slug completed', pass: Boolean((project.slug || '').trim()) },
    { key: 'summary', label: 'Case-study summary completed', pass: Boolean((project.short_summary || '').trim()) },
    { key: 'category', label: 'At least one service category selected', pass: (project.service_categories || []).length > 0 },
    { key: 'featured', label: 'At least one public featured image', pass: Boolean(featured) },
    { key: 'alt', label: 'Alt text completed for public images', pass: publicImages.length > 0 && publicImages.every((a) => (a.alt_text || '').trim()) },
    { key: 'meta', label: 'Meta title and description reviewed', pass: Boolean((project.seo_title || '').trim() && (project.meta_description || '').trim()) },
    { key: 'visibility', label: 'Visibility settings reviewed', pass: Boolean(project.visibility_reviewed) },
  ];
}