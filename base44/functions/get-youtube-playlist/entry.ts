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

    const videoBlocks = html.split('"playlistVideoRenderer":{').slice(1);
    const seen = new Set();
    const videos = [];

    for (const block of videoBlocks) {
      const idMatch = block.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
      if (!idMatch) continue;
      const videoId = idMatch[1];
      if (seen.has(videoId)) continue;
      seen.add(videoId);

      let title = '';
      const simpleTitle = block.match(/"title":\{"runs":\[\{"text":"([^"]+)"/) || block.match(/"title":\{"simpleText":"([^"]+)"/);
      if (simpleTitle) title = simpleTitle[1];
      title = title.replace(/\\u0026/g, '&').replace(/\\"/g, '"');

      videos.push({ video_id: videoId, title: title || `Episode ${videos.length + 1}` });
    }

    console.log('YouTube playlist fetched:', videos.length, 'videos');
    return Response.json({ videos });
  } catch (error) {
    console.error('YouTube playlist fetch error:', error.message);
    return Response.json({ error: error.message, videos: [] }, { status: 500 });
  }
}