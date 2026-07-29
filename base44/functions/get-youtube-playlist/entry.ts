export default async function(req: Request): Promise<Response> {
  try {
    const playlistId = 'PLwrUeO4tzLBiAP_b_74-5WdAnccdHNvJp';
    const response = await fetch(`https://www.youtube.com/playlist?list=${playlistId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    const html = await response.text();

    // Extract video IDs from the page JSON
    const videoIdMatches = [...html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)];
    const seen = new Set();
    const videos = [];

    for (const m of videoIdMatches) {
      const videoId = m[1];
      if (seen.has(videoId)) continue;
      seen.add(videoId);

      // Try to find a title near this videoId in the JSON
      const afterMatch = html.substring(m.index, m.index + 2000);
      let title = '';
      const simpleTitle = afterMatch.match(/"title":\{"simpleText":"([^"]+)"/);
      const runsTitle = afterMatch.match(/"title":\{"runs":\[\{"text":"([^"]+)"/);
      if (simpleTitle) title = simpleTitle[1];
      else if (runsTitle) title = runsTitle[1];

      videos.push({ video_id: videoId, title: title || `Episode ${videos.length + 1}` });
    }

    console.log('YouTube playlist fetched:', videos.length, 'videos');
    return Response.json({ videos });
  } catch (error) {
    console.error('YouTube playlist fetch error:', error.message);
    return Response.json({ error: error.message, videos: [] }, { status: 500 });
  }
}