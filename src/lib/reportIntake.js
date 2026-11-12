// Single source of truth for the Brand Health report intake: the report types
// it accepts and the structure prompt that tells an AI how to format each one.
import { VISIBILITY_CATEGORIES } from '@/lib/visibility';
import { CHANNEL_CATEGORIES, CONSULTANT_PRIORITIES, MATRIX_SCORECARDS, STRATEGIC_ROLES } from '@/lib/matrix';

export const REPORT_TYPES = [
  { key: 'visibility', label: 'AI Visibility Scorecard' },
  { key: 'website_discoverability', label: 'Website Discoverability' },
  { key: 'conversion_readiness', label: 'Conversion Readiness' },
  { key: 'marketing_matrix', label: 'Marketing Matrix' },
];

export const REPORT_TYPE_LABELS = Object.fromEntries(REPORT_TYPES.map((t) => [t.key, t.label]));

export const SECTION_PRESETS = {
  website_discoverability: ['Findability', 'Search Clarity', 'Public Presence', 'Brand Consistency', 'Proof & Authority', 'Reputation Readiness'],
  conversion_readiness: ['Clarity', 'Desire', 'Credibility', 'Action'],
};

export const JOURNEY_STAGE_LABELS = {
  trigger: 'Trigger',
  discovery: 'Discovery',
  evaluation: 'Evaluation',
  decision: 'Decision',
  retention_referral: 'Retention & Referral',
};

export const BASIS_LABELS = {
  supported_by_results: 'Supported by results',
  strategic_hypothesis: 'Strategic hypothesis',
  needs_further_assessment: 'Needs further assessment',
};

const RULES = `Format your finished report exactly as described below so it loads into Freedom Foundry without edits.

Rules:
- Output the report only, as plain markdown. No commentary before or after it.
- Keep every heading exactly as written and in this order.
- Scores are whole numbers. If something was not assessed, write "Not assessed". Never estimate a score to fill a gap.
- One idea per bullet. Write in plain language the client can read.
- Replace everything in [brackets] and remove the brackets.`;

const SHARED_CLOSE = `## Consultant Summary
[Two to four sentences on what this report means for the business.]

## Takeaways
Prioritize: [the one thing to act on first]
Maintain: [what is working and should be kept]
Test: [one experiment worth running]

## Evidence Note
[How the findings were gathered and any limits on them.]

## Action Plan
### [Action title]
Priority: [Critical | High | Medium | Opportunity]
Detail: [what to do]
Done when: [the condition that marks it complete]
Channel: [related channel, or leave blank]

[Repeat the "###" block for each action.]`;

const visibility = () => `# AI Visibility Audit: [Business name]
Report date: [YYYY-MM-DD]

## Composite Score
[0-100]

## Category Scores
${VISIBILITY_CATEGORIES.map((c) => `- ${c.label}: [score] / ${c.max}`).join('\n')}

## Key Findings
- [short finding]

## Recommended Fixes
- [short fix]

## Competitors
- [Name]: [how they are positioned]

## Business Snapshot
- Email platform: [value]
- Email frequency: [value]
- Marketing blasts: [value]
- Drip campaigns: [value]
- Key funnel assets: [value]
- Events and launches: [value]

## Audit Sections
### [Section title]
Methodology: [Measured | Observed | Requires self-test | Mixed]
Status: [Critical | High | Medium | Low | Gap | Active | Opportunity | Info]
Summary: [one sentence]
Detail: [what was found]
Action: [what to do about it]

[The full section text. Use markdown tables for any tabular data.]

[Repeat the "###" block for every section of the audit.]`;

const scored = (type) => `# ${REPORT_TYPE_LABELS[type]} Audit: [Business name]
Report date: [YYYY-MM-DD]

## Overall Score
[0-100]

## Section Scores
${SECTION_PRESETS[type].map((s) => `- ${s}: [0-100]`).join('\n')}

${SHARED_CLOSE}`;

const matrix = () => `# Marketing Matrix: [Business name]
Report date: [YYYY-MM-DD]

## Scorecards
${MATRIX_SCORECARDS.map((s) => `### ${s.label}
Score: [0-100]
Summary: [one or two sentences]
Interpretation: [what the score means]
Implication: [what it means for growth]
Constraint: [the main thing holding it back]
Priorities:
- [priority]`).join('\n\n')}

## Channels
### [Channel name]
Category: [${CHANNEL_CATEGORIES.join(' | ')}]
Role: [${STRATEGIC_ROLES.map((r) => r.label).join(' | ')}]
Priority: [${CONSULTANT_PRIORITIES.map((p) => p.label).join(' | ')}]
Journey stage: [${Object.values(JOURNEY_STAGE_LABELS).join(' | ')}]
Basis: [${Object.values(BASIS_LABELS).join(' | ')}]
Description: [how the business uses this channel today]
Next action: [the next step for this channel]
Client note: [what the client should know]

[Repeat the "###" block for every channel reviewed.]

${SHARED_CLOSE}`;

/** The prompt to hand an AI so its report arrives in the shape the intake reads. */
export function structurePrompt(type) {
  const body = type === 'visibility' ? visibility() : type === 'marketing_matrix' ? matrix() : scored(type);
  return `${RULES}\n\n---\n\n${body}`;
}