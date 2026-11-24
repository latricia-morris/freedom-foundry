import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ProviderIcon from '@/components/brandHealth/ProviderIcon';
import AuditSections from '@/components/visibility/AuditSections';
import ConsolidatedAssessment from '@/components/visibility/ConsolidatedAssessment';
import GradientActions from '@/components/brandHealth/GradientActions';
import { consolidatedReport, formatDate, latestPerSource, scoreLabel } from '@/lib/visibility';
import { cleanLine } from '@/lib/reportText';
import { usePortalBrand } from '@/hooks/usePortalBrand';

const CARD = 'bh-card p-5 sm:p-7';

/**
 * The findings and recommendations document. The consolidated assessment is
 * the featured document: its findings, its priority recommendations, and its
 * full breakdown sit on this page. The individual source reports stay one
 * click away behind "Explore full reports", switched by their own buttons.
 */
export default function VisibilityFindings() {
  const { clientId } = useParams();
  const { brand, preview } = usePortalBrand();
  const brandId = clientId || brand?.id || null;
  const [data, setData] = useState(null);
  // A source chosen on the scorecard arrives as ?source=, so that model opens
  // directly instead of the reader hunting for it.
  const [selectedSource, setSelectedSource] = useState(
    () => new URLSearchParams(window.location.search).get('source') || ''
  );
  const [exploring, setExploring] = useState(
    () => !!new URLSearchParams(window.location.search).get('source')
  );

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

  const reports = data.reports || [];
  const consolidated = consolidatedReport(reports);
  const sources = latestPerSource(reports).filter(({ report }) => !!report);

  if (data.error || (!sources.length && !consolidated)) {
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

  const isAdmin = !!data.is_admin && !preview;
  const active = Math.max(0, sources.findIndex((s) => s.source === selectedSource));
  const selected = sources[active] || null;
  const selectedReport = selected?.report || null;

  const consolidatedFindings = (consolidated?.key_findings || []).map(cleanLine).filter(Boolean);
  const priority = (consolidated?.recommended_fixes || []).map(cleanLine).filter(Boolean);

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
          The consolidated assessment, with every source report a click away.
        </p>
      </div>

      {consolidated ? (
        <>
          <section className={CARD}>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-heading text-2xl font-light text-foreground sm:text-3xl">
                Consolidated <span className="molten-text italic">Assessment</span>
              </h2>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                {formatDate(consolidated.report_date)}
              </p>
            </div>
            {consolidatedFindings.length > 0 && (
              <>
                <h3 className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
                  Key findings
                </h3>
                <ul className="mt-3 space-y-2.5">
                  {consolidatedFindings.map((f, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground/90">
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                      <span className="break-words">{f}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          {priority.length > 0 && (
            <GradientActions
              id="priority"
              title="Priority Recommendations"
              subtitle="Every gap the consolidated assessment found, turned into the next move."
              items={priority}
            />
          )}

          <section className={CARD}>
            <h2 className="font-heading text-2xl font-light text-foreground sm:text-3xl">Full consolidated report</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Every index point, in the consolidation's own words.
            </p>
            <div className="mt-6">
              <ConsolidatedAssessment report={consolidated} />
            </div>
          </section>
        </>
      ) : (
        <section className={CARD}>
          <h2 className="font-heading text-2xl font-light text-foreground sm:text-3xl">
            Consolidated <span className="molten-text italic">Assessment</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The consolidated assessment is being prepared. Every source report is available under Full reports.
          </p>
        </section>
      )}

      {sources.length > 0 && (
        <section className={CARD}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl font-light text-foreground sm:text-3xl">Full reports</h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Each source's own findings and breakdown, one at a time, so nothing is blended.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setExploring((v) => !v)}
              aria-expanded={exploring}
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {exploring ? 'Hide full reports' : 'Explore full reports'}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${exploring ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {exploring && selectedReport && (
            <div className="mt-6 space-y-5">
              <div className="flex flex-wrap gap-2">
                {sources.map(({ source, report: r }, i) => {
                  const isActive = i === active;
                  return (
                    <button
                      key={r.id || source}
                      type="button"
                      onClick={() => setSelectedSource(source)}
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

              <div className="rounded-lg border border-border/60 bg-background/40 p-4 sm:p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="font-heading text-xl font-light text-foreground sm:text-2xl">{selected.source}</h3>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                    {formatDate(selectedReport.report_date)}
                    {typeof selectedReport.composite_score === 'number'
                      ? ` · ${selectedReport.composite_score}/100 · ${scoreLabel(selectedReport.composite_score)}`
                      : ''}
                  </p>
                </div>

                <SourceFindings report={selectedReport} isAdmin={isAdmin} />
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

/** One source's own key findings, recommendations, and full breakdown. */
function SourceFindings({ report, isAdmin }) {
  const findings = (report.key_findings || []).map(cleanLine).filter(Boolean);
  const recommendations = (report.recommended_fixes || []).map(cleanLine).filter(Boolean);

  return (
    <>
      {findings.length > 0 && (
        <div className="mt-5">
          <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
            Key findings
          </h4>
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

      <div className="mt-5 border-t border-border/50 pt-5">
        <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          Priority recommendations
        </h4>
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

      <div className="mt-5 border-t border-border/50 pt-5">
        <h4 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
          Full breakdown
        </h4>
        <AuditSections report={report} includeAll={isAdmin} />
      </div>
    </>
  );
}