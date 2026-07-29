import React from 'react';
import { Youtube, ExternalLink } from 'lucide-react';

const platforms = [
  { label: 'Apple Podcasts', url: 'https://podcasts.apple.com/us/podcast/the-brand-revivalist/id1726407255' },
  { label: 'Spotify', url: 'https://open.spotify.com/show/0lzjturifcG8cRnkMG7gTC' },
  { label: 'Amazon Music', url: 'https://music.amazon.com/podcasts/0a6ee97c-ac13-4cfd-af69-1d7c36aab67e/the-brand-revivalist' },
];

export default function Podcast() {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl lg:text-4xl font-light text-foreground mb-2">The <span className="molten-text italic">Podcast</span></h1>
        <p className="text-sm text-muted-foreground">Brand Revivalist — conversations on building brands that create freedom and legacy.</p>
      </div>

      <div className="forged-border rounded-2xl bg-card p-4 mb-6 overflow-hidden">
        <div className="aspect-video">
          <iframe src="https://www.youtube.com/embed/videoseries?list=PLwrUeO4tzLBiAP_b_74-5WdAnccdHNvJp" className="w-full h-full" allowFullScreen title="Brand Revivalist Podcast" />
        </div>
      </div>

      <a href="https://youtube.com/@brandrevivalist?sub_confirmation=1" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 w-full py-4 forged-gradient rounded-xl text-white text-sm uppercase tracking-[0.2em] font-medium transition-all hover:ember-glow-strong mb-6">
        <Youtube className="w-5 h-5" /> Subscribe on YouTube
      </a>

      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 text-center">Also available on</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {platforms.map(platform => (
            <a key={platform.label} href={platform.url} target="_blank" rel="noopener noreferrer" className="forged-border rounded-xl bg-card p-4 flex items-center justify-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
              <ExternalLink className="w-4 h-4" strokeWidth={1.5} /> {platform.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}