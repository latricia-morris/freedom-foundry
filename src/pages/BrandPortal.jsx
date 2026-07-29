import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Building2, ArrowRight, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function BrandPortal() {
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
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-heading text-3xl lg:text-4xl font-light text-foreground mb-2">Brand <span className="molten-text italic">Portal</span></h1>
        <p className="text-sm text-muted-foreground">Your brand profiles, assets, and identity — all in one place.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/brand-portal/personal" className="group border border-border rounded-xl bg-card p-6 transition-all duration-300 hover:ember-glow-strong">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <span className="text-[10px] uppercase tracking-widest text-primary">Personal</span>
              <h3 className="font-heading text-lg text-foreground mt-1 mb-1">{personal ? `${personal.first_name || ''} ${personal.last_name || ''}`.trim() || 'Personal Brand' : 'Create Personal Brand'}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{personal?.short_bio || 'Set up your personal brand profile, headshots, bio, and contact details.'}</p>
              <span className="text-xs uppercase tracking-widest text-primary group-hover:text-copper transition-colors flex items-center gap-1 mt-3">
                {personal ? 'Edit Profile' : 'Get Started'} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </Link>

        <Link to="/brand-portal/corporate" className="group border border-border rounded-xl bg-card p-6 transition-all duration-300 hover:ember-glow-strong">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-primary" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <span className="text-[10px] uppercase tracking-widest text-primary">Corporate</span>
              <h3 className="font-heading text-lg text-foreground mt-1 mb-1">{corporate?.company_name || 'Create Corporate Brand'}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{corporate?.tagline || 'Define your company brand — colors, typography, logos, mood boards, and voice.'}</p>
              <span className="text-xs uppercase tracking-widest text-primary group-hover:text-copper transition-colors flex items-center gap-1 mt-3">
                {corporate ? 'Edit Profile' : 'Get Started'} <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/media-kit" className="flex items-center gap-3 px-5 py-4 border border-border rounded-xl bg-card hover:ember-glow transition-all">
          <Plus className="w-4 h-4 text-primary" strokeWidth={1.5} />
          <span className="text-sm text-foreground">View Media Kit</span>
        </Link>
        <Link to="/big-picture" className="flex items-center gap-3 px-5 py-4 border border-border rounded-xl bg-card hover:ember-glow transition-all">
          <Plus className="w-4 h-4 text-primary" strokeWidth={1.5} />
          <span className="text-sm text-foreground">Big Picture</span>
        </Link>
      </div>
    </div>
  );
}