import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ProviderIcon from '@/components/brandHealth/ProviderIcon';
import AuditSections from '@/components/visibility/AuditSections';
import { formatDate, latestPerSource, scoreLabel } from '@/lib/visibility';
import { cleanLine } from '@/lib/reportText';
import { usePortalBrand } from '@/hooks/usePortalBrand';

/**
 * The findings and recommendations document, kept apart from the scorecard.
 * One source at a time: that source's own key findings, its priority
 * recommendations, and its full narrative breakdown, so sources never blend.
 */
export default function VisibilityFindings() {
  const { clientId } = useParams();
  const { brand, preview } = usePortalBrand();
  const brandId = clientId || brand?.id || null;
  const [data, setData] = useState(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    base44.functions
      .invoke('get-visibility-reports', { client_id: brandId })
      .then((res) => setData(res.data || {}))
      .catch(() => setData({ error: true }));
  }, [brandId]);

  const backTo = clientId ? `/admin/agency/visibility/${clientId}` : '/brand-portal/brand-health';
  const backLabel = clientId ? 'Back to client report' : 'Back to Brand Health Index';

  if (!data) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  const sources = latestPerSource(data.reports || []).filter(({ report }) => !!report);

  if (data.error || !sources.length) {
    return (
      <div className="dash-editorial-block">
        <h1 className="font-heading text-4xl font-light sm:text-5xl">
          Findings &amp; <span className="molten-text italic">Recommendations</span>
        </h1>
        <p className="mt-3 text-sm">
          {data.error
            ? 'The document could not be loaded. Please try again in a moment.'
            : 'Findings appear here once your first report is published.'}
        </p>
        <Link to={backTo} className="link-warm mt-4 inline-block">{backLabel}</Link>
      </div>
    );
  }

  const selected = sources[Math.min(active, sources.length - 1)];
  const report = selected.report;
  const isAdmin = !!data.is_admin && !preview;
  const composite = typeof report.composite_score === 'number' ? report.composite_score : null;
  const findings = (report.key_findings || []).map(cleanLine).filter(Boolean);
  const recommendations = (report.recommended_fixes || []).map(cleanLine).filter(Boolean);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <Link
          to={backTo}
          className="mb-3 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> {backLabel}
        </Link>
        <h1 className="font-heading text-4xl font-light text-foreground sm:text-5xl">
          Findings &amp; <span className="molten-text italic">Recommendations</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {data.client?.company_name ? `${data.client.company_name} · ` : ''}
          One source at a time, so each report's analysis stays whole.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {sources.map(({ source, report: r }, i) => {
          const isActive = i === active;
          return (
            <button
              key={r.id || source}
              type="button"
              onClick={() => setActive(i)}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                isActive
                  ? 'border-primary/60 bg-primary/10 text-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
            >
              <ProviderIcon label={r.source_model || ''} size="sm" />
              {source}
            </button>
          );
        })}
      </div>

      <div className="bh-card p-5 sm:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-heading text-2xl font-light text-foreground sm:text-3xl">{selected.source}</h2>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
            {formatDate(report.report_date)}
            {composite !== null ? ` · ${composite}/100 · ${scoreLabel(composite)}` : ''}
          </p>
        </div>

        {findings.length > 0 && (
          <div className="mt-6">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
              Key findings
            </h3>
            <ul className="mt-3 space-y-2.5">
              {findings.map((f, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground/90">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                  <span className="break-words">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 border-t border-border/50 pt-5">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            Priority recommendations
          </h3>
          {recommendations.length > 0 ? (
            <ol className="mt-3 space-y-3">
              {recommendations.map((f, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-sm border border-primary/40 text-[10px] font-semibold text-primary">
                    {i + 1}
                  </span>
                  <span className="break-words">{f}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              {isAdmin
                ? 'No recommendations recorded on this snapshot yet.'
                : 'The full action plan is released with your engagement.'}
            </p>
          )}
        </div>
      </div>

      <div className="bh-card p-5 sm:p-7">
        <h2 className="font-heading text-2xl font-light text-foreground sm:text-3xl">Full breakdown</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Every diagnostic from the {selected.source} audit, in its own words.
        </p>
        <div className="mt-6">
          <AuditSections report={report} includeAll={isAdmin} />
        </div>
      </div>
    </div>
  );
}