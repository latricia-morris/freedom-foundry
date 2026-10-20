// Resolves a link's own title and Open Graph preview image (Canva design
// links, including canva.link short links) so links save with their original
// name and real preview. Tries a direct fetch of the page first, then falls
// back to a reader proxy because Canva blocks plain server-side requests.

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

function cleanTitle(value) {
  let title = decodeEntities(value || '');
  if (/\s\|\s*Canva$/i.test(title)) title = title.replace(/\s\|\s*Canva$/i, '');
  return title.trim();
}

function isCanvaHost(hostname) {
  return /(^|\.)canva\.com$/i.test(hostname) || /(^|\.)canva\.link$/i.test(hostname);
}

function pickPreviewImage(source) {
  // Prefer the public CDN preview (loads anywhere), then og:image.
  const pub = source.match(/https:\/\/media-public\.canva\.com\/[^"'\s<>]+?\/screen_2x\.jpg/i)
    || source.match(/https:\/\/media-public\.canva\.com\/[^"'\s<>]+?\/(?:screen|thumbnail-1)\.jpg/i);
  if (pub) return pub[0];
  const og = source.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/i)
    || source.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image)["']/i);
  return og ? decodeEntities(og[1]) : '';
}

export default async function(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const raw = String(body.url || '').trim();
    let parsed;
    try { parsed = new URL(raw); } catch { return Response.json({ title: '', image: '' }); }
    if (parsed.protocol !== 'https:' || !isCanvaHost(parsed.hostname)) {
      return Response.json({ title: '', image: '' });
    }

    let title = '';
    let image = '';
    try {
      const res = await fetch(parsed.toString(), {
        redirect: 'follow',
        signal: AbortSignal.timeout(12000),
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FreedomFoundryBot/1.0)' },
      });
      // canva.link short URLs redirect to the real design page — only accept
      // the response when it landed on an official Canva host.
      if (res.ok && isCanvaHost(new URL(res.url).hostname)) {
        const html = (await res.text()).slice(0, 300000);
        title = cleanTitle(
          html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1]
          || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)?.[1]
          || html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]
          || ''
        );
        image = pickPreviewImage(html);
        // Canva serves a bot-block page ("Unsupported client") with a generic
        // og:image — discard that junk and fall through to the proxy instead.
        if (/unsupported client/i.test(title) || /static\.canva\.com\/static\/images\/fb_cover/i.test(image)) {
          title = '';
          image = '';
        }
      }
    } catch { /* fall through to the proxy */ }

    if (!title || !image) {
      try {
        // Rendered HTML from the reader proxy carries the real og:title and
        // og:image even when Canva blocks direct server-side requests.
        const proxy = await fetch(`https://r.jina.ai/${parsed.toString()}`, {
          headers: { 'X-Return-Format': 'html' },
          signal: AbortSignal.timeout(30000),
        });
        console.log('fetch-link-title proxy status:', proxy.status);
        if (proxy.ok) {
          const html = (await proxy.text()).slice(0, 300000);
          if (!title) {
            title = cleanTitle(
              html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]
              || html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1]
              || ''
            );
          }
          if (!image) image = pickPreviewImage(html);
        }
      } catch (proxyError) {
        console.log('fetch-link-title proxy error:', proxyError.message);
      }
    }

    // Markdown-format proxy fallback for the title when HTML was unavailable.
    if (!title) {
      try {
        const proxy = await fetch(`https://r.jina.ai/${parsed.toString()}`, { signal: AbortSignal.timeout(30000) });
        if (proxy.ok) {
          const text = (await proxy.text()).slice(0, 5000);
          const match = text.match(/^Title:\s*(.+)$/m);
          if (match) title = cleanTitle(match[1]);
        }
      } catch { /* best effort */ }
    }

    return Response.json({ title, image });
  } catch (error) {
    console.error('fetch-link-title error:', error.message);
    return Response.json({ title: '', image: '' });
  }
}