/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#f7f2ea',
    tint: '#e4a06e',

    // Core surfaces
    background: '#14110f',
    foreground: '#f7f2ea',

    // Cards / elevated surfaces
    card: '#201510',
    cardForeground: '#f7f2ea',

    // Primary action color (buttons, links, active states)
    primary: '#e4a06e',
    primaryForeground: '#25140d',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#2b1710',
    secondaryForeground: '#f7f2ea',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#281d18',
    mutedForeground: '#d9c9a3',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#3a2119',
    accentForeground: '#f7f2ea',

    // Destructive actions (delete, error states)
    destructive: '#b3232c',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#58372a',
    input: '#2b1c16',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 16,
};

export default colors;
