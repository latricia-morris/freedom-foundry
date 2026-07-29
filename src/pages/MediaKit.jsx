import React, { useState, useEffect } from 'react';
import { Download, Share2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function MediaKit() {
  const [personal, setPersonal] = useState(null);
  const [corporate, setCorporate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.PersonalBrandProfile.filter({}, '-created_date', 1).catch(() => []),
      base44.entities.CorporateBrandProfile.filter({}, '-created_date', 1).catch(() => []),
    ]).then(([p, c]) => {
      setPersonal(p?.[0] || null);
      setCorporate(c?.[0] || null);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-light text-foreground mb-2">Media <span className="molten-text italic">Kit</span></h1>
        <p className="text-sm text-muted-foreground">Your brand assets, compiled for press and partnerships.</p>
      </div>

      <div className="editorial-container space-y-8">
        {personal ? (
          <>
            {(personal.first_name || personal.last_name) && (
              <h2 className="text-2xl">{personal.first_name} {personal.last_name}</h2>
            )}
            {personal.short_bio && <p className="text-sm italic opacity-70">{personal.short_bio}</p>}
            {personal.long_bio && (
              <div>
                <h3 className="text-base mb-2">Bio</h3>
                <p>{personal.long_bio}</p>
              </div>
            )}

            {personal.headshot_urls?.length > 0 && (
              <div>
                <h3 className="text-base mb-3">Headshots</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {personal.headshot_urls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block aspect-square rounded-lg overflow-hidden border border-black/10 hover:opacity-80 transition-opacity">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}

        {corporate ? (
          <>
            {corporate.company_name && <h2 className="text-2xl">{corporate.company_name}</h2>}
            {corporate.tagline && <p className="text-sm italic opacity-70">{corporate.tagline}</p>}

            {corporate.logo_urls?.length > 0 && (
              <div>
                <h3 className="text-base mb-3">Logos</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {corporate.logo_urls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block aspect-square rounded-lg overflow-hidden border border-black/10 bg-white p-2 hover:opacity-80 transition-opacity">
                      <img src={url} alt="" className="w-full h-full object-contain" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {corporate.colors?.length > 0 && (
              <div>
                <h3 className="text-base mb-3">Brand Colors</h3>
                <div className="flex flex-wrap gap-3">
                  {corporate.colors.map((color, i) => (
                    <div key={i} className="text-center">
                      <div className="w-16 h-16 rounded-lg border border-black/10" style={{ background: color.hex }} />
                      <p className="text-xs mt-1 opacity-70">{color.name || color.hex}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}

        {(personal?.email || personal?.phone || personal?.website) && (
          <div>
            <h3 className="text-base mb-3">Contact</h3>
            <div className="space-y-1">
              {personal?.email && <p className="text-sm">{personal.email}</p>}
              {personal?.phone && <p className="text-sm">{personal.phone}</p>}
              {personal?.website && <p className="text-sm">{personal.website}</p>}
            </div>
          </div>
        )}

        {!personal && !corporate && (
          <div className="text-center py-12">
            <h3 className="text-lg mb-2">No media kit content yet</h3>
            <p className="text-sm opacity-70">Fill in your brand profiles to generate your media kit.</p>
          </div>
        )}
      </div>
    </div>
  );
}