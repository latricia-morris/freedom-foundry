import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import apiClient, { functions } from '@/api/client';

function Section({ title, children }) {
  if (!children) return null;
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-[#1a1420]/40 mb-2 font-semibold">{title}</p>
      {children}
    </div>
  );
}

export default function SharePage() {
  const { token: urlToken } = useParams();
  const [searchParams] = useSearchParams();
  const queryToken = searchParams.get('k');
  const token = urlToken || queryToken;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Prevent search engine indexing
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  useEffect(() => {
    if (!token) { setError(true); setLoading(false); return; }
    functions.getSharedProfile(token)
      .then(d => {
        if (d?.error) { setError(true); return; }
        setData(d);
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

  const { profile_type, profile } = data;
  if (!profile) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <h1 className="font-heading text-2xl text-foreground mb-2">Profile Not Available</h1>
        <p className="text-sm text-muted-foreground">This shared profile could not be loaded.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto py-8 animate-fade-in">
      <div className="editorial-container space-y-8">

        {/* PERSONAL BRAND */}
        {profile_type === 'personal' && (
          <>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] link-molten mb-2">Personal Brand</p>
              <h1 className="font-heading text-3xl text-[#1a1420]">{profile.first_name} {profile.last_name}</h1>
              {profile.business_name && <p className="text-sm text-[#1a1420]/60 mt-1">{profile.business_name}</p>}
            </div>
            {profile.short_bio && <p className="italic text-[#1a1420]/70 leading-relaxed">{profile.short_bio}</p>}
            {profile.long_bio && <p className="text-sm leading-relaxed text-[#2c2c33]">{profile.long_bio}</p>}

            {profile.headshot_urls?.length > 0 && (
              <Section title="Headshots">
                <div className="grid grid-cols-3 gap-3">
                  {profile.headshot_urls.map((url, i) => (
                    <img key={i} src={url} alt="" className="w-full aspect-square object-cover rounded-lg border border-black/10" />
                  ))}
                </div>
              </Section>
            )}

            {profile.logo_urls?.length > 0 && (
              <Section title="Logos">
                <div className="grid grid-cols-3 gap-3">
                  {profile.logo_urls.map((url, i) => (
                    <div key={i} className="bg-white rounded-lg border border-black/10 p-3"><img src={url} alt="" className="w-full h-20 object-contain" /></div>
                  ))}
                </div>
              </Section>
            )}

            {(profile.email || profile.phone || profile.website || profile.location_city) && (
              <Section title="Contact">
                <div className="space-y-1 text-sm text-[#2c2c33]">
                  {profile.email && <p>📧 {profile.email}</p>}
                  {profile.phone && <p>📞 {profile.phone}</p>}
                  {profile.website && <p>🌐 <a href={profile.website} target="_blank" rel="noopener noreferrer" className="link-molten hover:underline">{profile.website}</a></p>}
                  {(profile.location_city || profile.location_state || profile.location_country) && (
                    <p>📍 {[profile.location_city, profile.location_state, profile.location_country].filter(Boolean).join(', ')}</p>
                  )}
                </div>
              </Section>
            )}

            {profile.social_links?.length > 0 && (
              <Section title="Social">
                <div className="flex flex-wrap gap-3">
                  {profile.social_links.map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm link-molten hover:underline">{s.platform}</a>
                  ))}
                </div>
              </Section>
            )}

            {profile.feature_links?.length > 0 && (
              <Section title="Links">
                <div className="flex flex-wrap gap-3">
                  {profile.feature_links.map((f, i) => (
                    <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="text-sm link-molten hover:underline">{f.label}</a>
                  ))}
                </div>
              </Section>
            )}

            {profile.has_books && profile.book_links?.length > 0 && (
              <Section title="Books">
                <div className="space-y-1">
                  {profile.book_links.map((b, i) => (
                    <a key={i} href={b.url} target="_blank" rel="noopener noreferrer" className="block text-sm link-molten hover:underline">{b.title}</a>
                  ))}
                </div>
              </Section>
            )}
          </>
        )}

        {/* CORPORATE BRAND */}
        {profile_type === 'corporate' && (
          <>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] link-molten mb-2">Corporate Brand</p>
              <h1 className="font-heading text-3xl text-[#1a1420]">{profile.company_name}</h1>
              {profile.tagline && <p className="italic text-[#1a1420]/70 mt-1">{profile.tagline}</p>}
            </div>
            {profile.mission_statement && <p className="text-sm leading-relaxed text-[#2c2c33]">{profile.mission_statement}</p>}
            {profile.target_audience && <p className="text-sm leading-relaxed text-[#2c2c33]"><span className="font-semibold">Target Audience:</span> {profile.target_audience}</p>}

            {profile.logo_urls?.length > 0 && (
              <Section title="Logos">
                <div className="grid grid-cols-3 gap-3">
                  {profile.logo_urls.map((url, i) => (
                    <div key={i} className="bg-white rounded-lg border border-black/10 p-3"><img src={url} alt="" className="w-full h-20 object-contain" /></div>
                  ))}
                </div>
              </Section>
            )}

            {profile.colors?.length > 0 && (
              <Section title="Brand Colors">
                <div className="flex flex-wrap gap-3">
                  {profile.colors.map((color, i) => (
                    <div key={i} className="text-center">
                      <div className="w-14 h-14 rounded-lg border border-black/10" style={{ background: color.hex }} />
                      <p className="text-xs mt-1 text-[#1a1420]/60">{color.name}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {(profile.email || profile.phone || profile.website || profile.location_city) && (
              <Section title="Contact">
                <div className="space-y-1 text-sm text-[#2c2c33]">
                  {profile.email && <p>📧 {profile.email}</p>}
                  {profile.phone && <p>📞 {profile.phone}</p>}
                  {profile.website && <p>🌐 <a href={profile.website} target="_blank" rel="noopener noreferrer" className="link-molten hover:underline">{profile.website}</a></p>}
                  {(profile.location_city || profile.location_state || profile.location_country) && (
                    <p>📍 {[profile.location_city, profile.location_state, profile.location_country].filter(Boolean).join(', ')}</p>
                  )}
                </div>
              </Section>
            )}

            {profile.has_books && profile.book_links?.length > 0 && (
              <Section title="Books">
                <div className="space-y-1">
                  {profile.book_links.map((b, i) => (
                    <a key={i} href={b.url} target="_blank" rel="noopener noreferrer" className="block text-sm link-molten hover:underline">{b.title}</a>
                  ))}
                </div>
              </Section>
            )}
          </>
        )}

        {/* MEDIA KIT */}
        {profile_type === 'media_kit' && (
          <>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] link-molten mb-2">Media Kit</p>
              <h1 className="font-heading text-3xl text-[#1a1420]">{profile.business_name || `${profile.first_name} ${profile.last_name}`}</h1>
            </div>
            {profile.short_bio && <p className="italic text-[#1a1420]/70 leading-relaxed">{profile.short_bio}</p>}
            {profile.long_bio && <p className="text-sm leading-relaxed text-[#2c2c33]">{profile.long_bio}</p>}

            {profile.headshot_urls?.length > 0 && (
              <Section title="Headshots">
                <div className="grid grid-cols-3 gap-3">
                  {profile.headshot_urls.map((url, i) => (
                    <img key={i} src={url} alt="" className="w-full aspect-square object-cover rounded-lg border border-black/10" />
                  ))}
                </div>
              </Section>
            )}

            {profile.logo_urls?.length > 0 && (
              <Section title="Logos">
                <div className="grid grid-cols-3 gap-3">
                  {profile.logo_urls.map((url, i) => (
                    <div key={i} className="bg-white rounded-lg border border-black/10 p-3"><img src={url} alt="" className="w-full h-20 object-contain" /></div>
                  ))}
                </div>
              </Section>
            )}

            {(profile.email || profile.phone || profile.website || profile.location_city) && (
              <Section title="Contact">
                <div className="space-y-1 text-sm text-[#2c2c33]">
                  {profile.email && <p>📧 {profile.email}</p>}
                  {profile.phone && <p>📞 {profile.phone}</p>}
                  {profile.website && <p>🌐 <a href={profile.website} target="_blank" rel="noopener noreferrer" className="link-molten hover:underline">{profile.website}</a></p>}
                  {(profile.location_city || profile.location_state || profile.location_country) && (
                    <p>📍 {[profile.location_city, profile.location_state, profile.location_country].filter(Boolean).join(', ')}</p>
                  )}
                </div>
              </Section>
            )}

            {profile.social_links?.length > 0 && (
              <Section title="Social">
                <div className="flex flex-wrap gap-3">
                  {profile.social_links.map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm link-molten hover:underline">{s.platform}</a>
                  ))}
                </div>
              </Section>
            )}

            {profile.feature_links?.length > 0 && (
              <Section title="Links">
                <div className="flex flex-wrap gap-3">
                  {profile.feature_links.map((f, i) => (
                    <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="text-sm link-molten hover:underline">{f.label}</a>
                  ))}
                </div>
              </Section>
            )}

            {profile.has_books && profile.book_links?.length > 0 && (
              <Section title="Books">
                <div className="space-y-1">
                  {profile.book_links.map((b, i) => (
                    <a key={i} href={b.url} target="_blank" rel="noopener noreferrer" className="block text-sm link-molten hover:underline">{b.title}</a>
                  ))}
                </div>
              </Section>
            )}

            {profile.podcast_links?.length > 0 && (
              <Section title="Podcast Channels">
                <div className="space-y-1">
                  {profile.podcast_links.map((p, i) => (
                    <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="block text-sm link-molten hover:underline">{p.platform}</a>
                  ))}
                </div>
              </Section>
            )}
          </>
        )}
      </div>
      <p className="text-center text-xs text-muted-foreground mt-6">Shared via Freedom Foundry</p>
    </div>
  );
}