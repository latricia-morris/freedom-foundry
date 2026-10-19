// The ten fixed parent categories of the Marketing Matrix report, in report
// order. Platforms and tactics live beneath them and are never parents.
export const MATRIX_PARENT_CATEGORIES = [
  { key: 'social_media', num: '01', name: 'Social Media' },
  { key: 'email_marketing', num: '02', name: 'Email Marketing' },
  { key: 'local_network', num: '03', name: 'Local Network' },
  { key: 'website_seo', num: '04', name: 'Website & SEO' },
  { key: 'content_marketing', num: '05', name: 'Content Marketing' },
  { key: 'online_advertising', num: '06', name: 'Online Advertising' },
  { key: 'public_relations', num: '07', name: 'Public Relations' },
  { key: 'partnerships', num: '08', name: 'Partnerships & Collaborations' },
  { key: 'events_workshops', num: '09', name: 'Events & Workshops' },
  {
    key: 'direct_sales_retail',
    num: '10',
    name: 'Direct Sales & Retail',
    descriptor: 'Experience, Environment, Foot Traffic',
  },
];

// What a future review of each category looks at — used only for categories
// with no assessed activity, so an empty state explains what remains unknown
// without inventing findings or advice.
export const CATEGORY_REVIEW_LENS = {
  social_media: 'each platform’s role, the effort it receives, and what it produces',
  email_marketing: 'what is sent, how often, and what it produces',
  local_network: 'which local professional relationships exist and what they produce',
  website_seo: 'how buyers find you, and what they do once they arrive',
  content_marketing: 'what is published, for whom, and where each asset leads',
  online_advertising: 'where paid effort goes and what it returns',
  public_relations: 'the coverage and proof that exists, and how visible it is where buyers look',
  partnerships: 'who refers and collaborates with you, and what those relationships produce',
  events_workshops: 'stage selection, audience fit, and what follow-up captures',
  direct_sales_retail: 'the buying experience, the environment, and foot traffic',
};

// Consultant-approved mapping for channels already in the system, keyed by the
// exact stored channel name. Anything not listed falls through to the
// category-string keywords below.
const NAME_OVERRIDES = {
  'website & organic search': 'website_seo',
  'google business profile / local': 'website_seo',
  'linkedin (founder/personal)': 'social_media',
  'instagram (@the.brand.revivalist)': 'social_media',
  facebook: 'social_media',
  'podcast (the brand revivalist)': 'content_marketing',
  'youtube (@brandrevivalist)': 'content_marketing',
  'media features / pr': 'public_relations',
  'speaking & events': 'events_workshops',
  'referrals & word of mouth': 'partnerships',
};

const CATEGORY_KEYWORDS = [
  [/search|google business|seo|local listing/i, 'website_seo'],
  [/social/i, 'social_media'],
  [/podcast|audio|video|content/i, 'content_marketing'],
  [/editorial|press|\bpr\b/i, 'public_relations'],
  [/event|speaking|workshop|in-person/i, 'events_workshops'],
  [/relational|referral|partner/i, 'partnerships'],
  [/email|newsletter|nurture/i, 'email_marketing'],
  [/network/i, 'local_network'],
  [/paid|advertis/i, 'online_advertising'],
  [/sales|retail|store|foot traffic/i, 'direct_sales_retail'],
];

// Mappings made by interpretation rather than an explicit category. Surfaced
// for admin review, never silently treated as confirmed.
export const FLAGGED_MAPPINGS = ['Referrals & Word of Mouth'];

/** Parent category for a channel: { key, flagged }. key is null when unmapped. */
export function parentCategoryFor(channel) {
  const name = String((channel && channel.channel_name) || '').toLowerCase();
  const cat = String((channel && channel.category) || '').toLowerCase();
  const flagged = FLAGGED_MAPPINGS.includes(channel && channel.channel_name);
  if (NAME_OVERRIDES[name]) return { key: NAME_OVERRIDES[name], flagged };
  for (const [re, key] of CATEGORY_KEYWORDS) {
    if (re.test(cat) || re.test(name)) return { key, flagged };
  }
  return { key: null, flagged: false };
}

export function categoryAnchor(key) {
  return `mx-cat-${String(key).replace(/_/g, '-')}`;
}

/** Group client-shaped channels into the ten fixed parent categories. */
export function groupChannelsByCategory(channels) {
  const groups = {};
  for (const c of MATRIX_PARENT_CATEGORIES) groups[c.key] = [];
  const unmapped = [];
  for (const ch of channels || []) {
    const { key } = parentCategoryFor(ch);
    if (key && groups[key]) groups[key].push(ch);
    else unmapped.push(ch);
  }
  // Within a category, lead with the strongest consultant priority.
  const rank = { build: 0, scale: 1, optimize: 2, maintain: 3, test: 4, deprioritize: 5, not_applicable: 6 };
  for (const key of Object.keys(groups)) {
    groups[key].sort(
      (a, b) =>
        (rank[a.consultant_priority] ?? 9) - (rank[b.consultant_priority] ?? 9) ||
        (b.sort_order || 0) - (a.sort_order || 0),
    );
  }
  return { groups, unmapped };
}