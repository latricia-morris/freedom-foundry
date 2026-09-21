/**
 * Portfolio & case-study shared logic: the six public work types,
 * internal detail tags, legacy category remapping, asset families,
 * readiness scoring, keyword application, filename parsing, display helpers.
 */

export const WORK_TYPES = [
  'Branding & Rebranding',
  'Brand Refresh',
  'Brand Identity & Design',
  'Brand Strategy',
  'Web Design & Digital Presence',
  'Marketing & Brand Presence Management',
];

export const DETAIL_TAGS = [
  'Logos',
  'Brand Guidelines',
  'Color & Typography',
  'Print Collateral',
  'Social Graphics',
  'UX/UI',
  'Copy',
  'Emails',
  'Packaging',
  'Events & Trade Shows',
  'Photography',
  'Video',
  'Decks & Documents',
];

/* ── Legacy category remapping ────────────────────────────────────────────────
 * Old service / deliverable labels map onto the six public work types and the
 * internal detail tags. Used once for migration and as a read-time fallback. */

export const LEGACY_SERVICE_TO_WORK_TYPE = {
  'Brand Strategy': 'Brand Strategy',
  'Rebranding': 'Branding & Rebranding',
  'Brand Identity': 'Brand Identity & Design',
  'Logo Design': 'Brand Identity & Design',
  'Messaging & Copywriting': 'Marketing & Brand Presence Management',
  'Website Design': 'Web Design & Digital Presence',
  'Website Copywriting': 'Marketing & Brand Presence Management',
  'UX / UI and Digital Experience': 'Web Design & Digital Presence',
  'Print Collateral': 'Brand Identity & Design',
  'Packaging': 'Brand Identity & Design',
  'Event / Trade Show Design': 'Brand Identity & Design',
  'Social and Campaign Creative': 'Marketing & Brand Presence Management',
  'Email and Digital Marketing Assets': 'Marketing & Brand Presence Management',
};

export const LEGACY_DELIVERABLE_TO_WORK_TYPE = {
  'Brand Guidelines': 'Brand Identity & Design',
  'Logos & Identity Marks': 'Brand Identity & Design',
  'Color Palette': 'Brand Identity & Design',
  'Typography': 'Brand Identity & Design',
  'Patterns & Icons': 'Brand Identity & Design',
  'Website': 'Web Design & Digital Presence',
  'UX / UI': 'Web Design & Digital Presence',
  'Website Copy': 'Marketing & Brand Presence Management',
  'Print Collateral': 'Brand Identity & Design',
  'Packaging': 'Brand Identity & Design',
  'Events & Trade Shows': 'Brand Identity & Design',
  'Social': 'Marketing & Brand Presence Management',
  'Email': 'Marketing & Brand Presence Management',
  'Ads & Campaigns': 'Marketing & Brand Presence Management',
};

const LEGACY_DELIVERABLE_TO_DETAIL = {
  'Logos & Identity Marks': 'Logos',
  'Brand Guidelines': 'Brand Guidelines',
  'Color Palette': 'Color & Typography',
  'Typography': 'Color & Typography',
  'Print Collateral': 'Print Collateral',
  'Social': 'Social Graphics',
  'Ads & Campaigns': 'Social Graphics',
  'UX / UI': 'UX/UI',
  'Website Copy': 'Copy',
  'Email': 'Emails',
  'Packaging': 'Packaging',
  'Events & Trade Shows': 'Events & Trade Shows',
  'Photography': 'Photography',
  'Video': 'Video',
  'Decks & Documents': 'Decks & Documents',
};

function addUnique(list, value) {
  if (value && !list.includes(value)) list.push(value);
}

/** Legacy service/deliverable categories → the six public work types + primary. */
export function remapWorkTypes(serviceCategories = [], deliverableCategories = [], primaryServiceCategory = '') {
  const workTypes = [];
  for (const category of serviceCategories || []) {
    addUnique(workTypes, WORK_TYPES.includes(category) ? category : LEGACY_SERVICE_TO_WORK_TYPE[category]);
  }
  for (const category of deliverableCategories || []) {
    addUnique(workTypes, WORK_TYPES.includes(category) ? category : LEGACY_DELIVERABLE_TO_WORK_TYPE[category]);
  }
  let primary = '';
  if (primaryServiceCategory) {
    primary = WORK_TYPES.includes(primaryServiceCategory)
      ? primaryServiceCategory
      : (LEGACY_SERVICE_TO_WORK_TYPE[primaryServiceCategory] || '');
  }
  return { work_types: workTypes, primary_work_type: primary || workTypes[0] || '' };
}

/** Legacy deliverable categories → internal detail tags. */
export function remapDetailTags(deliverableCategories = []) {
  const tags = [];
  for (const category of deliverableCategories || []) {
    addUnique(tags, DETAIL_TAGS.includes(category) ? category : LEGACY_DELIVERABLE_TO_DETAIL[category]);
  }
  return tags;
}

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

export const IMAGE_ASSET_TYPES = new Set([
  'featured_image', 'logo_primary', 'logo_alternate', 'logo_variations',
  'color_palette', 'typography', 'pattern_icons', 'web_screenshot', 'web_mobile',
  'ux_ui', 'wireframes', 'business_cards', 'letterhead', 'brochures',
  'pamphlets', 'sell_sheets', 'flyers', 'signage', 'environmental',
  'packaging', 'labels', 'event_materials', 'social_templates',
  'social_graphics', 'ad_creative', 'email_templates', 'digital_ads',
  'campaign_visuals', 'photography', 'before_after',
]);

/* ── Asset families — grouped gallery presentation ─────────────────────────── */

export const ASSET_FAMILIES = [
  { key: 'identity', label: 'Brand Identity' },
  { key: 'web', label: 'Web & UX' },
  { key: 'print', label: 'Print & Packaging' },
  { key: 'marketing', label: 'Social & Marketing' },
  { key: 'media', label: 'Photo & Video' },
  { key: 'documents', label: 'Documents' },
  { key: 'other', label: 'Other' },
];

const FAMILY_BY_TYPE = {
  brand_guidelines: 'documents',
  logo_primary: 'identity', logo_alternate: 'identity', logo_variations: 'identity',
  color_palette: 'identity', typography: 'identity', pattern_icons: 'identity',
  web_screenshot: 'web', web_mobile: 'web', web_video: 'web', ux_ui: 'web', wireframes: 'web',
  business_cards: 'print', letterhead: 'print', brochures: 'print', pamphlets: 'print',
  sell_sheets: 'print', flyers: 'print', signage: 'print', environmental: 'print',
  packaging: 'print', labels: 'print', event_materials: 'print',
  social_templates: 'marketing', social_graphics: 'marketing', ad_creative: 'marketing',
  email_templates: 'marketing', digital_ads: 'marketing', campaign_visuals: 'marketing',
  photography: 'media', video: 'media',
  decks: 'documents', reports: 'documents', custom_documents: 'documents',
};

/** Group assets by family, in fixed family order. */
export function groupAssetsByFamily(assets) {
  return ASSET_FAMILIES
    .map((family) => ({
      ...family,
      items: (assets || []).filter((a) => (FAMILY_BY_TYPE[a.asset_type] || 'other') === family.key),
    }))
    .filter((family) => family.items.length > 0);
}

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Slugify a base, avoiding collisions with other projects. */
export function uniqueSlug(base, projects = [], selfId = null) {
  const slug = slugify(base);
  if (!slug) return '';
  const taken = new Set(
    (projects || []).filter((p) => p.id !== selfId).map((p) => p.slug).filter(Boolean),
  );
  if (!taken.has(slug)) return slug;
  let n = 2;
  while (taken.has(`${slug}-${n}`)) n += 1;
  return `${slug}-${n}`;
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

function prettifyBase(base) {
  return base
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(capitalize)
    .join(' ');
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
    : prettifyBase(base) || 'Brand asset';
  return { assetType, title, sortHint, originalFilename: original };
}

/* ── SEO draft (editable template — never auto-published) ─────────────────── */

export function seoDraft(project) {
  const category = project.primary_service_category
    || (project.work_types || [])[0]
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

/* ── Readiness scoring (only missing titles block publishing) ──────────────── */

export function readiness(project, publicAssets = []) {
  const blockers = [];
  if (!(project.title || '').trim()) blockers.push('Project title is required before publishing.');

  const publicImages = (publicAssets || []).filter((a) => a.file_url);
  const featuredImage = project.featured_image_url
    || (publicImages.find((a) => a.asset_type === 'featured_image') || publicImages[0] || {}).file_url
    || '';

  const recommendations = [
    { key: 'client', label: 'Add the client name', pass: Boolean((project.client_name || '').trim()) },
    { key: 'summary', label: 'Write the case-study summary', pass: Boolean((project.short_summary || '').trim()) },
    { key: 'work_types', label: 'Select the work types', pass: (project.work_types || []).length > 0 },
    { key: 'featured', label: 'Choose a featured image', pass: Boolean(featuredImage) },
    { key: 'alt', label: 'Add alt text to public images', pass: publicImages.length > 0 && publicImages.every((a) => (a.alt_text || '').trim()) },
    { key: 'meta', label: 'Review the SEO title and meta description', pass: Boolean((project.seo_title || '').trim() && (project.meta_description || '').trim()) },
    { key: 'keywords', label: 'Mark target keywords for search', pass: (project.target_keywords || []).length > 0 },
    { key: 'visibility', label: 'Review the visibility settings', pass: Boolean(project.visibility_reviewed) },
  ];
  const passed = recommendations.filter((r) => r.pass).length;
  return { blockers, recommendations, score: Math.round((passed / recommendations.length) * 100) };
}

/* ── Keyword application — where target keywords land in public output ────── */

export function keywordApplications(project) {
  const surfaces = {
    'Title tag': project.seo_title || '',
    'Meta description': project.meta_description || '',
    'URL slug': project.slug || '',
    'Headings': [project.title, project.short_summary].filter(Boolean).join(' '),
  };
  return (project.target_keywords || []).map((keyword) => ({
    keyword,
    applied: Object.entries(surfaces)
      .filter(([, text]) => keyword && text.toLowerCase().includes(keyword.toLowerCase()))
      .map(([label]) => label),
  }));
}