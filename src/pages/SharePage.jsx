import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { functions } from '@/api/client';
import PublicBrandKit from '@/components/share/PublicBrandKit';

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

  if (!data.profile) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <h1 className="font-heading text-2xl text-foreground mb-2">Profile Not Available</h1>
        <p className="text-sm text-muted-foreground">This shared profile could not be loaded.</p>
      </div>
    </div>
  );

  return <PublicBrandKit data={data} />;
}