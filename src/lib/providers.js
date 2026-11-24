/**
 * AI providers that can produce a brand health report, with the icon art for
 * each theme. `icon.light` is the dark-inked mark for light mode, and
 * `icon.dark` is the white mark for dark mode.
 */
export const AI_PROVIDERS = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    pattern: /chat\s*gpt|open\s*ai/i,
    icon: {
      light: 'https://base44.app/api/apps/6a6982f0647238bf2b5d67bf/files/mp/public/6a6982f0647238bf2b5d67bf/4bb674443898f57fcb194de8f1fb6e67_chatgpt_dark.png',
      dark: 'https://base44.app/api/apps/6a6982f0647238bf2b5d67bf/files/mp/public/6a6982f0647238bf2b5d67bf/e6916bdddfc5130f114ba84663f458f0_chatgpt_light.png',
    },
  },
  {
    id: 'gemini',
    name: 'Gemini',
    pattern: /gemini/i,
    icon: {
      light: 'https://base44.app/api/apps/6a6982f0647238bf2b5d67bf/files/mp/public/6a6982f0647238bf2b5d67bf/16c512d437efad02cfa8f6a86938f371_gemini_dark.png',
      dark: 'https://base44.app/api/apps/6a6982f0647238bf2b5d67bf/files/mp/public/6a6982f0647238bf2b5d67bf/8f30c533ee386041a834a7da8461646b_gemini_light.png',
    },
  },
  {
    id: 'grok',
    name: 'Grok',
    pattern: /grok|\bxai\b/i,
    icon: {
      light: 'https://base44.app/api/apps/6a6982f0647238bf2b5d67bf/files/mp/public/6a6982f0647238bf2b5d67bf/093c79a2f572abb1cb880eedf19efacd_grok_dark.png',
      dark: 'https://base44.app/api/apps/6a6982f0647238bf2b5d67bf/files/mp/public/6a6982f0647238bf2b5d67bf/6d0c503964846a73f70423a5d62f0afa_grok_light.png',
    },
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    pattern: /perplexity/i,
    icon: {
      light: 'https://base44.app/api/apps/6a6982f0647238bf2b5d67bf/files/mp/public/6a6982f0647238bf2b5d67bf/4f0a5b83835a5db5234688faa22961bb_perplexity_dark.png',
      dark: 'https://base44.app/api/apps/6a6982f0647238bf2b5d67bf/files/mp/public/6a6982f0647238bf2b5d67bf/f9a970d0cf6a1b7ce857d3d677c5d2c7_perplexity_light.png',
    },
  },
];

/** Matches a report source label such as "ChatGPT · Mar 4" to its provider. */
export function providerFor(label) {
  const text = String(label || '');
  return AI_PROVIDERS.find((p) => p.pattern.test(text)) || null;
}