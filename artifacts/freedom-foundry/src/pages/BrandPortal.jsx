import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMembership } from '@/lib/useMembership';
import { Lock, Sparkles } from 'lucide-react';
import apiClient from '@/api/client';

const sections = [
{ name: 'Big Picture', path: '/brand-portal/big-picture', desc: 'Your vision, mission, and brand direction.', open: true },
{ name: 'Personal Brand', path: '/brand-portal/personal', desc: 'Bios, fonts, voice, and personal identity.', open: true },
{ name: 'Corporate Brand', path: '/brand-portal/corporate', desc: 'Company identity, colors, and brand system.', open: true },
{ name: 'Brand Guidelines', path: '/brand-portal/guidelines', desc: 'Standards, usage rules, and style notes.', open: false },
{ name: 'Brand Assets', path: '/brand-portal/assets', desc: 'Logos, files, and delivered design assets.', open: false },
{ name: 'Media Kit', path: '/brand-portal/media-kit', desc: 'Press-ready bios, headshots, and links.', open: true },
{ name: 'Brand Up', path: '/brand-portal/brand-up', desc: 'Empowering prompts and your reflections.', open: true },
{ name: 'Ignite OS', path: '/brand-portal/ignite', desc: 'Your activation operating system.', open: false }];


export default function BrandPortal() {
  const { isClient, loading } = useMembership();
  const [latestPersona, setLatestPersona] = useState(null);

  useEffect(() => {
    apiClient.quiz.getLatest()
      .then(res => setLatestPersona(res))
      .catch(() => setLatestPersona(null));
  }, []);

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="mb-8">
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Brand Portal</span>
        <h1 className="font-heading text-3xl lg:text-4xl font-light text-foreground mt-1 mb-2">
          Your Brand <span className="molten-text italic">Space</span>
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-md mb-6">
          Everything needed to build, communicate, and protect your brand, all in one place.
        </p>

        {latestPersona && (
          <div className="p-5 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 to-transparent flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
               <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-primary mb-1">Active Archetype</p>
              <h3 className="font-heading text-xl text-foreground mb-1">
                 The {latestPersona.primaryArchetype}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Secondary: {latestPersona.secondaryArchetype} · Completed {new Date(latestPersona.createdAt).toLocaleDateString()}
              </p>
              <Link to="/brand-persona-quiz/results" className="text-xs text-primary hover:text-foreground transition underline underline-offset-4">
                View Full Diagnostic
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {sections.map((section) => {
          const gated = !section.open && !isClient;
          return (
            <div key={section.path}>
              {gated ?
              <div className="flex items-center justify-between p-5 rounded-2xl border border-border bg-card opacity-60">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading text-base text-foreground">{section.name}</h3>
                      <Lock className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                    </div>
                    <p className="text-sm text-muted-foreground/80 leading-relaxed">{section.desc}</p>
                  </div>
                </div> :

              <Link
                to={section.path}
                className="flex items-center justify-between p-5 rounded-2xl border border-border bg-card hover:bg-accent transition-colors group">
                
                  <div>
                    <h3 className="font-heading text-lg text-foreground mb-1 group-hover:molten-text transition-colors">{section.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{section.desc}</p>
                  </div>
                  <span className="text-muted-foreground/30 group-hover:text-muted-foreground/80 transition-colors text-lg">›</span>
                </Link>
              }
            </div>);

        })}
      </div>
    </div>);

}