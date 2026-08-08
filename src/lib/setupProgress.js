export const SETUP_TASKS = [
  {
    key: 'big_picture',
    label: 'Big Picture',
    path: '/brand-portal/big-picture',
    cta: 'Establish your Big Picture vision',
    fields: [
      'word_for_the_year', 'end_of_year_goal', 'annual_revenue', 'monthly_revenue',
      'weekly_revenue', 'impact_statement', 'legacy_statement',
      'vision_health', 'vision_career', 'vision_family', 'vision_money',
      'vision_travels', 'vision_hobbies', 'vision_relationships',
      'breakdown_goal', 'breakdown_components', 'breakdown_priorities',
      'breakdown_monthly_target', 'breakdown_weekly_tasks',
      'breakdown_daily_step', 'breakdown_weekly_review'
    ]
  },
  {
    key: 'corporate',
    label: 'Corporate Brand',
    path: '/brand-portal/corporate',
    cta: 'Set up your Corporate Brand',
    fields: [
      'company_name', 'tagline', 'mission_statement', 'phone', 'email',
      'website', 'brand_voice', 'brand_tonality', 'brand_personality',
      'positioning', 'target_audience'
    ],
    arrayFields: ['logo_urls', 'colors']
  },
  {
    key: 'personal',
    label: 'Personal Brand',
    path: '/brand-portal/personal',
    cta: 'Build your Personal Brand',
    fields: [
      'first_name', 'last_name', 'business_name', 'short_bio', 'long_bio',
      'phone', 'email', 'website', 'brand_voice', 'positioning'
    ],
    arrayFields: ['headshot_urls', 'logo_urls']
  },
  {
    key: 'media_kit',
    label: 'Media Kit',
    path: '/brand-portal/media-kit',
    cta: 'Complete your Media Kit',
    fields: [
      'first_name', 'last_name', 'business_name', 'short_bio', 'long_bio',
      'phone', 'email', 'website'
    ],
    arrayFields: ['headshot_urls', 'logo_urls']
  }
];

export function calculateTaskProgress(task, record) {
  if (!record) return 0;
  let filled = 0;
  let total = 0;
  for (const field of task.fields) {
    total++;
    const val = record[field];
    if (val && String(val).trim()) filled++;
  }
  for (const field of (task.arrayFields || [])) {
    total++;
    const val = record[field];
    if (Array.isArray(val) && val.length > 0) filled++;
  }
  return total > 0 ? Math.round((filled / total) * 100) : 0;
}