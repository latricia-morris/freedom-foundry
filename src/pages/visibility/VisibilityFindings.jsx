import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ProviderIcon from '@/components/brandHealth/ProviderIcon';
import SourceReportPanel from '@/components/visibility/SourceReportPanel';
import { latestPerSource } from '@/lib/visibility';
import { usePortalBrand } from '@/hooks/usePortalBrand';

/**
 * The findings document: one tab per source report, clicked between them.
 * The consolidated assessment lives on the Visibility & Credibility page and
 * is not repeated here.
 */
export default function VisibilityFindings() {
  const { clientId } = useParams();
  const { brand, preview } = usePortalBrand();
  const brandId = clientId || brand?.id || null;
  const [data, setData] = useState(null);
  // A source chosen on the scorecard arrives as ?source= and opens directly.
  const [selectedSource, setSelectedSource] = useState(
    () => new URLSearchParams(window.location.search).get('source') || ''
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

  const isAdmin = !!data.is_admin && !preview;
  const activeIndex = Math.max(0, sources.findIndex((s) => s.source === selectedSource));
  const active = sources[activeIndex];

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
          Each source report on its own tab, so nothing is blended.
        </p>
      </div>

      <div role="tablist" aria-label="Report sources" className="flex flex-wrap gap-2">
        {sources.map(({ source, report }, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={report.id || source}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setSelectedSource(source)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs transition-colors ${
                isActive
                  ? 'border-primary/60 bg-primary/10 text-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
            >
              <ProviderIcon label={report.source_model || ''} size="sm" />
              {source}
            </button>
          );
        })}
      </div>

      <section className="bh-card p-5 sm:p-7">
        <SourceReportPanel source={active.source} report={active.report} isAdmin={isAdmin} />
      </section>
    </div>
  );
}