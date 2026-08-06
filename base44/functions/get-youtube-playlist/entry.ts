export default async function (req: Request): Promise<Response> {
  try {
    const playlistId = 'PLwrUeO4tzLBiAP_b_74-5WdAnccdHNvJp';

    // YouTube's public playlist RSS feed is a stable, documented endpoint that
    // returns clean XML with video IDs and titles (no scraping / no internal
    // renderer JSON needed). Note: RSS feeds cap at the 15 most recent items,
    // so we also fetch the channel-uploads style feed is NOT needed here since
    // we only need the playlist's items.
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;

    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const xml = await response.text();

    const videos: { video_id: string; title: string }[] = [];
    const seen = new Set<string>();

    // Each <entry> block contains <yt:videoId>ID</yt:videoId> and <title>TEXT</title>
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let entryMatch;
    while ((entryMatch = entryRegex.exec(xml)) !== null) {
      const block = entryMatch[1];
      const idMatch = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      const titleMatch = block.match(/<title>([^<]+)<\/title>/);
      if (idMatch && titleMatch) {
        const videoId = idMatch[1].trim();
        const title = titleMatch[1]
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim();
        if (!seen.has(videoId)) {
          seen.add(videoId);
          videos.push({ video_id: videoId, title });
        }
      }
    }

    // Fallback: if the RSS feed is empty (unlikely, but playlists >15 items
    // won't fully appear via RSS), scrape the raw playlist HTML page for
    // videoId + nearby title text as a best-effort backup so the page never
    // shows a totally empty state.
    if (videos.length === 0) {
      const pageResponse = await fetch(`https://www.youtube.com/playlist?list=${playlistId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      const html = await pageResponse.text();

      const idRegex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
      let match;
      while ((match = idRegex.exec(html)) !== null) {
        const videoId = match[1];
        if (!seen.has(videoId)) {
          const idx = match.index;
          const before = html.slice(Math.max(0, idx - 700), idx);
          const after = html.slice(idx, idx + 700);
          const titleRegex = /"(?:text|simpleText)":"([^"]{3,150})"/g;
          let title = '';
          let m;
          while ((m = titleRegex.exec(before)) !== null) title = m[1];
          if (!title) {
            const am = titleRegex.exec(after);
            if (am) title = am[1];
          }
          seen.add(videoId);
          videos.push({ video_id: videoId, title: title || 'Episode' });
        }
      }
    }

    console.log('YouTube playlist videos found:', videos.length);

    return Response.json({ videos });
  } catch (error) {
    console.error('YouTube playlist fetch error:', (error as Error).message);
    return Response.json({ videos: [], error: (error as Error).message });
  }
}
