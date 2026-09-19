import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ARCHETYPES, ARCHETYPE_ORDER } from '@/lib/archetypeData';

export default function ArchetypeGuide() {
  const navigate = useNavigate();
  const refs = useRef({});
  const activeArchetype = new URLSearchParams(window.location.search).get('archetype');

  useEffect(() => {
    if (activeArchetype && refs.current[activeArchetype]) {
      refs.current[activeArchetype].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeArchetype]);

  return (
    <div className="max-w-3xl animate-fade-in">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="mb-8">
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Brand Portal</span>
        <h1 className="font-heading text-3xl font-light text-foreground mt-1 mb-2">The 12 Brand <span className="molten-text italic">Archetypes</span></h1>
        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
          Each archetype represents a distinct personality your brand can embody. Your quiz results highlight the one or two that resonate most with how you show up.
        </p>
      </div>

      <div className="space-y-4 select-none" onCopy={(e) => e.preventDefault()} onContextMenu={(e) => e.preventDefault()}>
        {ARCHETYPE_ORDER.map((name) => {
          const data = ARCHETYPES[name];
          const isActive = activeArchetype === name;
          return (
            <div
              key={name}
              ref={(el) => { refs.current[name] = el; }}
              className={`rounded-2xl border p-6 transition-colors ${isActive ? 'border-primary/50 bg-primary/5' : 'border-border bg-card'}`}
            >
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <h2 className="font-heading text-2xl text-foreground">The {name}</h2>
                <span className="text-[10px] uppercase tracking-widest text-primary">{data.heart}</span>
              </div>
              <p className="text-sm italic text-muted-foreground mb-3">{data.slogan}</p>
              <p className="text-sm text-foreground/80 leading-relaxed mb-3">{data.description}</p>
              <p className="text-xs text-muted-foreground">
                Sample brands: <span className="text-foreground/70">{data.brands.join(', ')}</span>
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Want your personalized, in-depth archetype report? <Link to="/brand-persona-quiz/results" className="link-molten">View your full diagnostic</Link>.
      </p>
    </div>
  );
}