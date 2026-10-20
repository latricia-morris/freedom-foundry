import { Image } from '@/components/ui/image';

/**
 * Linked assets on a shared brand kit: Canva designs and other external links
 * saved with the brand, shown with the design's own preview and original
 * title — no external-link icons or source labels.
 */
export default function PublicLinkedAssets({ links }) {
  const items = (Array.isArray(links) ? links : []).filter((item) => item?.url);
  if (!items.length) return null;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((item, index) => {
        let href = null;
        try {
          const url = new URL(item.url.includes('://') ? item.url : `https://${item.url}`);
          href = ['http:', 'https:'].includes(url.protocol) ? url.href : null;
        } catch { href = null; }
        if (!href) return null;
        return (
          <a
            key={item.id || `link-${index}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="overflow-hidden rounded-xl border border-[#3b3028]/12 bg-white transition-colors hover:border-[#9a6242]/40"
          >
            {item.preview_url ? (
              <div className="aspect-video w-full overflow-hidden">
                <Image src={item.preview_url} alt={item.title || 'Linked asset'} fittingType="fill" className="h-full w-full" />
              </div>
            ) : null}
            <span className="block truncate px-4 py-3 text-sm font-semibold text-[#29221e]">
              {item.title || 'Open asset'}
            </span>
          </a>
        );
      })}
    </div>
  );
}