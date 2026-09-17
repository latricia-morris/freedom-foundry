import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '@/api/client';

const PLAYLIST_ID = 'PLwrUeO4tzLBiAP_b_74-5WdAnccdHNvJp';

const platforms = [
  { label: 'Apple Podcasts', url: 'https://podcasts.apple.com/us/podcast/the-brand-revivalist' },
  { label: 'Spotify', url: 'https://open.spotify.com/show/0lzjturifcG8cRnkMG7gTC' },
  { label: 'Amazon Music', url: 'https://music.amazon.com/podcasts/0a6ee97c-ac13' },
];

export default function Podcast() {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    // YouTube playlist fetching requires a server-side API key; the embedded
    // playlist player below still works without it.
    setEpisodes([]);
    setLoading(false);
  }, []);

  const handleEpisodeClick = useCallback((video) => {
    setActiveVideo(video);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl lg:text-4xl font-light">
          The <span className="molten-text italic">Podcast</span>
        </h1>
        <p className="text-sm text-muted-foreground">Brand Revivalist Podcast</p>
      </div>

      {activeVideo && (
        <div className="dashboard-card p-4 mb-6 overflow-hidden">
          <div className="aspect-video rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${activeVideo.video_id}`}
              className="w-full h-full"
              allowFullScreen
              title={activeVideo.title}
            />
          </div>
          <h3 className="font-heading text-lg text-foreground mt-3">{activeVideo.title}</h3>
        </div>
      )}

      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">Episodes</p>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-video bg-card animate-pulse rounded-lg" />
            ))}
          </div>
        ) : episodes.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {episodes.map((ep) => (
              <button
                key={ep.video_id}
                onClick={() => handleEpisodeClick(ep)}
                className="text-left group"
              >
                <div className="aspect-video rounded-lg overflow-hidden mb-2">
                  <img
                    src={`https://img.youtube.com/vi/${ep.video_id}/mqdefault.jpg`}
                    alt={ep.title}
                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                  />
                </div>
                <p className="text-sm text-foreground line-clamp-2">{ep.title}</p>
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

      <div className="mb-8">
        <a
          href="https://youtube.com/@brandrevivalist?sub_confirmation=1"
          target="_blank"
          rel="noopener noreferrer"
          className="link-warm text-sm uppercase tracking-[0.15em]"
        >
          Subscribe on YouTube
        </a>
      </div>

      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Also available on</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {platforms.map(platform => (
            <a
              key={platform.label}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="dashboard-card px-4 py-3 text-sm text-foreground hover:text-white transition-colors text-center"
            >
              {platform.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
