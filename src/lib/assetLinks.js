import { base44 } from '@/api/base44Client';

/** Helpers for external asset links (Canva, Figma, etc.). */

function cleanCanvaTitle(value) {
  let title = (value || '').trim();
  if (/\s\|\s*Canva$/i.test(title)) title = title.replace(/\s\|\s*Canva$/i, '');
  return title.trim();
}

function pickPreviewImage(source) {
  // Prefer the public CDN preview (loads anywhere), then og:image.
  const pub = source.match(/https:\/\/media-public\.canva\.com\/[^"'\s<>]+?\/screen_2x\.jpg/i)
    || source.match(/https:\/\/media-public\.canva\.com\/[^"'\s<>]+?\/(?:screen|thumbnail-1)\.jpg/i);
  if (pub) return pub[0];
  const og = source.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/i)
    || source.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image)["']/i);
  return og ? og[1] : '';
}

/**
 * Resolves a link's own title and preview image (Canva design links).
 * The reader proxy runs from the browser, where Canva's server block does not
 * apply; the backend function is the fallback.
 */
export async function resolveLinkMeta(url) {
  try {
    const res = await fetch(`https://r.jina.ai/${url}`, { headers: { 'X-Return-Format': 'html' } });
    if (res.ok) {
      const html = (await res.text()).slice(0, 300000);
      const title = cleanCanvaTitle(/<title[^>]*>([^<]+)<\/title>/i.exec(html)?.[1] || '');
      const image = pickPreviewImage(html);
      if (title || image) return { title, image };
    }
  } catch { /* fall through to the backend */ }
  try {
    const res = await base44.functions.invoke('fetch-link-title', { url });
    return (res?.data ?? res) || {};
  } catch {
    return {};
  }
}

/** Returns the embeddable Canva viewer URL for a Canva share/view link, else null. */
export function canvaEmbedUrl(url) {
  if (typeof url !== 'string') return null;
  const match = url.match(/canva\.com\/design\/([A-Za-z0-9_-]+)\/view/);
  return match ? `https://www.canva.com/design/${match[1]}/view?embed` : null;
}

/** Short human label for the link's source. */
export function linkSourceLabel(url) {
  if (/canva\.com/.test(url)) return 'Canva';
  if (/figma\.com/.test(url)) return 'Figma';
  if (/drive\.google\.com/.test(url)) return 'Shared files';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'Link';
  }
}