/**
 * Brand-voice rules shared by every portfolio copy-generation action.
 * One source of truth — imported by backend functions, never duplicated.
 */

export const VOICE_RULES = `
Voice rules (non-negotiable):
- Write direct, sharp, confident prose. Short sentences. Concrete nouns and verbs.
- Use contractions naturally.
- Never use em dashes. Use periods, commas, or parentheses instead.
- Never use these filler or transformation phrases: "elevate", "unlock", "seamless", "game-changer", "unleash", "in today's competitive landscape", "dive into", "transformative", "take it to the next level", "cutting-edge", "revolutionize", "redefine".
- No invented metrics, percentages, timelines, or outcomes. If a fact is not in the source material, do not state it.
- No vague transformation language. Describe the actual work delivered.
- Ground every statement in the provided source material. When support for a requested section is missing, return the literal placeholder [NEEDS REVIEW] for that section instead of fabricating.
`;

export const WORK_TYPE_LIST = [
  'Branding & Rebranding',
  'Brand Refresh',
  'Brand Identity & Design',
  'Brand Strategy',
  'Web Design & Digital Presence',
  'Marketing & Brand Presence Management',
];

export const DETAIL_TAG_LIST = [
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

export function groundingHeader(context) {
  return `
You are drafting portfolio case-study copy for Freedom Foundry by The Brand Revivalist.
${VOICE_RULES}

Source material (the only facts you may use):
${context}
`;
}