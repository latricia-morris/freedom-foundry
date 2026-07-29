import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function BigPicture() {
  const [corporate, setCorporate] = useState(null);
  const [personal, setPersonal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.CorporateBrandProfile.filter({}, '-created_date', 1).catch(() => []),
      base44.entities.PersonalBrandProfile.filter({}, '-created_date', 1).catch(() => []),
    ]).then(([c, p]) => {
      setCorporate(c?.[0] || null);
      setPersonal(p?.[0] || null);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;

  const hasContent = corporate?.mission_statement || personal?.long_bio;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-light text-foreground mb-2">Big <span className="molten-text italic">Picture</span></h1>
        <p className="text-sm text-muted-foreground">Your vision, mission, and overarching brand direction.</p>
      </div>

      {hasContent ? (
        <div className="editorial-container space-y-8">
          {corporate && (
            <>
              {corporate.company_name && (
                <div>
                  <h2 className="text-lg mb-2">{corporate.company_name}</h2>
                  {corporate.tagline && <p className="text-sm italic opacity-70">{corporate.tagline}</p>}
                </div>
              )}
              {corporate.mission_statement && (
                <div>
                  <h3 className="text-base mb-2 flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Mission</h3>
                  <p>{corporate.mission_statement}</p>
                </div>
              )}
              {corporate.brand_voice && (
                <div>
                  <h3 className="text-base mb-2">Brand Voice</h3>
                  <p>{corporate.brand_voice}</p>
                </div>
              )}
              {corporate.brand_personality && (
                <div>
                  <h3 className="text-base mb-2">Personality</h3>
                  <p>{corporate.brand_personality}</p>
                </div>
              )}
            </>
          )}
          {personal?.long_bio && (
            <div>
              <h3 className="text-base mb-2">Personal Bio</h3>
              <p>{personal.long_bio}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="editorial-container text-center py-12">
          <Target className="w-8 h-8 mx-auto mb-4 opacity-30" strokeWidth={1} />
          <h3 className="text-lg mb-2">No Big Picture content yet</h3>
          <p className="text-sm opacity-70">Fill in your Corporate or Personal Brand Profile to see your big picture here.</p>
        </div>
      )}
    </div>
  );
}