/** Helpers for external asset links (Canva, Figma, etc.). */

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