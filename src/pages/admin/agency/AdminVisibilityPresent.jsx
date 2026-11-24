import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AnchorNav from '@/components/brandHealth/AnchorNav';
import ProviderIcon from '@/components/brandHealth/ProviderIcon';
import VisibilityRadarChart from '@/components/visibility/VisibilityRadarChart';
import VisibilityScoreBreakdown from '@/components/visibility/VisibilityScoreBreakdown';
import VisibilityBusinessSnapshot from '@/components/visibility/VisibilityBusinessSnapshot';
import VisibilityAllocation from '@/components/visibility/VisibilityAllocation';
import AuditSections from '@/components/visibility/AuditSections';
import ReportFieldEditor from '@/components/visibility/ReportFieldEditor';
import { cleanLine } from '@/lib/reportText';
import {
  categoryRows,
  formatDate,
  isConsolidated,
  primaryReport,
  scoreLabel,
} from '@/lib/visibility';

/**
 * Consultation presentation: the complete Brand Health Index on one scroll —
 * composite, every source's scores, findings, recommendations, the full audit
 * evidence, and the business snapshot. Editing can be turned on mid-call so a
 * finding or recommendation is corrected in front of the client.
 */
export default function AdminVisibilityPresent() {
  const { clientId } = useParams();
  const [client, setClient] = useState(null);
  const [reports, setReports] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    base44.entities.AgencyClient.get(clientId).then(setClient).catch(() => setClient(null));
    base44.entities.VisibilityReport
      .filter({ agency_client_id: clientId }, '-report_date', 100)
      .then((rows) => setReports(rows || []))
      .catch(() => setReports([]));
  }, [clientId]);

  const primary = useMemo(() => primaryReport(reports), [reports]);
  const active = useMemo(
    () => (reports || []).find((r) => r.id === activeId) || primary,
    [reports, activeId, primary]
  );

  // The consolidation is the document being presented, so it opens first.
  useEffect(() => {
    if (activeId || !reports?.length) return;
    const consolidated = reports.find(isConsolidated);
    if (consolidated) setActiveId(consolidated.id);
  }, [reports, activeId]);

  if (!reports) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (!reports.length || !primary) {
    return (
      <div className="dashboard-card p-10 text-center">
        <p className="text-sm text-muted-foreground">No published report for this client yet.</p>
        <Link to="/admin/agency/visibility" className="link-warm mt-3 inline-block">Back to Visibility Reports</Link>
      </div>
    );
  }

  // Point 4 numbers belong to the source that scored them; the consolidated
  // index is qualitative, so the scored snapshot supplies the figures.
  const scoredReport = typeof active.composite_score === 'number' ? active : primary;
  const composite = typeof scoredReport?.composite_score === 'number' ? scoredReport.composite_score : null;
  const scored = reports.filter((r) => !isConsolidated(r));
  const rows = categoryRows(scoredReport);
  const activeLabel = isConsolidated(active) ? 'Consolidated' : active.source_model || 'Source';
  const findings = (active.key_findings || []).map(cleanLine).filter(Boolean);
  const fixes = (active.recommended_fixes || []).map(cleanLine).filter(Boolean);
  const hasSnapshot =
    (active.social_channels || []).length > 0 ||
    Object.values(active.business_snapshot || {}).some(Boolean) ||
    (active.marketing_allocation || []).length > 0;

  const navItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'scores', label: 'Scores' },
    { id: 'findings', label: 'Findings' },
    { id: 'recommendations', label: 'Recommendations' },
    { id: 'evidence', label: 'Evidence' },
    ...(hasSnapshot ? [{ id: 'snapshot', label: 'Snapshot' }] : []),
  ];

  const handleSaved = (updated) =>
    setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));

  // Switching source swaps the findings and evidence below, so bring the
  // changed content into view instead of leaving the reader at the pills.
  const selectSource = (id) => {
    setActiveId(id);
    const el = document.getElementById('findings');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl animate-fade-in overflow-x-clip pb-16">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            Brand Health Index · {activeLabel} · {formatDate(active.report_date || primary.report_date)}
          </p>
          <h1 className="break-words font-heading text-3xl font-light text-foreground sm:text-4xl">
            {client?.company_name || 'Client'}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
              editing ? 'btn-forge border-transparent' : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {editing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            {editing ? 'Done editing' : 'Edit live'}
          </button>
          <Link
            to={`/admin/agency/visibility/${clientId}`}
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Exit presentation
          </Link>
        </div>
      </div>

      {editing && (
        <div className="mt-6">
          <ReportFieldEditor report={active} onSaved={handleSaved} collapsible={false} />
        </div>
      )}

      <div className="mt-6">
        <AnchorNav items={navItems} />
      </div>

      <section id="overview" className="mt-6 grid gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="dashboard-card flex min-w-0 flex-col items-center justify-center p-8 text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            {isConsolidated(active) ? 'Point 4 Score' : 'Composite Score'}
          </p>
          <p className="molten-text max-w-full font-heading text-6xl font-light leading-none sm:text-[8rem]">
            {composite === null ? '—' : composite}
          </p>
          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-muted-foreground">
            {composite === null ? 'Not scored' : `${scoreLabel(composite)} · Out of 100`}
          </p>
          <span className="mt-4 inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground/70">
            {isConsolidated(active) ? (
              <>Point 4 score · scored by {scoredReport?.source_model || 'the source record'}</>
            ) : (
              <>
                <ProviderIcon label={active.source_model || ''} size="sm" />
                {active.source_model || 'Unlabeled source'}
              </>
            )}
          </span>
        </div>
        <div className="dashboard-card min-w-0 p-6">
          <h3 className="mb-2 font-heading text-xl text-foreground">Category Scores</h3>
          {isConsolidated(active) && (
            <p className="mb-2 text-xs text-muted-foreground">
              Point 4 dimensions, as scored by {scoredReport?.source_model || 'the scored source'}.
            </p>
          )}
          <VisibilityRadarChart series={[{ name: scoredReport?.source_model || 'This audit', report: scoredReport }]} height={340} />
          <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {rows.map((r) => (
              <div key={r.key} className="flex items-baseline justify-between gap-3 text-xs">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="text-foreground">{r.score === null ? 'Not scored' : `${r.score}/${r.max}`}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="scores" className="dashboard-card mt-6 min-w-0 p-6">
        <h3 className="font-heading text-xl text-foreground">Scores by Source</h3>
        <p className="mb-4 mt-1 text-xs text-muted-foreground">
          Each source scored the categories it could measure. Nothing is averaged across reports.
        </p>
        <VisibilityScoreBreakdown reports={scored} />
      </section>

      <section className="mt-6">
        <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-muted-foreground/70">Report source</p>
        <div role="tablist" aria-label="Report sources" className="flex flex-wrap gap-2">
          {reports.map((r) => {
            const isActive = active?.id === r.id;
            return (
              <button
                key={r.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => selectSource(r.id)}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-xs transition-colors ${
                  isActive
                    ? 'border-primary/60 bg-primary/10 text-foreground'
                    : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
              >
                <ProviderIcon label={r.source_model || ''} size="sm" />
                {isConsolidated(r) ? 'Consolidated' : r.source_model || 'Unlabeled source'}
              </button>
            );
          })}
        </div>
      </section>

      <section id="findings" className="dashboard-card mt-6 min-w-0 p-6">
        <h3 className="font-heading text-xl text-foreground">
          Key Findings · {isConsolidated(active) ? 'Consolidated' : active.source_model || 'Source'}
        </h3>
        {findings.length ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {findings.map((f, i) => (
              <div key={i} className="min-w-0 rounded-sm border border-border/60 bg-background/40 p-5">
                <p className="text-[10px] uppercase tracking-widest text-primary">Finding {i + 1}</p>
                <p className="mt-2 break-words text-sm leading-relaxed text-foreground/90">{f}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">No findings recorded on this snapshot.</p>
        )}
      </section>

      <section id="recommendations" className="dashboard-card mt-6 min-w-0 p-6">
        <h3 className="font-heading text-xl text-foreground">Priority Recommendations</h3>
        {fixes.length ? (
          <ol className="mt-4 grid gap-4 sm:grid-cols-2">
            {fixes.map((f, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-foreground/90">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-sm border border-primary/40 text-[10px] font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="break-words">{f}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">No recommendations recorded on this snapshot.</p>
        )}
      </section>

      <section id="evidence" className="mt-6 min-w-0">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-heading text-2xl font-light text-foreground">
            Evidence · <span className="molten-text italic">{isConsolidated(active) ? 'Consolidated' : active.source_model || 'Source'}</span>
          </h3>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
            {formatDate(active.report_date)} · full audit, every section open
          </span>
        </div>
        <AuditSections report={active} includeAll />
      </section>

      {hasSnapshot && (
        <section id="snapshot" className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="dashboard-card min-w-0 p-6">
            <h3 className="mb-4 font-heading text-xl text-foreground">Business Snapshot</h3>
            <VisibilityBusinessSnapshot report={active} />
          </div>
          <div className="dashboard-card min-w-0 p-6">
            <h3 className="mb-4 font-heading text-xl text-foreground">Suggested Marketing Emphasis</h3>
            <VisibilityAllocation allocation={active.marketing_allocation} />
          </div>
        </section>
      )}
    </div>
  );
}