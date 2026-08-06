export default async function (req: Request): Promise<Response> {
  try {
    const playlistId = 'PLwrUeO4tzLBiAP_b_74-5WdAnccdHNvJp';

    const innertubeBody = {
      context: {
        client: {
          clientName: 'WEB',
          clientVersion: '2.20240101.00.00',
        },
      },
      browseId: `VL${playlistId}`,
    };

    const response = await fetch('https://www.youtube.com/youtubei/v1/browse?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: JSON.stringify(innertubeBody),
    });

    const data = await response.json();

    const videos: { video_id: string; title: string }[] = [];
    const seen = new Set<string>();

    // Recursively walk the JSON tree looking for playlistVideoRenderer nodes
    function walk(node: any) {
      if (!node || typeof node !== 'object') return;

      if (node.playlistVideoRenderer) {
        const r = node.playlistVideoRenderer;
        const videoId = r.videoId;
        let title = '';
        if (r.title?.runs?.[0]?.text) title = r.title.runs[0].text;
        else if (r.title?.simpleText) title = r.title.simpleText;
        if (videoId && !seen.has(videoId)) {
          seen.add(videoId);
          videos.push({ video_id: videoId, title: title || `Episode` });
        }
      }

      for (const key in node) {
        const child = node[key];
        if (Array.isArray(child)) {
          for (const item of child) walk(item);
        } else if (child && typeof child === 'object') {
          walk(child);
        }
      }
    }

    walk(data);

    // Fallback: if innertube API returned nothing, scrape the raw playlist page
    if (videos.length === 0) {
      const pageResponse = await fetch(`https://www.youtube.com/playlist?list=${playlistId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      const html = await pageResponse.text();

      const scriptMatch = html.match(/var ytInitialData = (\{.*?\});/s);
      if (scriptMatch) {
        try {
          const initialData = JSON.parse(scriptMatch[1]);
          walk(initialData);
        } catch (e) {
          console.error('Failed to parse ytInitialData:', e.message);
        }
      }

      // Last resort: regex scan raw HTML for videoId + title pairs
      if (videos.length === 0) {
        const idRegex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
        let match;
        while ((match = idRegex.exec(html)) !== null) {
          const videoId = match[1];
          if (!seen.has(videoId)) {
            seen.add(videoId);
            videos.push({ video_id: videoId, title: `Episode` });
          }
        }
      }
    }

    console.log('YouTube playlist videos found:', videos.length);

    return Response.json({ videos });
  } catch (error) {
    console.error('YouTube playlist fetch error:', error.message);
    return Response.json({ videos: [], error: error.message });
  }
}
