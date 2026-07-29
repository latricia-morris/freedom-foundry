import React, { useState, useEffect, useCallback } from 'react';
import { Youtube, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const PLAYLIST_ID = 'PLwrUeO4tzLBiAP_b_74-5WdAnccdHNvJp';

const platforms = [
  { label: 'Apple Podcasts', url: 'https://podcasts.apple.com/us/podcast/the-brand-revivalist/id1726407255' },
  { label: 'Spotify', url: 'https://open.spotify.com/show/0lzjturifcG8cRnkMG7gTC' },
  { label: 'Amazon Music', url: 'https://music.amazon.com/podcasts/0a6ee97c-ac13-4cfd-af69-1d7c36aab67e/the-brand-revivalist' },
];

export default function Podcast() {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    base44.functions.invoke('get-youtube-playlist', {})
      .then(res => {
        const vids = res?.data?.videos || res?.videos || [];
        setEpisodes(vids);
        if (vids.length > 0) setActiveVideo(vids[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleEpisodeClick = useCallback((video) => {
    setActiveVideo(video);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl lg:text-4xl font-light text-foreground mb-2">
          The <span className="molten-text italic">Podcast</span>
        </h1>
        <p className="text-sm text-muted-foreground">Brand Revivalist — conversations on building brands that create freedom and legacy.</p>
      </div>

      {activeVideo && (
        <div className="dashboard-card p-4 mb-6 overflow-hidden">
          <div className="aspect-video rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${activeVideo.video_id}?list=${PLAYLIST_ID}`}
              className="w-full h-full"
              allowFullScreen
              title={activeVideo.title}
            />
          </div>
          <h3 className="font-heading text-lg text-foreground mt-3">{activeVideo.title}</h3>
        </div>
      )}

      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">All Episodes</p>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-video bg-card animate-pulse rounded-lg" />
            ))}
          </div>
        ) : episodes.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {episodes.map((ep) => (
              <button key={ep.video_id} onClick={() => handleEpisodeClick(ep)} className="group text-left">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-card border border-border group-hover:border-copper/40 transition-colors">
                  <img
                    src={`https://i.ytimg.com/vi/${ep.video_id}/hqdefault.jpg`}
                    alt={ep.title}
                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
                      <Youtube className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-foreground mt-2 line-clamp-2">{ep.title}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="dashboard-card p-8 text-center">
            <iframe
              src="https://www.youtube.com/embed/videoseries?list=PLwrUeO4tzLBiAP_b_74-5WdAnccdHNvJp"
              className="w-full aspect-video rounded-lg"
              allowFullScreen
              title="Brand Revivalist Podcast"
            />
          </div>
        )}
      </div>

      <a href="https://youtube.com/@brandrevivalist?sub_confirmation=1" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 w-full py-4 forged-gradient rounded-xl text-white text-sm uppercase tracking-[0.2em] font-medium transition-all hover:ember-glow-strong mb-6">
        <Youtube className="w-5 h-5" strokeWidth={1.5} /> Subscribe on YouTube
      </a>

      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 text-center">Also available on</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {platforms.map(platform => (
            <a key={platform.label} href={platform.url} target="_blank" rel="noopener noreferrer" className="dashboard-card p-4 flex items-center justify-center gap-2 text-sm text-foreground hover:text-copper transition-colors">
              <ExternalLink className="w-4 h-4 icon-warm" strokeWidth={1.5} /> {platform.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}