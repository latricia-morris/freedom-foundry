import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { fmtDate } from '@/lib/proposalFormat';
import { ArrowUpRight, ClipboardSignature } from 'lucide-react';

const PILL_STYLES = {
  'Signed & accepted': 'btn-forge text-[11px] font-semibold uppercase tracking-wider',
  'For review': 'border border-primary/50 text-primary',
  'Completed': 'border border-border text-foreground/70',
  'Expired': 'border border-border text-muted-foreground',
  'Declined': 'border border-border text-muted-foreground',
};

export default function PortalProposals() {
  const [proposals, setProposals] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    base44.functions.invoke('get-client-proposals')
      .then((res) => { if (mounted) setProposals(res.data?.proposals || []); })
      .catch(() => { if (mounted) setError("We couldn't load your proposals right now. Please try again shortly."); });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="max-w-4xl animate-fade-in">
      <div className="mb-8">
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Brand Portal</span>
        <h1 className="font-heading text-3xl lg:text-4xl font-light text-foreground mt-1 mb-2">
          Proposals
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-md mb-6">
          Every proposal we've prepared for you, in one place.
        </p>
        <Link
          to="/brand-portal/project-requests"
          className="btn-forge inline-flex min-h-11 items-center gap-2 rounded-sm px-5 py-3 text-sm font-semibold"
        >
          <ClipboardSignature className="h-4 w-4" strokeWidth={1.5} />
          Request a project
        </Link>
      </div>

      {proposals === null && !error ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      ) : proposals.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">No proposals yet. When we send one, it will appear here.</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden bg-card border border-border">
          {proposals.map((p, i) => (
            <div key={p.id} className={`flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 ${i > 0 ? 'border-t border-border' : ''}`}>
              <div className="flex-1 min-w-0">
                <p className="font-heading text-lg text-foreground truncate">{p.title}</p>
                <p className="text-xs mt-0.5 text-muted-foreground">
                  {fmtDate(p.date)}{p.proposal_number ? ` · ${p.proposal_number}` : ''}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[11px] ${PILL_STYLES[p.status_label] || PILL_STYLES['Expired']}`}>
                {p.status_label}
              </span>
              {p.share_token && (
                <a
                  href={`/p/${p.share_token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#8a482d] hover:opacity-80 transition-opacity"
                >
                  View <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}