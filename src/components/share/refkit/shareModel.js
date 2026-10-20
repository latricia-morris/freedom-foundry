import { safeUrl } from './pieces';

const arr = (v) => (Array.isArray(v) ? v.filter(Boolean) : []);
const txt = (v) => (typeof v === 'string' ? v.trim() : '');
export const paras = (v) => txt(v).split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
const excerpt = (v, n = 2) => paras(v).slice(0, n).join('\n\n');

/** Normalizes any shared profile type into the fields the reference layouts render. */
export function buildModel(type, p) {
  const person = [p.first_name, p.last_name].filter(Boolean).join(' ');
  const brand = p.company_name || p.business_name || person;
  const books = arr(p.book_links).filter((b) => b?.title && !/amazon/i.test(b.title));
  const links = [
    ['Website', p.website],
    ...arr(p.feature_links).map((l) => [l.label || 'Link', l.url]),
    ...arr(p.social_links).map((l) => [l.platform || 'Social', l.url]),
    ...arr(p.social_channels).map((l) => [l.platform || 'Social', l.url]),
  ].map(([l, u]) => [l, safeUrl(u)]).filter(([, u]) => u);
  const fonts = [['Heading', p.heading_font], ['Subheading', p.subheading_font], ['Body', p.body_font], ['Accent', p.accent_font]]
    .map(([r, f]) => [r, txt(f)]).filter(([, f]) => f);
  const strategy = [
    ['Positioning', excerpt(p.positioning)],
    ['Audience', excerpt(p.target_audience)],
    ['Brand personality', excerpt(p.brand_personality, 1)],
    ['Brand voice', excerpt(p.brand_voice, 1)],
    ['Tone', excerpt(p.brand_tonality, 1)],
  ].filter(([, t]) => t);
  const assets = [
    ...arr(p.headshot_urls).map((url, i) => ({ url, label: `Portrait ${i + 1}` })),
    ...arr(p.logo_urls).map((url) => ({ url, label: `${brand} logo` })),
    ...arr(p.moodboard_urls).map((url, i) => ({ url, label: `Mood board ${i + 1}` })),
  ];
  const location = [p.location_city, p.location_state, p.location_country].filter(Boolean).join(', ');
  const colors = arr(p.colors).filter((c) => /^#[\da-f]{3,8}$/i.test(txt(c.hex)));
  const all = [
    `# ${person || brand}`, `## ${{ corporate: 'Corporate Brand', personal: 'Personal Brand', media_kit: 'Media Kit' }[type]}`,
    p.short_bio && `## Short bio\n${p.short_bio}`, p.long_bio && `## Biography\n${p.long_bio}`,
    ...strategy.map(([h, t]) => `## ${h}\n${t}`),
    fonts.length && `## Typography\n${fonts.map(([r, f]) => `${r}: ${f}`).join('\n')}`,
    colors.length && `## Colors\n${colors.map((c) => (c.name ? `${c.name}: ${c.hex}` : c.hex)).join('\n')}`,
    links.length && `## Links\n${links.map(([l, u]) => `${l}: ${u}`).join('\n')}`,
    `## Contact\n${[p.email, p.phone, location].filter(Boolean).join('\n')}`,
  ].filter(Boolean).join('\n\n');
  return { person, brand, books, links, fonts, strategy, assets, location, colors, all,
    lead: excerpt(p.positioning || p.mission_statement || p.short_bio),
    portrait: arr(p.headshot_urls)[0], logo: arr(p.logo_urls)[0] };
}