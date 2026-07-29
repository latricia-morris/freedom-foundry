import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function SharePage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    base44.entities.ShareLink.filter({ token, is_active: true })
      .then(async links => {
        const link = links?.[0];
        if (!link) { setError(true); return; }
        let profile = null;
        if (link.profile_type === 'personal') {
          const p = await base44.entities.PersonalBrandProfile.filter({ id: link.profile_id });
          profile = p?.[0];
        } else if (link.profile_type === 'corporate' || link.profile_type === 'media_kit') {
          const c = await base44.entities.CorporateBrandProfile.filter({ id: link.profile_id });
          profile = c?.[0];
        }
        setData({ link, profile });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;
  if (error || !data) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <h1 className="font-heading text-2xl text-foreground mb-2">Link Not Found</h1>
        <p className="text-sm text-muted-foreground">This share link is invalid or has been deactivated.</p>
      </div>
    </div>
  );

  const { link, profile } = data;

  return (
    <div className="max-w-3xl mx-auto py-8 animate-fade-in">
      <div className="editorial-container space-y-8">
        {link.profile_type === 'personal' && profile && (
          <>
            <h1 className="text-3xl">{profile.first_name} {profile.last_name}</h1>
            {profile.short_bio && <p className="italic opacity-70">{profile.short_bio}</p>}
            {profile.long_bio && <p>{profile.long_bio}</p>}
            {profile.headshot_urls?.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {profile.headshot_urls.map((url, i) => (
                  <img key={i} src={url} alt="" className="w-full aspect-square object-cover rounded-lg border border-black/10" />
                ))}
              </div>
            )}
            {profile.social_links?.length > 0 && (
              <div className="flex gap-3">
                {profile.social_links.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">{s.platform}</a>
                ))}
              </div>
            )}
          </>
        )}
        {link.profile_type === 'corporate' && profile && (
          <>
            <h1 className="text-3xl">{profile.company_name}</h1>
            {profile.tagline && <p className="italic opacity-70">{profile.tagline}</p>}
            {profile.mission_statement && <p>{profile.mission_statement}</p>}
            {profile.logo_urls?.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {profile.logo_urls.map((url, i) => (
                  <div key={i} className="bg-white rounded-lg border border-black/10 p-3"><img src={url} alt="" className="w-full h-20 object-contain" /></div>
                ))}
              </div>
            )}
            {profile.colors?.length > 0 && (
              <div className="flex gap-3">
                {profile.colors.map((color, i) => (
                  <div key={i} className="text-center">
                    <div className="w-14 h-14 rounded-lg border border-black/10" style={{ background: color.hex }} />
                    <p className="text-xs mt-1 opacity-70">{color.name}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {link.profile_type === 'media_kit' && profile && (
          <>
            <h1 className="text-3xl">Media Kit — {profile.company_name || `${profile.first_name} ${profile.last_name}`}</h1>
            {profile.tagline && <p className="italic opacity-70">{profile.tagline}</p>}
            {profile.long_bio && <p>{profile.long_bio}</p>}
            {profile.headshot_urls?.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {profile.headshot_urls.map((url, i) => (
                  <img key={i} src={url} alt="" className="w-full aspect-square object-cover rounded-lg border border-black/10" />
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <p className="text-center text-xs text-muted-foreground mt-6">Shared via Freedom Foundry</p>
    </div>
  );
}