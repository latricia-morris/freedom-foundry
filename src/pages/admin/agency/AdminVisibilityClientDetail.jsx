import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Presentation } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import VisibilityRadarChart from '@/components/visibility/VisibilityRadarChart';
import VisibilityTrendChart from '@/components/visibility/VisibilityTrendChart';
import VisibilityBusinessSnapshot from '@/components/visibility/VisibilityBusinessSnapshot';
import VisibilityAllocation from '@/components/visibility/VisibilityAllocation';
import { useToast } from '@/components/ui/use-toast';
import { categoryRows, divergenceFlags, formatDate, latestPerSource, scoreLabel, sourceModelLabels } from '@/lib/visibility';

export default function AdminVisibilityClientDetail() {
  const { clientId } = useParams();
  const [client, setClient] = useState(null);
  const [reports, setReports] = useState(null);
  const [toggling, setToggling] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    base44.entities.AgencyClient.get(clientId).then(setClient).catch(() => setClient(null));
    base44.entities.VisibilityReport
      .filter({ agency_client_id: clientId }, '-report_date', 100)
      .then(setReports)
      .catch(() => setReports([]));
  }, [clientId]);

  if (!reports) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (!reports.length) {
    return (
      <div className="dashboard-card p-10 text-center">
        <p className="text-sm text-muted-foreground">No visibility reports yet for this client.</p>
        <Link to="/admin/agency/visibility" className="link-warm mt-3 inline-block">
          Back to Visibility Reports
        </Link>
      </div>
    );
  }

  const latest = reports[0];
  const modelLabels = sourceModelLabels(reports);
  const rows = categoryRows(latest);
  const sourceSeries = latestPerSource(reports).map(({ source, report }) => ({ name: source, report }));
  const divergences = sourceSeries.length > 1 ? divergenceFlags(sourceSeries) : [];

  const toggleSuggestions = async () => {
    setToggling(true);
    try {
      const updated = await base44.entities.VisibilityReport.update(latest.id, {
        suggestions_client_visible: !latest.suggestions_client_visible,
      });
      setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      toast({
        title: updated.suggestions_client_visible
          ? 'Recommendations now visible to the client'
          : 'Recommendations hidden from the client',
      });
    } catch (err) {
      toast({ title: 'Could not update the toggle', description: err.message, variant: 'destructive' });
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl animate-fade-in pb-12">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/admin/agency/visibility" className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> All visibility reports
          </Link>
          <h1 className="font-heading text-3xl font-light text-foreground">{client?.company_name || 'Client'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Full internal view · {formatDate(latest.report_date)} · {scoreLabel(latest.composite_score)}
          </p>
        </div>
        <Link
          to={`/admin/agency/visibility/${clientId}/present`}
          className="btn-forge inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest"
        >
          <Presentation className="h-4 w-4" /> Presentation mode
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="dashboard-card flex flex-col items-center justify-center p-6 text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Composite Score</p>
          <p className="molten-text font-heading text-8xl font-light leading-none">
            {typeof latest.composite_score === 'number' ? latest.composite_score : '—'}
          </p>
          <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
            {latest.is_baseline ? 'Baseline snapshot' : 'Snapshot'} · {latest.access_tier === 'client' ? 'Client tier' : 'Prospect tier'} ·{' '}
            {latest.verification_status === 'human_reviewed' ? 'Human-reviewed' : 'Pending review'}
          </p>
        </div>
        <div className="dashboard-card p-6">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-heading text-xl text-foreground">Category Scores</h3>
            <span className="text-xs text-muted-foreground/70">{modelLabels[latest.source_model || 'Unlabeled source'] || 'Unlabeled source'}</span>
          </div>
          <VisibilityRadarChart series={[{ name: modelLabels[latest.source_model || 'Unlabeled source'] || 'This audit', report: latest }]} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="dashboard-card p-6">
          <h3 className="mb-4 font-heading text-xl text-foreground">Key Findings</h3>
          <ul className="space-y-3">
            {(latest.key_findings || []).map((f, i) => (
              <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                {f}
              </li>
            ))}
            {!(latest.key_findings || []).length && <li className="text-sm text-muted-foreground/70">None recorded.</li>}
          </ul>
          <div className="mt-5 space-y-4 border-t border-border/50 pt-5">
            {rows.map((r) => (
              <div key={r.key}>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-sm text-foreground">{r.label}</span>
                  <span className="text-xs text-muted-foreground">{r.score === null ? 'Unscored' : `${r.score} / ${r.max}`}</span>
                </div>
                <div className="well-track h-2.5 w-full">
                  <div className="molten-bar h-full rounded-full" style={{ width: `${r.pct ?? 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="dashboard-card p-6">
            <h3 className="mb-4 font-heading text-xl text-foreground">Priority Action List</h3>
            <ol className="space-y-3">
              {(latest.recommended_fixes || []).map((f, i) => (
                <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-sm border border-primary/40 text-[10px] font-semibold text-primary">
                    {i + 1}
                  </span>
                  {f}
                </li>
              ))}
              {!(latest.recommended_fixes || []).length && <li className="text-sm text-muted-foreground/70">None recorded.</li>}
            </ol>
          </div>

          <div className="dashboard-card p-6">
            <h3 className="mb-4 font-heading text-xl text-foreground">Competitor Map</h3>
            <div className="space-y-3">
              {(latest.competitor_map || []).map((c, i) => (
                <div key={i} className="rounded-sm border border-border/60 bg-background/40 px-4 py-3">
                  <p className="text-sm text-foreground">{c.name}</p>
                  {c.positioning && <p className="mt-0.5 text-xs text-muted-foreground">{c.positioning}</p>}
                </div>
              ))}
              {!(latest.competitor_map || []).length && <p className="text-sm text-muted-foreground/70">None recorded.</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-card mt-6 p-6">
        <h3 className="mb-3 font-heading text-xl text-foreground">Analyst Notes</h3>
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{latest.analyst_notes || 'No notes on this snapshot.'}</p>
      </div>

      <div className="dashboard-card mt-6 flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <h3 className="font-heading text-xl text-foreground">Client visibility of recommendations</h3>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
            {latest.suggestions_client_visible
              ? 'The client portal shows the priority recommendations for this report.'
              : 'Recommendations stay internal. The client portal shows the locked teaser for this report.'}
          </p>
        </div>
        <button
          type="button"
          onClick={toggleSuggestions}
          disabled={toggling}
          className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors disabled:opacity-50 ${
            latest.suggestions_client_visible ? 'border-border text-muted-foreground hover:text-foreground' : 'btn-forge border-transparent'
          }`}
        >
          {latest.suggestions_client_visible ? 'Hide from client' : 'Show to client'}
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="dashboard-card p-6">
          <h3 className="mb-4 font-heading text-xl text-foreground">Business Snapshot</h3>
          <VisibilityBusinessSnapshot report={latest} />
          {!(latest.social_channels || []).length && !Object.values(latest.business_snapshot || {}).some(Boolean) && (
            <p className="text-sm text-muted-foreground/70">Not captured yet — drafted on the next report intake.</p>
          )}
        </div>
        <div className="dashboard-card p-6">
          <h3 className="mb-4 font-heading text-xl text-foreground">Suggested Marketing Emphasis</h3>
          <VisibilityAllocation allocation={latest.marketing_allocation} />
          {!(latest.marketing_allocation || []).length && (
            <p className="text-sm text-muted-foreground/70">Not drafted yet — proposed on the next report intake.</p>
          )}
        </div>
      </div>

      {sourceSeries.length > 1 && (
        <div className="dashboard-card mt-6 p-6">
          <h3 className="mb-1 font-heading text-xl text-foreground">Multi-Model Comparison</h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Latest snapshot per source. Categories differing by 4 or more points are flagged.
          </p>
          <VisibilityRadarChart series={sourceSeries} />
          {divergences.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {divergences.map((d) => (
                <li key={d.category} className="flex items-center gap-2 text-xs text-amber-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  {d.category} diverges by {d.spread} points across sources. Verify against the raw audits before quoting either number.
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-xs text-muted-foreground/70">Sources agree within 4 points on every scored category.</p>
          )}
        </div>
      )}

      {reports.length >= 2 && (
        <div className="dashboard-card mt-6 p-6">
          <h3 className="mb-4 font-heading text-xl text-foreground">Score Over Time</h3>
          <VisibilityTrendChart reports={reports} />
          <table className="mt-4 w-full text-left text-sm">
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-t border-border/30">
                  <td className="py-2.5 text-foreground">{formatDate(r.report_date)}</td>
                  <td className="py-2.5 text-muted-foreground">{modelLabels[r.source_model || 'Unlabeled source'] || 'Unlabeled source'}</td>
                  <td className="py-2.5 text-muted-foreground">{r.is_baseline ? 'Baseline' : 'Snapshot'}</td>
                  <td className="py-2.5 text-right text-foreground">
                    {typeof r.composite_score === 'number' ? `${r.composite_score}/100` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}