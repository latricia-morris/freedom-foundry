// Freedom Foundry proposal system: agency settings, media library, default
// overview copy, timeline presets, and the standard agreement library.
// Shared by backend functions. All money is integer cents.

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
  book_subtitle: "The Masters' Playbook to Making Your Brand Your Unfair Advantage",
  book_url: "https://thebrandrevivalist.com/bpm",
  governing_law: "Commonwealth of Pennsylvania",
  mediation_location: "Lancaster County, Pennsylvania",
  state_court: "Court of Common Pleas of Lancaster County, Pennsylvania",
  federal_court: "United States District Court for the Eastern District of Pennsylvania",
  web_change_rate: "$150/hour for separately approved out-of-scope web work",
  web_change_rate_cents: 15000,
  agreement_version: "MSA-SOW-2026-10-19.1",
  default_validity_days: 30,
};

export const AGENCY_SEAL_URL =
  "https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/a3bf85665_TheBrandRevivalistLogo.png";
export const PORTRAIT_URL =
  "https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/a2132fb50_LaTriciaMorrisQueenStreetPhotography6widenedcharcoal.png";
export const NTS_LOGO_URL =
  "https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/73341ca28_NextTopSpeakerlogo.png";
export const ABUNDANTTV_URL =
  "https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/945025a11_AbundantTVLogowhite.png";
export const CANVASREBEL_URL =
  "https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/4e6bd82e7_CanvasRebel-logo3.png";
export const CEOWEEKLY_URL =
  "https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/db85b519f_CEOWeeklylogogoldandwhite.png";
export const BRAINZ_URL =
  "https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/3b9b81391_White-Brainz-Magazine-Logo.png";
export const AP_URL =
  "https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/e4f3e234f_Associated_Press_logowhitetext.png";
export const BI_URL =
  "https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/a3220e37e_businessinsiderwhite.png";
export const IBT_URL =
  "https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/1262db9ec_international-business-times.png";

/**
 * Library image slots. url: "" means the asset has not been supplied yet and
 * must not render in the client view. NTS badges are stored and hidden by
 * default; they remain reversible options.
 */
export const MEDIA_LIBRARY = [
  { key: "book_mockup", slot: "Book mockup", url: "", fitting: "contain", note: "Awaiting supplied uncropped mockup." },
  { key: "portrait", slot: "Credentials portrait", url: PORTRAIT_URL, fitting: "contain", note: "Full subject preserved, no crop." },
  { key: "agency_seal", slot: "Agency seal", url: AGENCY_SEAL_URL, fitting: "contain", note: "Restrained branding, not an acceptance stamp." },
  { key: "bi_logo", slot: "Book announcement logo", url: BI_URL, fitting: "contain", context: "book_announcement", link: "https://markets.businessinsider.com/news/stocks/the-brand-revivalist-releases-new-tactical-playbook-for-business-owners-1036523410", confirmed: true },
  { key: "ap_logo", slot: "Book announcement logo", url: AP_URL, fitting: "contain", context: "book_announcement", link: "", confirmed: false },
  { key: "ibt_logo", slot: "Book announcement logo", url: IBT_URL, fitting: "contain", context: "book_announcement", link: "", confirmed: false },
  { key: "nts_logo", slot: "Optional recognition mark", url: NTS_LOGO_URL, fitting: "contain", hidden_by_default: true },
  { key: "nts_badge_50", slot: "Next Top Speaker Top 50 badge", url: "", hidden_by_default: true, note: "Stored; hidden by default." },
  { key: "nts_badge_speakers_choice", slot: "Next Top Speaker Speakers' Choice badge", url: "", hidden_by_default: true, note: "Stored; hidden by default." },
  { key: "blox_s24", slot: "Founder media group", url: "", context: "founder_media", note: "Asset pending." },
  { key: "abundanttv", slot: "Founder media group", url: ABUNDANTTV_URL, fitting: "contain", context: "founder_media", panel: "dark" },
  { key: "ceoweekly", slot: "Founder media group", url: CEOWEEKLY_URL, fitting: "contain", context: "founder_media", panel: "dark" },
  { key: "canvasrebel", slot: "Founder media group", url: CANVASREBEL_URL, fitting: "contain", context: "founder_media", panel: "light" },
  { key: "brainz", slot: "Founder media group", url: BRAINZ_URL, fitting: "contain", context: "founder_media", panel: "dark" },
];

export const SCOPE_GROUPS = [
  "Creative",
  "Development",
  "Strategy & Research",
  "Content & Messaging",
  "Ongoing Work",
];

export const TIMELINE_PRESETS = {
  comprehensive_strategy: {
    label: "Comprehensive strategy preset",
    phases: [
      { name: "Research", action: "Discovery, audit, and audience research", timing: "Weeks 1 to 2", dependency: "Kickoff access and materials" },
      { name: "Define", action: "Positioning, messaging, and strategic direction", timing: "Weeks 1 to 2, concurrent", dependency: "Discovery input" },
      { name: "Ideate", action: "Concept development and creative directions", timing: "Weeks 2 to 4", dependency: "Defined direction" },
      { name: "Prototype", action: "Working prototype of priority deliverables", timing: "Target end of Week 4, subject to dependencies", dependency: "Concept approval" },
      { name: "Refine", action: "Revision rounds and finalization", timing: "Following approval", dependency: "Prototype approval" },
    ],
    milestones: [
      { description: "Project deposit", due_event: "Due upon acceptance" },
      { description: "Balance", due_event: "Due at the approved completion milestone" },
    ],
  },
  website_build: {
    label: "Website-build milestone preset",
    phases: [
      { name: "Start conditions", action: "Signed agreement, required deposit, essential access and materials, approved delivery plan", timing: "Before scheduling and start", dependency: "Client inputs" },
      { name: "Logo approval", action: "Final logo approval where logo work is included", timing: "Before website kickoff", dependency: "Strategy and design directions" },
      { name: "Website kickoff", action: "Project kickoff and planning", timing: "After final logo approval", dependency: "Logo approval and deposit" },
      { name: "Desktop preview", action: "Initial desktop preview, normally at least three sample pages where the scope permits", timing: "Within an estimated 30 calendar days of website kickoff", dependency: "Website kickoff" },
      { name: "Desktop completion", action: "Desktop design completion", timing: "Within an estimated 30 calendar days of design approval", dependency: "Design approval" },
      { name: "Mobile completion", action: "Mobile completion and final revisions", timing: "Within an estimated 30 calendar days of final payment", dependency: "Remaining 50% paid upon desktop completion and approval" },
      { name: "Final revisions", action: "Final revision requests", timing: "Within 14 calendar days of final delivery", dependency: "Final delivery" },
      { name: "Correction support", action: "Correction support period", timing: "14 calendar days after applicable launch or delivery", dependency: "Launch or delivery" },
    ],
    milestones: [
      { description: "Required deposit", due_event: "Due upon acceptance, before scheduling and start" },
      { description: "Remaining 50%", due_event: "Due upon desktop completion and approval, before mobile completion and final revisions" },
    ],
  },
};

export function defaultSchedule(isWebsiteBuild) {
  if (isWebsiteBuild) {
    return [
      { label: "Due upon acceptance", percent: 50, due_event: "Due upon acceptance, before scheduling and start" },
      { label: "Due upon desktop completion and approval", percent: 50, due_event: "Desktop completion and approval, before mobile completion and final revisions" },
    ];
  }
  return [
    { label: "Due upon acceptance", percent: 50, due_event: "Due upon acceptance" },
    { label: "Due at the approved completion milestone", percent: 50, due_event: "Approved completion milestone" },
  ];
}

/** Client-facing overview defaults. Recipient tokens are resolved at publish. */
export function buildOverview(recipient, options = {}) {
  const isIndividual = !recipient || recipient.is_individual;
  const company = recipient?.company_name || "";
  const greeting = recipient?.greeting_name || recipient?.first_name || "there";
  const fullName = recipient?.full_name || "";
  return {
    cover: {
      eyebrow: isIndividual ? `PREPARED FOR ${fullName}`.toUpperCase() : `PREPARED FOR ${company}`.toUpperCase(),
      recipient: isIndividual ? "" : `A proposal for ${fullName}`,
      prepared_by: `${AGENCY.representative} | ${AGENCY.presentation_brand}`,
    },
    introduction: {
      heading: `Hello, ${greeting}.`,
      body: isIndividual
        ? "Thank you for considering us for your project. This proposal outlines our understanding of your goals, the work we recommend, and what you can expect from the process. You can review the scope, explore any available options, and request changes before making a commitment."
        : `Thank you for considering us for ${company}. This proposal outlines our understanding of your goals, the work we recommend, and what you can expect from the process. You can review the scope, explore any available options, and request changes before making a commitment.`,
      closing: AGENCY.representative,
      role: `${AGENCY.presentation_brand} and ${AGENCY.signature_title} of ${AGENCY.legal_entity}`,
    },
    approach: {
      eyebrow: "BRAND FIRST",
      heading: "Branding and the marketing that carries it forward.",
      body: [
        "A strong brand gives people a clear reason to choose you. Brand-first marketing carries that reason into the places where they discover, evaluate, and engage with your business.",
        "We connect positioning, messaging, design, and execution so your website, content, campaigns, and client experience reinforce the same direction. Whether the engagement is a focused improvement or a comprehensive rebrand, the work should serve the business you are building and the people you want to reach.",
      ],
      blocks: [
        { heading: "Understand the business.", body: "We start with your goals, audience, current position, and the context behind the project." },
        { heading: "Make the direction clear.", body: "We define the priorities, message, and deliverables so the work has a purpose and you know what is being developed." },
        { heading: "Carry it into the experience.", body: "We translate the direction into the agreed assets, communications, and digital touchpoints, with review and approval built into the process." },
      ],
      footer: "Your specific deliverables are defined under Your Project.",
    },
    capabilities: {
      eyebrow: "HOW WE CAN HELP",
      heading: "From brand direction to market presence.",
      intro: "Our capabilities connect the foundations of your brand with the assets, marketing, and experiences that put it to work. Your engagement may draw on one area or several, depending on what your business needs.",
      categories: [
        { name: "Brand Strategy", items: ["Brand discovery and research", "Positioning and differentiation", "Brand business architecture", "Audience mapping and competitive analysis", "Brand persona and strategic direction"] },
        { name: "Messaging & Copywriting", items: ["Messaging frameworks", "Brand voice and language", "Brand story development", "Website copywriting", "Marketing and campaign copy"] },
        { name: "Visual Identity & Design", items: ["Logo and identity systems", "Brand style guides", "Typography and imagery direction", "Print and digital collateral", "Branded templates and asset suites"] },
        { name: "Websites & Digital Experiences", items: ["Website strategy and structure", "Custom website design and development", "SEO/AEO-informed website content", "Client portals and digital experiences", "Lead capture and CRM integration"] },
        { name: "Brand-First Marketing", items: ["Marketing strategy and campaign direction", "Content planning and development", "Brand-aligned promotional materials", "Search-focused content improvements", "Cross-channel messaging alignment"] },
        { name: "Custom Apps & Business Tools", items: ["Purpose-built web apps", "Client-facing tools and portals", "Interactive resources and prototypes", "Workflow and automation tools", "Digital product experiences"] },
      ],
      always_show: "These are our broader capabilities, not a list of services included in this proposal. Included work is defined under Your Project.",
    },
    meet: {
      eyebrow: "YOUR STRATEGIC PARTNER",
      heading: "Meet LaTricia Morris",
      role_line: "Brand strategist, creative partner, and published author of Brand Power Moves.",
      body: "I work with founders and leaders who want the quality of their brand to reflect the quality of what they have built. Through The Brand Revivalist® and Ox & Iron, LLC, I bring brand strategy, messaging, design, and digital execution together so the direction behind the business carries through to the way people experience it.",
      credentials: [
        { heading: "Certified Brand Master", body: "Trained through Brand Master Academy, with formal certification in brand strategy, business architecture, positioning, archetypes, and audience mapping." },
        { heading: "Strategy and execution together", body: "My work spans brand strategy, copywriting, design, websites, and digital tools. That range keeps the direction connected to the details rather than losing the strategy between disciplines." },
        { heading: "Built through experience", body: "I built Ox & Iron from a bootstrap startup into a full-service brand firm, serving solopreneurs, growing businesses, and national organizations operating under international parent companies." },
      ],
      recognition_heading: "Speaking & Television",
      recognition_items: [
        "The Blox, Season 24.",
        "Next Top Speaker, Top 50 in Seasons 5 and 6.",
        "Next Top Speaker, Season 6 Speakers' Choice Award.",
      ],
      optional_badges: [
        { name: "Next Top Speaker, Top 50", url: "", hidden: true },
        { name: "Next Top Speaker, Speakers' Choice", url: "", hidden: true },
      ],
      media_heading: "Features & Contributions",
      media_logos: [
        { name: "The Blox", url: "" },
        { name: "AbundantTV", url: ABUNDANTTV_URL, panel: "dark" },
        { name: "CEO Weekly", url: CEOWEEKLY_URL, panel: "dark" },
        { name: "CanvasRebel", url: CANVASREBEL_URL, panel: "light" },
        { name: "Brainz Magazine", url: BRAINZ_URL, panel: "dark" },
      ],
      portrait_url: PORTRAIT_URL,
      seal_url: AGENCY_SEAL_URL,
    },
    book: {
      eyebrow: "PUBLISHED AUTHOR",
      heading: AGENCY.book_title,
      subheading: AGENCY.book_subtitle,
      body: "Brand Power Moves brings my approach to brand strategy into a practical playbook for business owners and leaders. It connects positioning, messaging, customer experience, offer development, and the way a team carries the brand forward.",
      list: [
        "Establish a clearer position in the market.",
        "Make your value easier to understand through stronger messaging.",
        "Develop experiences that support referrals and repeat business.",
        "Connect offers into a more intentional business model.",
        "Align your team and collaborators around the brand.",
      ],
      button_label: "Explore Brand Power Moves",
      button_url: AGENCY.book_url,
      mockup_url: "",
      news_heading: "Book News & Press",
      news_copy: "The official announcement for Brand Power Moves was published across U.S. and international media platforms.",
      announcement_logos: [
        { name: "Associated Press", url: AP_URL, link: "", confirmed: false },
        { name: "Business Insider", url: BI_URL, link: "https://markets.businessinsider.com/news/stocks/the-brand-revivalist-releases-new-tactical-playbook-for-business-owners-1036523410", confirmed: true },
        { name: "International Business Times", url: IBT_URL, link: "", confirmed: false },
      ],
    },
  };
}

/**
 * Standard agreement library. One approved version is reused until
 * deliberately updated; proposals freeze it at publish.
 */
export function buildAgreement(recipient, options = {}) {
  const contractingParty = recipient?.contracting_party_name || "{{client.contracting_party_name}}";
  const noticeEmail = recipient?.notice_email || "{{client.notice_email}}";
  const s = [];
  const add = (heading, paragraphs) => s.push({ heading, paragraphs: Array.isArray(paragraphs) ? paragraphs : [paragraphs] });

  add("Parties", `This Agreement is between Ox & Iron, LLC ("Agency"), represented by LaTricia Morris, Owner, and ${contractingParty} ("Client"). Agency provides the services described in the accepted Statement of Work. References to The Brand Revivalist in the presentation identify the agency's branding and do not identify a separate contracting entity.`);
  add("Agreement documents and precedence", "The accepted Statement of Work controls the scope, deliverables, fees, payment schedule, and project-specific timing. A departure from the Master Services Agreement must be expressly identified as an override in the accepted Statement of Work or a signed amendment. General summaries and promotional content do not modify the agreement.");
  add("Commencement", "Your project begins on the later of the agreed start date or the date we have received the signed proposal, the required deposit, and the access, materials, or approved asset-delivery plan needed to begin. Selecting cash/check does not confirm receipt of payment or reserve a start date.");
  add("Payments and additional work", "The amounts and due events listed under Investment form part of this Agreement. The required initial payment must be received before work begins. Subsequent work and delivery remain subject to the stated payment milestones. Additional work or expenses outside the accepted scope require written approval before they are incurred.");
  add("Revisions", "The included revision allowance is listed with each applicable deliverable. One round means one consolidated set of feedback on the supplied version. Additional pages, services, or new directions after approval require an agreed change in scope before additional work begins.");
  add("Payment schedule and late payments", [
    "Client shall pay the fees according to the amounts and payment milestones stated in the accepted Statement of Work. Unless that Statement of Work expressly provides otherwise, 50% of the project fee is due upon acceptance, and the remaining 50% is due at the completion milestone identified in the Statement of Work.",
    "Agency is not required to commence work before receiving the signed agreement and required initial payment. Selecting cash or check does not constitute payment.",
    "Amounts unpaid after their stated due date accrue a late charge of 1.5% per month, or the maximum rate permitted by applicable law, whichever is lower. Agency may suspend further work and withhold delivery, publication, source files, and transfer of ownership while required payments remain outstanding. Agency will provide written notice of a payment-related suspension.",
    "A suspension resulting from Client's failure to make a required payment may affect the estimated schedule and does not, by itself, constitute a breach by Agency.",
  ]);
  add("Changes to scope", [
    "Changes to the agreed services, deliverables, quantities, revision allowances, or project direction must be requested in writing.",
    "Before performing additional work, Agency will identify the proposed change, any additional fee, and its effect on the estimated schedule. Additional work requires Client's written approval. Substantial changes may require a revised Statement of Work or signed amendment and an additional initial payment.",
    options.web_change_elected
      ? "Separately approved changes to existing web pages outside the agreed scope are billed at $150 per hour unless the parties agree to a fixed fee or another rate in writing. This hourly rate does not replace or modify the fixed fee for work already included in the accepted scope."
      : "",
    "No additional expenditure or charge is authorized merely because it falls below a percentage of the original project fee.",
  ].filter(Boolean));
  add("Feedback, approval, and project holds", [
    "Unless the Statement of Work specifies another review period, Client shall provide written approval or one consolidated set of specific feedback within three business days after receiving an interim deliverable for review.",
    "If Client does not respond within that period, the interim deliverable will be deemed accepted for purposes of progressing to the next stage. This does not authorize publication of content that the Statement of Work expressly requires Client to approve before publication.",
    "For final delivery, Client shall submit any included final revision requests within 14 calendar days unless another period is specified in the Statement of Work.",
    "Delayed feedback, approvals, access, or materials may extend the estimated schedule. If Client becomes unresponsive or places the project on hold for more than 10 business days without an agreed arrangement, Agency may pause the project. Restart timing is subject to availability, and Agency may require a written restart plan or revised Statement of Work before resuming.",
  ]);
  add("Client information, materials, and approvals", [
    "Client is responsible for supplying accurate information, required access, and materials identified as client-provided. Client will communicate promptly about delays and provide consolidated feedback within the review periods identified in the Statement of Work.",
    "Copywriting, imagery procurement, and other content services are Agency responsibilities only to the extent included in the accepted scope. Client remains responsible for reviewing the accuracy of business, professional, clinical, legal, and industry-specific representations before publication.",
    "Client represents that it has the necessary rights and permissions for materials it supplies or instructs Agency to use.",
  ]);
  add("Corrections", "A 14-day correction period follows the applicable launch or delivery. Agency will correct typographical mistakes, implementation errors, or non-functional elements introduced through Agency's work within the original scope. New requests and changes to approved content are outside this correction period.");
  add("Cancellation and material breach", [
    "Either party may terminate this Agreement by written agreement or if the other party materially breaches its obligations and fails to remedy that breach within seven calendar days after receiving written notice describing it.",
    "Client may also cancel an unfinished engagement by written notice, subject to the payment obligations below.",
    "Upon cancellation, Client shall pay for services performed through the effective cancellation date, earned milestone fees, and approved expenses or noncancelable third-party commitments incurred for the engagement. Completed milestones are valued at their agreed fees. Partially completed fixed-fee milestones are valued reasonably in proportion to the work performed and documented.",
    "Amounts already paid will be credited against the cancellation balance. The same work or expense shall not be charged twice.",
    "If Client cancels for reasons other than Agency's uncured material breach, an additional cancellation fee equal to 5% of the accepted project fee applies, to the extent permitted by law. This fee does not accelerate charges for future work that has not been performed.",
    "Cancellation does not transfer ownership of unpaid work or grant permission to use unfinished concepts. Rights in approved, paid-for final deliverables remain governed by the Ownership clause.",
  ]);
  add("Outcomes", "Agency commits to the agreed work and review process, not a guaranteed level of revenue, traffic, rankings, leads, or other business results.");
  add("Ownership and third-party materials", [
    "Upon full payment, ownership of original final deliverables expressly created for Client under this Agreement transfers to Client. Third-party materials remain subject to their licenses. Pre-existing agency tools, templates, software, and systems remain the property of their respective owners; any license needed for Client's agreed use must be specified in the Statement of Work. Source-file delivery and any project-specific ownership or licensing exceptions must be identified in the scope.",
    "Agency retains ownership of the original work it creates until the fees and approved charges attributable to that work have been paid in full.",
    "Effective upon receipt of full payment, Agency assigns to Client its ownership rights in the original final deliverables expressly identified for transfer in the accepted Statement of Work.",
    "Pre-existing Agency tools, systems, templates, and software remain Agency property. Third-party materials remain subject to their licenses. Any license required for Client's agreed use of incorporated Agency materials must be identified in the Statement of Work.",
    "Rights already transferred in fully paid work do not automatically revert to Agency because of a later unpaid hosting or maintenance invoice.",
  ]);
  add("Use before full payment", [
    "Unless otherwise agreed in writing, unpaid drafts and concepts are provided for review only and may not be published, reproduced, distributed, or commercially used.",
    "If Agency authorizes publication before the applicable work has been paid in full, that authorization is a temporary license conditioned on Client remaining current with the agreed payment schedule.",
    "If the applicable payment remains unpaid for 60 calendar days after its due date and no written payment arrangement is in effect, Agency may terminate that temporary license by written notice. Following termination, Client must discontinue uses covered by the terminated license.",
    "Agency reserves the right to pursue payment and any remedies available under applicable law for continued unauthorized use. This provision does not declare that every unpaid invoice constitutes copyright infringement or guarantee a particular damages award.",
  ]);
  add("Hosting, nonpayment, suspension, and restoration", [
    "These provisions apply only to websites hosted by Agency or expressly placed under Agency's management through the accepted agreement.",
    "Agency-managed hosting. Where hosting or website management is included in the accepted Statement of Work, Agency will maintain the website within its managed hosting environment for the agreed service period. This may include continued hosting while Agency performs ongoing work following the initial build. Hosting, maintenance, development, and other ongoing services remain subject to their agreed fees and payment schedules. Hosting does not continue indefinitely without payment merely because a website was previously built or launched.",
    "Payment before transfer. Agency is not required to migrate, transfer, or release an Agency-hosted website while amounts due for that website's development, approved work, hosting, or agreed transfer services remain unpaid. Any transfer remains subject to technical requirements, third-party licenses, and an agreed migration scope. Payment of an outstanding balance does not automatically include migration services that were not part of the accepted scope. This provision does not transfer ownership of Client's pre-existing materials to Agency or permit Agency to disregard rights or obligations imposed by applicable law or third-party providers.",
    "Suspension and coming-soon status. If Client fails to pay amounts due for an Agency-hosted website's development, approved work, hosting, or management, Agency may suspend the affected services after written notice and an opportunity to remedy the default. The notice will identify the outstanding amount, the payment deadline, and the proposed suspension date. Suspension may include disabling public access to the website or replacing it with a neutral coming-soon or temporarily unavailable page. Agency will not publicly disclose Client's debt or use the holding page to disparage Client. Suspension does not cancel amounts already owed. Client acknowledges that suspension may interrupt website availability, integrations, forms, transactions, and search visibility. These rights do not authorize Agency to disable a website hosted or controlled by Client without express contractual authority.",
    "Removal after 30 days of suspension. If the default remains unresolved for 30 calendar days after suspension, and no written payment arrangement is in effect, Agency may terminate hosting and permanently remove the website from its hosting environment. Agency will provide written notice identifying the scheduled removal date before permanent removal. Agency is not required to continue paying for hosting or retain a suspended website indefinitely. Payment after removal does not guarantee that the previous hosting environment remains available or that the website can be immediately reinstated. Removal of the hosted website does not eliminate Client's outstanding payment obligations.",
    "Backups and retention. Agency will make reasonable efforts to preserve a backup before permanent removal, where technically practicable. Unless a separate backup service or retention commitment has been accepted, Agency does not guarantee that a complete, usable backup will be available indefinitely. Client remains responsible for maintaining any independent copies or exports it requires. Website removal does not authorize deletion of signed agreements, invoices, payment records, or records that Agency must preserve under applicable law or an existing preservation obligation.",
    "Reinstatement and restoration. Reinstatement requires payment of outstanding amounts, any applicable reinstatement charge previously disclosed and accepted, and any approved restoration work. Reinstatement is not necessarily immediate. Restoration may require additional work to recover files, rebuild the environment, reconnect domains, restore databases, renew licenses, update software, repair integrations, and test functionality. Agency will identify any additional restoration scope and obtain approval before performing chargeable restoration work. Agency does not guarantee that restoration will reproduce every prior setting, integration, transaction, or third-party service exactly as it existed before suspension or removal.",
  ]);
  add("Independent contractor and subcontractors", [
    "Agency is an independent contractor. This Agreement does not create employment, a partnership, a joint venture, or an exclusive relationship between the parties.",
    "Client authorizes Agency to use qualified employees and subcontractors to perform the agreed services. Agency remains responsible for their work and for their compliance with applicable confidentiality and project obligations.",
    "This authorization does not permit Agency to transfer the entire Agreement to another business without Client's written consent.",
  ]);
  add("Non-solicitation", "To the extent permitted by applicable law, during the engagement and for one year after its conclusion, Client shall not directly solicit for employment or separate engagement any Agency employee or subcontractor introduced to Client through the engagement without Agency's prior written consent. This restriction does not prohibit general recruitment not directed at those individuals or the continuation of a relationship that existed independently before the engagement.");
  add("Portfolio and promotional display", "Agency may identify Client and display publicly released final deliverables in its portfolio, website, case studies, and professional promotional materials unless the Statement of Work includes an agreed confidentiality or publication restriction. This permission does not authorize disclosure of confidential information, unpublished business information, private client data, or project results that have not been substantiated.");
  add("Indemnification for client responsibilities", "To the extent permitted by law, Client shall indemnify and hold Agency and its personnel harmless from third-party claims, liabilities, and reasonable associated costs, including reasonable attorney fees, arising from Client's breach of its obligations, representations, or warranties, or from materials Client supplied without the necessary rights or permissions. This provision does not require Client to indemnify Agency for Agency's own unlawful conduct or responsibility that cannot lawfully be transferred.");
  add("Limitation of liability", [
    "To the fullest extent permitted by law, Agency's aggregate liability arising from this Agreement shall not exceed the total amount Client paid Agency under this Agreement.",
    "Agency shall not be liable for indirect, incidental, special, or consequential losses, including lost profits, lost business opportunities, business interruption, or loss of data.",
    "These limitations do not exclude or restrict liability that applicable law does not allow to be excluded or limited.",
  ]);
  add("Confidentiality", "Each party will protect the other party's nonpublic business and technical information received through this engagement and use it only for the engagement, except as authorized in writing or required by law. Disclosure to personnel or service providers must be limited to those who need it for the work and are subject to appropriate confidentiality obligations.");
  add("Third-party costs", "Hosting, domains, subscriptions, and other third-party costs remain separate from the project fee unless expressly included. New third-party purchases made on Client's behalf require approval.");
  add("Notices", `Notices under this Agreement must be sent by email to ${AGENCY.notice_email} for Agency and ${noticeEmail} for Client. Either party may update its notice email by written notice to the other. Notices required to follow a particular method under applicable law or arbitration rules must comply with those requirements.`);
  add("Governing law and dispute resolution", [
    "Governing law. This Agreement and the services provided under it are governed by the laws of the Commonwealth of Pennsylvania, without regard to conflict-of-law principles. Applicable federal law governing arbitration remains controlling where required.",
    "Mediation first. Except for the limited court proceedings permitted below, the parties agree to attempt to resolve any dispute arising out of or relating to this Agreement, an accepted Statement of Work, the services, or payment through good-faith mediation before proceeding to arbitration.",
    "A party initiating a dispute must send written notice to the other party's designated notice email describing the dispute and the resolution requested. The parties will attempt to select a mutually acceptable neutral mediator within 15 calendar days after that notice. Mediation will take place in Lancaster County, Pennsylvania, unless both parties agree in writing to participate remotely or use another location.",
    "When mediation is unsuccessful. A dispute may proceed to arbitration if mediation concludes without a written settlement, a party expressly refuses to participate, or the dispute remains unresolved 60 calendar days after the mediation request despite the requesting party's reasonable efforts to arrange and participate in mediation. The parties may extend that period by written agreement.",
    "Binding arbitration. A dispute not resolved through the mediation process above will be resolved by binding arbitration administered by the American Arbitration Association under its applicable Commercial Arbitration Rules, subject to any other rules or protections required by law. One neutral arbitrator will be selected under those rules. The arbitration's legal location will be Lancaster County, Pennsylvania. Remote participation may be permitted by agreement or as allowed under the applicable rules.",
    "The arbitrator may award relief available under the Agreement and applicable law. Allocation of arbitration fees and costs will follow applicable law and the governing arbitration rules. This clause does not independently create a right to recover attorney fees.",
    "Limited court proceedings. Court proceedings may be brought to compel or stay arbitration, obtain temporary relief necessary to preserve rights pending dispute resolution, confirm or challenge an arbitration award as permitted by law, or address a claim that cannot lawfully be arbitrated. Seeking such relief does not waive the mediation or arbitration requirements for the underlying dispute.",
    `To the fullest extent permitted by law, those proceedings must be brought in the ${AGENCY.state_court}. If exclusive federal jurisdiction applies, proceedings must instead be brought in the ${AGENCY.federal_court}. The parties consent to personal jurisdiction and venue in the applicable court.`,
    "Effect of arbitration. The parties understand that binding arbitration generally replaces a trial before a judge or jury for disputes covered by this provision. Court review of an arbitration award is limited as provided by law.",
  ]);
  return s;
}

/** Client-facing accept states text lives in the microsite; this is the offline reminder. */
export const OFFLINE_REMINDER =
  "Your project will not begin until we have received both your signed proposal and the required deposit. Choosing check or cash records your payment preference only. Your start date remains subject to receipt of payment, the agreed schedule, and any other start conditions in your proposal.";

/**
 * Approved offline payment instructions. Empty until approved by the agency;
 * while empty the check/cash option is not offered to clients.
 */
export const OFFLINE_INSTRUCTIONS = "";

export const SCOPE_FOOTER =
  "Anything not expressly included in the approved scope will be discussed and quoted before additional work begins.";

export const TIMELINE_INTRO =
  "The chart below shows the anticipated sequence of work, review points, and payment milestones. Timelines are estimates and depend on the agreed start conditions, the scope, and timely access, materials, feedback, and approvals.";

export const CONSENTS = {
  proposal: "I have reviewed and agree to this proposal, including the selected scope, pricing, payment schedule, estimated timeline conditions, and agreement terms.",
  electronic: "I consent to use electronic records and signatures for this agreement. I intend my typed or drawn signature to sign this agreement, and I understand that I can download a copy after acceptance.",
  authority: "I confirm that I am authorized to accept this agreement on behalf of {contracting_party}.",
};

export const CONSENTS_VERSION = "consents-2026-10-19.1";