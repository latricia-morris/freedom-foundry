import { BASELINE_FIELDS } from '@/lib/matrix';

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
  },
  marketing_matrix: {
    title: 'Marketing Matrix Intake',
    required: [
      { key: 'business_name', label: 'Business name' },
      { key: 'website_url', label: 'Website URL' },
      { key: 'industry', label: 'Industry' },
      { key: 'niche_specialty', label: 'Niche / specialty' },
      { key: 'business_model', label: 'Business model', options: ['Local service', 'Product / e-commerce', 'B2B / professional services', 'Online / digital', 'Recurring / subscription', 'Hybrid', 'Other'] },
      { key: 'primary_offer', label: 'Primary offer' },
      { key: 'offer_type', label: 'Offer type', options: ['One-time service', 'Recurring service', 'Project-based', 'Product', 'Retainer', 'Program / course', 'Licensing', 'Other'] },
      { key: 'primary_buyer', label: 'Primary buyer' },
      { key: 'primary_decision_makers', label: 'Primary decision-maker(s)' },
      { key: 'buyer_trigger', label: 'Buyer trigger — what causes the buyer to start looking?' },
      { key: 'purchase_urgency', label: 'Purchase urgency', options: ['Immediate', 'Short-term', 'Considered', 'Long-cycle', 'Seasonal', 'Ongoing / recurring'] },
      { key: 'buying_cycle_length', label: 'Typical buying-cycle length' },
      { key: 'average_customer_value', label: 'Average customer / client value' },
      { key: 'geographic_market', label: 'Geographic market', options: ['Local', 'Regional', 'National', 'Online', 'Hybrid'] },
      { key: 'brand_positioning', label: 'Brand positioning', options: ['Premium', 'Specialist', 'Accessible', 'Legacy / local', 'Disruptive', 'Category-creating', 'Other'] },
      { key: 'goal_90_days', label: 'Main business / revenue goal for the next 90 days' },
      { key: 'goal_12_months', label: 'Main business / revenue goal for the next 12 months' },
      { key: 'strongest_lead_sources', label: 'Current strongest lead sources' },
      { key: 'lowest_quality_lead_sources', label: 'Current lowest-quality lead sources' },
      { key: 'active_channels', label: 'Current active marketing channels' },
      { key: 'underperforming_channels', label: 'Channels you believe should work but are not working' },
      { key: 'team_capacity', label: 'Current team / capacity level' },
      { key: 'available_resources_90_days', label: 'Available time / resources for the next 90 days' },
      { key: 'marketing_budget', label: 'Approximate marketing budget' },
      { key: 'crm_email_system', label: 'Current CRM / email system' },
      { key: 'analytics_tools', label: 'Current analytics / tracking tools' },
      { key: 'retention_referral_process', label: 'Current customer retention / referral process' },
      { key: 'buyer_objections', label: 'Top buyer objections / hesitations' },
      { key: 'primary_conversion_action', label: 'Primary conversion action', options: ['Call', 'Booking', 'Inquiry', 'Application', 'Purchase', 'Store visit', 'Other'] }
    ],
    baseline: BASELINE_FIELDS,
    optional: [
      { key: 'historical_channel_metrics', label: 'Historical channel metrics' },
      { key: 'monthly_traffic', label: 'Current monthly traffic' },
      { key: 'lead_volume', label: 'Current lead volume' },
      { key: 'sales_volume', label: 'Current sales volume' },
      { key: 'close_rate', label: 'Current close rate' },
      { key: 'average_sales_cycle', label: 'Average sales cycle' },
      { key: 'existing_campaigns', label: 'Existing campaigns' },
      { key: 'existing_partnerships', label: 'Existing partnerships' },
      { key: 'existing_events', label: 'Existing events' },
      { key: 'existing_pr_media', label: 'Existing PR / media' },
      { key: 'existing_referral_partners', label: 'Existing referral partners' },
      { key: 'email_list_size', label: 'Current email-list size' },
      { key: 'social_audience', label: 'Current social / community audience' },
      { key: 'marketing_plans_assets', label: 'Marketing plans / reports / assets to share' }
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
  'existing_website_reports',
  'primary_decision_makers',
  'goal_90_days',
  'goal_12_months',
  'strongest_lead_sources',
  'lowest_quality_lead_sources',
  'active_channels',
  'underperforming_channels',
  'team_capacity',
  'available_resources_90_days',
  'retention_referral_process',
  'historical_channel_metrics',
  'existing_campaigns',
  'existing_partnerships',
  'existing_events',
  'existing_pr_media',
  'existing_referral_partners',
  'marketing_plans_assets',
  'baseline_visibility',
  'baseline_credibility',
  'baseline_consistency',
  'baseline_competitive_advantage'
]);