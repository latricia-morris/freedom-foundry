// Frontend mirror of the agency proposal settings (see base44/shared/proposal/content.ts).
// The published microsite receives agency fields from the API payload; these
// constants serve the PDF export and admin studio.
export const MEDIA_LIBRARY = [
  { key: 'book_mockup', slot: 'Book mockup', url: '', note: 'Awaiting supplied uncropped mockup.' },
  { key: 'portrait', slot: 'Credentials portrait', url: 'https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/a2132fb50_LaTriciaMorrisQueenStreetPhotography6widenedcharcoal.png', note: 'Full subject preserved, no crop.' },
  { key: 'agency_seal', slot: 'Agency seal', url: 'https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/a3bf85665_TheBrandRevivalistLogo.png' },
  { key: 'bi_logo', slot: 'Book announcement logo', url: 'https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/a3220e37e_businessinsiderwhite.png', context: 'book_announcement' },
  { key: 'ap_logo', slot: 'Book announcement logo', url: 'https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/e4f3e234f_Associated_Press_logowhitetext.png', context: 'book_announcement' },
  { key: 'ibt_logo', slot: 'Book announcement logo', url: 'https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/1262db9ec_international-business-times.png', context: 'book_announcement' },
  { key: 'nts_logo', slot: 'Optional recognition mark', url: 'https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/73341ca28_NextTopSpeakerlogo.png', hidden_by_default: true },
  { key: 'nts_badge_50', slot: 'Next Top Speaker Top 50 badge', url: '', hidden_by_default: true },
  { key: 'nts_badge_speakers_choice', slot: 'Next Top Speaker Speakers Choice badge', url: '', hidden_by_default: true },
  { key: 'blox_s24', slot: 'Founder media group', url: '', note: 'Asset pending.' },
  { key: 'abundanttv', slot: 'Founder media group', url: 'https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/945025a11_AbundantTVLogowhite.png', panel: 'dark' },
  { key: 'ceoweekly', slot: 'Founder media group', url: 'https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/db85b519f_CEOWeeklylogogoldandwhite.png', panel: 'dark' },
  { key: 'canvasrebel', slot: 'Founder media group', url: 'https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/4e6bd82e7_CanvasRebel-logo3.png', panel: 'light' },
  { key: 'brainz', slot: 'Founder media group', url: 'https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/3b9b81391_White-Brainz-Magazine-Logo.png', panel: 'dark' },
];

export const TIMELINE_INTRO =
  'The chart below shows the anticipated sequence of work, review points, and payment milestones. Timelines are estimates and depend on the agreed start conditions, the scope, and timely access, materials, feedback, and approvals.';

export const SCOPE_GROUPS = [
  'Creative',
  'Development',
  'Strategy & Research',
  'Content & Messaging',
  'Ongoing Work',
];

export const AGENCY = {
  legal_entity: "Ox & Iron, LLC",
  presentation_brand: "The Brand Revivalist®",
  representative: "LaTricia Morris",
  signature_title: "Owner",
  display_location: "Lancaster, Pennsylvania",
  notice_email: "latricia@thebrandrevivalist.com",
  phone: "717-874-9787",
  website: "https://thebrandrevivalist.com",
  book_title: "Brand Power Moves",
  book_url: "https://thebrandrevivalist.com/bpm",
};