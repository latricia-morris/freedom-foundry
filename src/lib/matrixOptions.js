// The Marketing Masterplan option library, by parent category. These are the
// platforms, formats, tools, tactics, and objectives a review can reference —
// used only inside intake/admin controls. Selecting an option records what the
// business uses, considers, or does not apply; it is never an assessment and
// never auto-published. The published report shows findings, not this library.

export const USE_STATES = [
  { key: 'uses_now', label: 'Uses now' },
  { key: 'considering', label: 'Considering' },
  { key: 'unknown', label: 'Unknown' },
  { key: 'not_used', label: 'Not used' },
  { key: 'not_applicable', label: 'Not applicable' },
  { key: 'other', label: 'Other' },
];

export const CATEGORY_OPTIONS = {
  social_media: ['Facebook', 'Instagram', 'X/Twitter', 'LinkedIn', 'Pinterest', 'YouTube', 'Organic content', 'Engagement'],
  email_marketing: ['Newsletters', 'Automated campaigns', 'Segmentation'],
  local_network: ['Business groups', 'Community relationships', 'Networking', 'Local introductions'],
  website_seo: ['Search visibility', 'Website experience', 'Conversion paths'],
  content_marketing: ['Articles', 'Videos', 'Podcasts', 'Infographics', 'Guest content'],
  online_advertising: ['Paid search', 'Paid social', 'Retargeting', 'Conversion tracking'],
  public_relations: ['Press releases', 'Media outreach', 'Storytelling', 'Reputation'],
  partnerships: ['Cross-promotions', 'Affiliates', 'Co-branded initiatives', 'Strategic alliances'],
  events_workshops: ['Webinars', 'Workshops', 'Conferences', 'Meetups', 'Speaking'],
  direct_sales_retail: ['E-commerce', 'Physical stores', 'Pop-ups', 'Customer experience', 'Merchandising'],
};