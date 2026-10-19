// Resolves a link's own title (currently Canva design links) so forms can
// prefill it instead of asking the user to type a name manually.
// Tries a direct fetch of the page's og:title first, then falls back to a
// reader proxy because Canva blocks plain server-side requests.

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

export default async function(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const raw = String(body.url || '').trim();
    let parsed;
    try { parsed = new URL(raw); } catch { return Response.json({ title: '' }); }
    if (!/^https?:$/.test(parsed.protocol) || !/(^|\.)canva\.com$/i.test(parsed.hostname)) {
      return Response.json({ title: '' });
    }

    let title = '';
    try {
      const res = await fetch(parsed.toString(), {
        redirect: 'follow',
        signal: AbortSignal.timeout(12000),
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FreedomFoundryBot/1.0)' },
      });
      if (res.ok) {
        const html = (await res.text()).slice(0, 300000);
        const match = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
          || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)
          || html.match(/<title[^>]*>([^<]+)<\/title>/i);
        title = cleanTitle(match ? match[1] : '');
      }
    } catch { /* fall through to the proxy */ }

    if (!title) {
      try {
        const proxy = await fetch(`https://r.jina.ai/${parsed.toString()}`, { signal: AbortSignal.timeout(20000) });
        console.log('fetch-link-title proxy status:', proxy.status);
        if (proxy.ok) {
          const text = (await proxy.text()).slice(0, 5000);
          const match = text.match(/^Title:\s*(.+)$/m);
          if (match) title = cleanTitle(match[1]);
        }
      } catch (proxyError) {
        console.log('fetch-link-title proxy error:', proxyError.message);
      }
    }

    return Response.json({ title });
  } catch (error) {
    console.error('fetch-link-title error:', error.message);
    return Response.json({ title: '' });
  }
}