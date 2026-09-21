// Locked client intake definitions for the Digital Brand Health
// consultant-led reviews. The client completes intake only — the consultant
// performs the review, scores, and publishes. Shared by the client intake
// form and the consultant-side intake viewer so the two can never drift.

export const INTAKE_FIELDS = {
  website_discoverability: {
    title: 'Website Discoverability Intake',
    required: [
      { key: 'business_name', label: 'Business name' },
      { key: 'website_url', label: 'Website URL' },
      { key: 'industry_niche', label: 'Industry / niche' },
      { key: 'primary_offer', label: 'Primary offer' },
      { key: 'primary_buyer', label: 'Primary buyer' },
      { key: 'primary_location', label: 'Primary location / service area' },
      { key: 'business_model', label: 'Business model', options: ['Local', 'Regional', 'National', 'Online', 'Hybrid'] },
      { key: 'primary_goal', label: 'Primary business goal for the next 6–12 months' },
      { key: 'primary_lead_source', label: 'Current primary lead source' },
      { key: 'gbp_url', label: 'Google Business Profile URL (if applicable)' },
      { key: 'social_urls', label: 'Main social / profile URLs' },
      { key: 'discoverability_concern', label: 'Known discoverability or trust concern' },
      { key: 'preferred_contact', label: 'Preferred contact method' }
    ],
    optional: [
      { key: 'competitors', label: 'Main competitors' },
      { key: 'keyword_phrases', label: 'Relevant keyword / service phrases' },
      { key: 'directories', label: 'Relevant directories / listings' },
      { key: 'seo_provider', label: 'Current SEO / marketing provider' },
      { key: 'existing_reports', label: 'Existing reports / documents' },
      { key: 'analytics_available', label: 'Analytics / Search Console availability' }
    ]
  },
  conversion_readiness: {
    title: 'Conversion Readiness Intake',
    required: [
      { key: 'website_url', label: 'Website URL' },
      { key: 'conversion_goal', label: 'Primary conversion goal', options: ['Inquiry', 'Booking', 'Application', 'Purchase', 'Download/opt-in', 'Phone call', 'Store visit', 'Other'] },
      { key: 'pages_to_review', label: 'Primary page(s) to review' },
      { key: 'intended_audience', label: 'Intended audience' },
      { key: 'main_offer', label: 'Main offer / service' },
      { key: 'desired_action', label: 'Desired visitor action' },
      { key: 'traffic_sources', label: 'Main traffic sources', options: ['Search', 'Google Business Profile', 'Social', 'Email', 'Referral', 'Paid media', 'Direct', 'Other'] },
      { key: 'conversion_concern', label: 'Known website / conversion concern' },
      { key: 'buyer_objections', label: 'Common buyer objections' },
      { key: 'existing_process', label: 'Existing inquiry / booking / sales process' }
    ],
    optional: [
      { key: 'analytics_availability', label: 'Analytics availability' },
      { key: 'conversion_metrics', label: 'Conversion metrics' },
      { key: 'paid_campaigns', label: 'Paid campaigns / landing pages' },
      { key: 'referral_sources', label: 'Relevant referral sources' },
      { key: 'crm_platform', label: 'CRM / email platform' },
      { key: 'monthly_traffic', label: 'Current monthly traffic' },
      { key: 'sales_volume', label: 'Current inquiry / booking / sales volume' },
      { key: 'existing_website_reports', label: 'Existing website reports' }
    ]
  }
};

/** Fields rendered as multi-line text areas rather than single-line inputs. */
export const LONG_INTAKE_FIELDS = new Set([
  'primary_goal',
  'social_urls',
  'discoverability_concern',
  'competitors',
  'keyword_phrases',
  'directories',
  'existing_reports',
  'pages_to_review',
  'buyer_objections',
  'existing_process',
  'conversion_metrics',
  'paid_campaigns',
  'existing_website_reports'
]);