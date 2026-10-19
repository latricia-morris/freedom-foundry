import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowUpRight, Check, FileText, Mail, MapPin, Phone, Printer } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const KNOWN_FONTS = {
  'cormorant garamond': 'Cormorant Garamond',
  'dm sans': 'DM Sans',
  'inter': 'Inter',
  'libre baskerville': 'Libre Baskerville',
  'lora': 'Lora',
  'montserrat': 'Montserrat',
  'playfair display': 'Playfair Display',
  'poppins': 'Poppins',
  'raleway': 'Raleway',
  'space grotesk': 'Space Grotesk',
  'urbanist': 'Urbanist',
};

const GOOGLE_FONT_FAMILIES = Object.values(KNOWN_FONTS).map(font => `${font.replaceAll(' ', '+')}:wght@400;500;600;700`).join('&family=');
const HEX_COLOR = /^#(?:[\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i;

function usePublicFonts() {
  useEffect(() => {
    const id = 'freedom-foundry-public-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${GOOGLE_FONT_FAMILIES}&display=swap`;
    document.head.appendChild(link);
  }, []);
}

function readableArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

/** Clipboard write with a fallback for browsers that refuse the async API. */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.focus();
    area.select();
    try { document.execCommand('copy'); } finally { area.remove(); }
  }
}

function safeHref(value, type = 'web') {
  if (typeof value !== 'string' || !value.trim()) return null;
  if (type === 'email') return `mailto:${value.trim()}`;
  if (type === 'phone') return `tel:${value.trim().replace(/[^\d+]/g, '')}`;
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  try {
    const url = new URL(value.includes('://') ? value : `https://${value}`);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function isImage(url) {
  return /\.(avif|gif|jpe?g|png|svg|webp)(?:\?.*)?$/i.test(url || '');
}

export function ShareSection({ eyebrow, action, children }) {
  if (!children) return null;
  return (
    <section className="border-t border-[#3b3028]/12 pt-7 first:border-t-0 first:pt-0">
      {(eyebrow || action) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {eyebrow && <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9a6242]">{eyebrow}</p>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

function PublicLink({ label, url, description }) {
  const safeUrl = safeHref(url);
  if (!safeUrl) return null;
  return (
    <a
      href={safeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between gap-4 rounded-xl border border-[#3b3028]/12 bg-white/70 px-4 py-3 text-left transition-colors hover:border-[#9a6242]/40 hover:bg-white"
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-[#29221e]">{label || 'Open link'}</span>
        {description && <span className="mt-0.5 block truncate text-xs text-[#655b54]">{description}</span>}
      </span>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-black transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
  );
}

/** One saved color. The whole swatch copies its exact HEX value. */
function ColorSwatch({ color }) {
  const value = typeof color?.hex === 'string' ? color.hex.trim() : '';
  const name = typeof color?.name === 'string' ? color.name.trim() : '';
  const role = typeof color?.role === 'string' ? color.role.trim() : '';
  const valid = HEX_COLOR.test(value);
  const copy = () => {
    if (!valid) return;
    navigator.clipboard.writeText(value)
      .then(() => toast({ title: 'Color copied', description: name ? `${name} (${value}) is on your clipboard.` : `${value} is on your clipboard.` }))
      .catch(() => {});
  };
  return (
    <button
      type="button"
      onClick={copy}
      disabled={!valid}
      title={valid ? `Copy ${value}` : undefined}
      className="overflow-hidden rounded-xl border border-[#3b3028]/12 bg-white/75 text-left transition-colors hover:border-[#9a6242]/40 disabled:cursor-default"
    >
      <div
        className="h-20 border-b border-[#3b3028]/12"
        style={valid ? { backgroundColor: value } : {
          backgroundImage: 'repeating-linear-gradient(45deg, #ede8df 0, #ede8df 10px, #ded6ca 10px, #ded6ca 20px)',
        }}
        aria-label={valid ? `${name || 'Brand'} color ${value}` : 'Color preview unavailable'}
      />
      <div className="p-3">
        {name && <p className="truncate text-sm font-semibold text-[#29221e]">{name}</p>}
        <p className={`font-mono text-xs text-[#655b54] ${name ? 'mt-0.5' : ''}`}>{value || 'No hex value supplied'}</p>
        {role && <p className="mt-1 truncate text-xs text-[#655b54]">{role}</p>}
        {!valid && <p className="mt-2 flex items-center gap-1 text-xs text-black"><AlertTriangle className="h-3.5 w-3.5" /> Preview unavailable</p>}
      </div>
    </button>
  );
}

const SPECIMEN_TEXT = 'The future feels unmistakably yours.';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Tracks whether a font family is actually loaded in this browser.
 * Only genuinely loaded webfonts count: a generic or missing family must
 * never be presented as an accurate preview of the brand font.
 */
function useFontAvailability(family) {
  const [state, setState] = useState(family ? 'loading' : 'none');
  useEffect(() => {
    if (!family) return undefined;
    let active = true;
    setState('loading');
    const fontSet = document.fonts;
    if (!fontSet) {
      if (active) setState('unavailable');
      return undefined;
    }
    (async () => {
      try {
        const spec = `16px "${family}"`;
        let faces = await fontSet.load(spec);
        if (!faces.length) { await wait(400); faces = await fontSet.load(spec); }
        if (!faces.length) { await fontSet.ready; faces = await fontSet.load(spec); }
        if (active) setState(faces.length ? 'available' : 'unavailable');
      } catch {
        if (active) setState('unavailable');
      }
    })();
    return () => { active = false; };
  }, [family]);
  return state;
}

function FontSpecimen({ label, font }) {
  const supplied = typeof font === 'string' ? font.trim() : '';
  const registered = KNOWN_FONTS[supplied.toLowerCase()];
  const family = registered || supplied;
  const availability = useFontAvailability(family);
  if (!supplied) return null;
  return (
    <div className="rounded-xl border border-[#3b3028]/12 bg-white/75 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a6242]">{label}</p>
      {availability === 'loading' && <p className="mt-3 text-xs text-[#655b54]">Loading font preview&hellip;</p>}
      {availability === 'available' && (
        <>
          <p className="mt-3 text-2xl text-[#29221e]" style={{ fontFamily: `"${family}", serif` }}>{SPECIMEN_TEXT}</p>
          <p className="mt-2 text-xs text-[#655b54]">{supplied}</p>
        </>
      )}
      {availability === 'unavailable' && (
        <>
          <p className="mt-3 text-2xl text-[#29221e]">{SPECIMEN_TEXT}</p>
          <p className="mt-2 text-xs text-[#655b54]">{supplied}</p>
          <p className="mt-2 text-xs font-medium text-[#29221e]">
            Font preview unavailable. The text shown here uses a fallback font and does not represent {supplied}.
          </p>
        </>
      )}
    </div>
  );
}

function AssetGallery({ assets, logos, headshots, moodboards }) {
  const assetsToDisplay = [
    ...readableArray(logos).map(url => ({ url, label: 'Logo' })),
    ...readableArray(headshots).map(url => ({ url, label: 'Headshot' })),
    ...readableArray(moodboards).map(url => ({ url, label: 'Mood board' })),
    ...readableArray(assets).map(asset => ({ url: asset?.file_url, label: asset?.title || asset?.file_type || 'Brand asset', description: asset?.description })),
  ].filter(asset => asset.url).map(asset => ({ ...asset, safeUrl: safeHref(asset.url) }));

  if (!assetsToDisplay.length) return null;
  return (
    <ShareSection eyebrow="Visual library">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {assetsToDisplay.map((asset, index) => !asset.safeUrl ? (
          <div key={`${asset.url}-${index}`} className="flex min-h-32 flex-col justify-between rounded-xl border border-dashed border-[#3b3028]/20 bg-white/50 p-4">
            <AlertTriangle className="h-5 w-5 text-black" />
            <span>
              <span className="block text-sm font-semibold text-[#29221e]">{asset.label}</span>
              <span className="mt-1 block text-xs text-[#655b54]">Preview unavailable for this asset.</span>
            </span>
          </div>
        ) : isImage(asset.safeUrl) ? (
          <a key={`${asset.url}-${index}`} href={asset.safeUrl} target="_blank" rel="noopener noreferrer" className="group overflow-hidden rounded-xl border border-[#3b3028]/12 bg-white">
            <img src={asset.safeUrl} alt={asset.label} className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
            <span className="block truncate px-3 py-2 text-xs font-medium text-[#50453e]">{asset.label}</span>
          </a>
        ) : (
          <a key={`${asset.url}-${index}`} href={asset.safeUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-32 flex-col justify-between rounded-xl border border-[#3b3028]/12 bg-white p-4 transition-colors hover:border-[#9a6242]/40">
            <FileText className="h-5 w-5 text-black" />
            <span>
              <span className="block text-sm font-semibold text-[#29221e]">{asset.label}</span>
              {asset.description && <span className="mt-1 block text-xs text-[#655b54]">{asset.description}</span>}
            </span>
          </a>
        ))}
      </div>
    </ShareSection>
  );
}

/** Builds the complete permitted textual information for this share as Markdown. */
function buildDetailsMarkdown(data, colorLines) {
  const profile = data.profile || {};
  const brand = data.brand || {};
  const guidelines = data.guidelines || {};
  const person = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
  const title = profile.company_name || profile.business_name || person || 'Shared Brand Kit';
  const lines = [`# ${title}`];
  const push = (label, value) => {
    const v = typeof value === 'string' ? value.trim() : '';
    if (v) lines.push('', `## ${label}`, '', v);
  };
  const tagline = (profile.tagline || brand.tagline || '').trim();
  if (tagline) lines.push('', `_${tagline}_`);
  push('Mission statement', profile.mission_statement || brand.mission_statement);
  push('Short bio', profile.short_bio);
  push('Biography', profile.long_bio);
  push('Positioning', brand.positioning || profile.positioning);
  push('Target audience', brand.target_audience || profile.target_audience);
  push('Brand voice', brand.voice || profile.brand_voice);
  push('Tonality', brand.tonality || profile.brand_tonality);
  push('Brand personality', profile.brand_personality);
  push('Brand specs', profile.brand_specs);
  if (colorLines.length) lines.push('', '## Colors', '', ...colorLines.map((line) => `- ${line}`));
  const fontEntries = Object.entries({
    Heading: brand.fonts?.heading_font || profile.heading_font || guidelines.heading_font,
    Subheading: brand.fonts?.subheading_font || profile.subheading_font || guidelines.subheading_font,
    Body: brand.fonts?.body_font || profile.body_font || guidelines.body_font,
    Accent: brand.fonts?.accent_font || profile.accent_font || guidelines.accent_font,
  }).filter(([, f]) => typeof f === 'string' && f.trim());
  if (fontEntries.length) lines.push('', '## Typography', '', ...fontEntries.map(([label, f]) => `- ${label}: ${f.trim()}`));
  const links = [
    profile.website && { label: 'Website', url: profile.website },
    ...readableArray(profile.social_links).map((link) => ({ label: link?.platform || 'Social channel', url: link?.url })),
    ...readableArray(profile.feature_links).map((link) => ({ label: link?.label || 'Featured link', url: link?.url })),
    ...readableArray(profile.book_links).map((link) => ({ label: link?.title || 'Published book', url: link?.url })),
    ...readableArray(profile.podcast_links).map((link) => ({ label: link?.platform || 'Podcast channel', url: link?.url })),
  ].filter((link) => safeHref(link.url));
  if (links.length) lines.push('', '## Links', '', ...links.map((link) => `- ${link.label}: ${safeHref(link.url)}`));
  const guidance = [
    ['Logo usage', guidelines.logo_usage_notes],
    ['Color usage', guidelines.color_usage_notes],
    ['Typography', guidelines.typography_notes],
    ['Photography', guidelines.photography_style],
    ['Tone & voice', guidelines.tone_notes],
    ['Avoid', guidelines.brand_dont_list],
    ['Additional standards', guidelines.additional_standards],
  ].filter(([, value]) => value);
  if (guidance.length) {
    lines.push('', '## Guidance', '');
    guidance.forEach(([label, value]) => lines.push(`### ${label}`, '', value, ''));
  }
  const contact = [
    profile.email && `Email: ${profile.email}`,
    profile.phone && `Phone: ${profile.phone}`,
    [profile.location_city, profile.location_state, profile.location_country].filter(Boolean).join(', ') && `Location: ${[profile.location_city, profile.location_state, profile.location_country].filter(Boolean).join(', ')}`,
  ].filter(Boolean);
  if (contact.length) lines.push('', '## Contact', '', ...contact);
  return lines.join('\n');
}

export default function PublicBrandKit({ data }) {
  usePublicFonts();
  const profile = data.profile || {};
  const brand = data.brand || {};
  const guidelines = data.guidelines || {};
  const title = profile.company_name || profile.business_name || [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Shared Brand Kit';
  const subtitle = profile.tagline || brand.tagline || profile.short_bio || brand.mission_statement;
  const contact = [
    profile.email && { type: 'email', label: profile.email, icon: Mail },
    profile.phone && { type: 'phone', label: profile.phone, icon: Phone },
    [profile.location_city, profile.location_state, profile.location_country].filter(Boolean).join(', ') && { type: 'location', label: [profile.location_city, profile.location_state, profile.location_country].filter(Boolean).join(', '), icon: MapPin },
  ].filter(Boolean);
  const fonts = {
    'Heading': brand.fonts?.heading_font || profile.heading_font || guidelines.heading_font,
    'Subheading': brand.fonts?.subheading_font || profile.subheading_font || guidelines.subheading_font,
    'Body': brand.fonts?.body_font || profile.body_font || guidelines.body_font,
    'Accent': brand.fonts?.accent_font || profile.accent_font || guidelines.accent_font,
  };
  const colors = readableArray(profile.colors ?? brand.colors);
  const colorLines = colors.map((color) => {
    const hex = typeof color?.hex === 'string' ? color.hex.trim() : '';
    const name = typeof color?.name === 'string' ? color.name.trim() : '';
    return hex ? (name ? `${name}: ${hex}` : hex) : '';
  }).filter(Boolean);

  const copyAllColors = () => {
    if (!colorLines.length) return;
    navigator.clipboard.writeText(colorLines.join('\n'))
      .then(() => toast({ title: 'All colors copied', description: 'The full palette is on your clipboard.' }))
      .catch(() => {});
  };

  const copyAllDetails = () => {
    const text = buildDetailsMarkdown(data, colorLines);
    navigator.clipboard.writeText(text)
      .then(() => toast({ title: 'All details copied', description: 'The complete shared information is on your clipboard.' }))
      .catch(() => {});
  };
  const links = [
    ...(profile.website ? [{ label: 'Website', url: profile.website, description: profile.website }] : []),
    ...readableArray(profile.social_links).map(link => ({ label: link?.platform || 'Social channel', url: link?.url, description: link?.url })),
    ...readableArray(profile.feature_links).map(link => ({ label: link?.label || 'Featured link', url: link?.url, description: link?.url })),
    ...readableArray(profile.book_links).map(link => ({ label: link?.title || 'Published book', url: link?.url, description: 'Published book' })),
    ...readableArray(profile.podcast_links).map(link => ({ label: link?.platform || 'Podcast channel', url: link?.url, description: link?.url })),
  ];

  return (
    <div className="brand-kit-print min-h-screen bg-[#ede8df] px-4 py-8 text-[#29221e] sm:px-6 sm:py-12">
      <main className="mx-auto max-w-5xl">
        <header className="overflow-hidden rounded-3xl bg-[#251d18] px-6 py-9 text-[#f7f2ea] shadow-[0_24px_70px_rgba(37,29,24,0.2)] sm:px-10 sm:py-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#e4a06e]">Shared brand kit</p>
          <h1 className="mt-4 max-w-3xl font-heading text-4xl font-light leading-tight sm:text-6xl">{title}</h1>
          {subtitle && <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#f7f2ea]/72 sm:text-lg">{subtitle}</p>}
          <div className="mt-6 flex flex-wrap gap-2 brand-kit-noprint">
            <button
              type="button"
              onClick={copyAllDetails}
              className="border border-white/25 px-4 py-2 text-sm font-semibold text-[#f7f2ea] transition-colors hover:bg-white/10"
              style={{ borderRadius: '7px' }}
            >
              Copy all details
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 border border-white/25 px-4 py-2 text-sm font-semibold text-[#f7f2ea] transition-colors hover:bg-white/10"
              style={{ borderRadius: '7px' }}
            >
              <Printer className="h-4 w-4" /> Print / save PDF
            </button>
          </div>
        </header>

        <div className="mt-5 rounded-3xl bg-[#f7f2ea] p-6 shadow-[0_16px_50px_rgba(37,29,24,0.08)] sm:mt-6 sm:p-10">
          <div className="space-y-8">
            <AssetGallery assets={data.assets} logos={profile.logo_urls} headshots={profile.headshot_urls} moodboards={profile.moodboard_urls} />

            {colors.length > 0 && (
              <ShareSection
                eyebrow="Color palette"
                action={colorLines.length ? (
                  <button
                    type="button"
                    onClick={copyAllColors}
                    className="text-xs font-semibold text-[#9a6242] transition-colors hover:text-[#29221e]"
                  >
                    Copy all colors
                  </button>
                ) : null}
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  {colors.map((color, index) => <ColorSwatch key={`${color?.name || 'color'}-${index}`} color={color} />)}
                </div>
              </ShareSection>
            )}

            {Object.values(fonts).some(Boolean) && (
              <ShareSection eyebrow="Typography">
                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(fonts).map(([label, font]) => <FontSpecimen key={label} label={label} font={font} />)}
                </div>
              </ShareSection>
            )}

            {(profile.long_bio || profile.mission_statement || brand.mission_statement || brand.positioning || profile.positioning || brand.target_audience || profile.target_audience) && (
              <ShareSection eyebrow="Brand story">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-4">
                    {(profile.long_bio || profile.mission_statement || brand.mission_statement) && <p className="text-sm leading-7 text-[#50453e]">{profile.long_bio || profile.mission_statement || brand.mission_statement}</p>}
                    {(brand.positioning || profile.positioning) && <div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9a6242]">Positioning</p><p className="mt-2 text-sm leading-7 text-[#50453e]">{brand.positioning || profile.positioning}</p></div>}
                  </div>
                  <div className="space-y-4">
                    {(brand.target_audience || profile.target_audience) && <div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9a6242]">Audience</p><p className="mt-2 text-sm leading-7 text-[#50453e]">{brand.target_audience || profile.target_audience}</p></div>}
                    {(brand.voice || brand.tonality || profile.brand_voice || profile.brand_tonality) && <div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9a6242]">Voice & tone</p><p className="mt-2 text-sm leading-7 text-[#50453e]">{brand.voice || profile.brand_voice} {brand.tonality || profile.brand_tonality}</p></div>}
                  </div>
                </div>
              </ShareSection>
            )}

            {Object.values(guidelines).some(Boolean) && (
              <ShareSection eyebrow="Guidance">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    ['Logo usage', guidelines.logo_usage_notes],
                    ['Color usage', guidelines.color_usage_notes],
                    ['Typography', guidelines.typography_notes],
                    ['Photography', guidelines.photography_style],
                    ['Tone & voice', guidelines.tone_notes],
                    ['Avoid', guidelines.brand_dont_list],
                    ['Additional standards', guidelines.additional_standards],
                  ].filter(([, value]) => value).map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-[#3b3028]/12 bg-white/70 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9a6242]">{label}</p>
                      <p className="mt-2 text-sm leading-6 text-[#50453e]">{value}</p>
                    </div>
                  ))}
                </div>
              </ShareSection>
            )}

            {links.some(link => safeHref(link.url)) && (
              <ShareSection eyebrow="Links">
                <div className="grid gap-3 sm:grid-cols-2">
                  {links.map((link, index) => <PublicLink key={`${link.label}-${index}`} {...link} />)}
                </div>
              </ShareSection>
            )}

            {contact.length > 0 && (
              <ShareSection eyebrow="Contact">
                <div className="flex flex-wrap gap-3">
                  {contact.map(({ type, label, icon: Icon }) => {
                    const href = type === 'email' ? safeHref(label, 'email') : type === 'phone' ? safeHref(label, 'phone') : null;
                    const content = <><Icon className="h-4 w-4 text-black" /><span>{label}</span></>;
                    return href ? <a key={type} href={href} className="inline-flex items-center gap-2 rounded-full border border-[#3b3028]/12 bg-white px-4 py-2 text-sm text-[#50453e] transition-colors hover:border-[#9a6242]/40">{content}</a> : <span key={type} className="inline-flex items-center gap-2 rounded-full border border-[#3b3028]/12 bg-white px-4 py-2 text-sm text-[#50453e]">{content}</span>;
                  })}
                </div>
              </ShareSection>
            )}
          </div>
        </div>
        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-[#655b54]"><Check className="h-3.5 w-3.5 text-black" /> Shared via Freedom Foundry</p>
      </main>
    </div>
  );
}