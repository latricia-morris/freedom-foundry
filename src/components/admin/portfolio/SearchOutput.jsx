import React from 'react';
import { keywordApplications } from '@/lib/portfolioData';

/** Search-output view: exactly where each target keyword lands in public
 *  indexable output, and what stays internal-only. */
export default function SearchOutput({ form }) {
  const applications = keywordApplications(form);

  if (applications.length === 0) {
    return (
      <div className="dashboard-card space-y-2 p-6">
        <h3 className="font-heading text-2xl text-foreground">Search output</h3>
        <p className="text-xs text-muted-foreground/70">
          Mark target keywords in the library above and this view shows exactly where each one
          reaches the public, indexable page.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-card space-y-4 p-6">
      <div>
        <h3 className="font-heading text-2xl text-foreground">Search output</h3>
        <p className="text-xs text-muted-foreground/70">
          Where each target keyword is applied right now. Anything unlisted stays internal-only.
        </p>
      </div>
      <ul className="divide-y divide-border/50">
        {applications.map(({ keyword, applied }) => (
          <li key={keyword} className="py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-foreground">{keyword}</span>
              {applied.length > 0 ? (
                applied.map((surface) => (
                  <span key={surface} className="rounded-sm border border-primary/40 px-2 py-0.5 text-[10px] uppercase tracking-widest text-primary">
                    {surface}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-muted-foreground/70">Not in any public output yet</span>
              )}
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground/70">
              Alt-text suggestion: “{keyword} — {form.client_name || form.title || 'the brand'}”
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}