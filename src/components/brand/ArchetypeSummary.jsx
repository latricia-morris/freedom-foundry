import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import apiClient from '@/api/client';

export default function ArchetypeSummary({ view }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.quiz.getLatestForView(view)
      .then(setResult)
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
  }, [view]);

  if (loading) return null;

  if (!result) {
    return (
      <div className="rounded-xl border border-border bg-card/60 p-5 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-muted-foreground">
          It looks like you haven't taken the Brand Persona quiz yet for this brand.
        </p>
        <Link to="/brand-persona-quiz" className="btn-forge shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs uppercase tracking-widest">
          Take the Quiz <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card/60 p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Brand Archetype</p>
        <h3 className="font-heading text-xl text-foreground mb-1">
          Primary: <span className="molten-text italic">{result.primaryArchetype}</span>
          {result.secondaryArchetype && <span className="text-muted-foreground text-base"> &nbsp;·&nbsp; Secondary: {result.secondaryArchetype}</span>}
        </h3>
        <div className="flex items-center gap-4 mt-2">
          <Link to={`/brand-portal/archetype-guide?archetype=${encodeURIComponent(result.primaryArchetype)}`} className="text-xs link-molten hover:opacity-80 transition-opacity">
            What does this mean?
          </Link>
          <Link to="/brand-persona-quiz/results" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            View full diagnostic
          </Link>
        </div>
      </div>
    </div>
  );
}