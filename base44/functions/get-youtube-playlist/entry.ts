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

    const response = await fetch('https://www.youtube.com/youtubei/v1/browse', {
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

    // Renderer-agnostic walk: YouTube changes renderer key names over time.
    // Instead of matching a specific renderer name, walk every object node and
    // treat it as a video entry whenever it has BOTH a videoId and a title
    // (either { runs: [{ text }] } or { simpleText }) as sibling fields.
    function extractTitle(node: any): string {
      const t = node?.title;
      if (!t) return '';
      if (typeof t === 'string') return t;
      if (t.simpleText) return t.simpleText;
      if (Array.isArray(t.runs) && t.runs[0]?.text) {
        return t.runs.map((r: any) => r.text).join('');
      }
      return '';
    }

    function walk(node: any) {
      if (!node || typeof node !== 'object') return;

      if (Array.isArray(node)) {
        for (const item of node) walk(item);
        return;
      }

      const videoId = node.videoId;
      if (typeof videoId === 'string' && videoId.length === 11 && !seen.has(videoId)) {
        const title = extractTitle(node);
        if (title) {
          seen.add(videoId);
          videos.push({ video_id: videoId, title });
        }
      }

      for (const key in node) {
        walk(node[key]);
      }
    }

    walk(data);

    // Fallback: if innertube returned nothing usable, scrape the raw playlist
    // page and pull ytInitialData out of it, then run the same renderer-agnostic walk.
    if (videos.length === 0) {
      const pageResponse = await fetch(`https://www.youtube.com/playlist?list=${playlistId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      const html = await pageResponse.text();

      // Robustly extract the full ytInitialData JSON blob (balanced-brace scan,
      // since a non-greedy regex truncates large JSON).
      const marker = 'var ytInitialData = ';
      const startIdx = html.indexOf(marker);
      if (startIdx !== -1) {
        const jsonStart = startIdx + marker.length;
        let depth = 0;
        let endIdx = -1;
        for (let i = jsonStart; i < html.length; i++) {
          const ch = html[i];
          if (ch === '{') depth++;
          else if (ch === '}') {
            depth--;
            if (depth === 0) {
              endIdx = i + 1;
              break;
            }
          }
        }
        if (endIdx !== -1) {
          try {
            const initialData = JSON.parse(html.slice(jsonStart, endIdx));
            walk(initialData);
          } catch (e) {
            console.error('Failed to parse ytInitialData:', (e as Error).message);
          }
        }
      }

      // Last resort: regex scan raw HTML for videoId + nearby title text pairs.
    if (videos.length === 0) {
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
          videos.push({ video_id: videoId, title: title || `Episode` });
        }
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
