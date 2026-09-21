import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import VisibilityRadarChart from '@/components/visibility/VisibilityRadarChart';
import LockedActionPlan from '@/components/visibility/LockedActionPlan';
import { formatDate, scoreLabel } from '@/lib/visibility';

/**
 * Consultation presentation mode: one screen, no scrolling, built for a live
 * screen-share call. Scores and headline findings only; the action plan stays
 * visibly locked. No export controls in this view.
 */
export default function AdminVisibilityPresent() {
  const { clientId } = useParams();
  const [client, setClient] = useState(null);
  const [report, setReport] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    base44.entities.AgencyClient.get(clientId).then(setClient).catch(() => setClient(null));
    base44.entities.VisibilityReport
      .filter({ agency_client_id: clientId }, '-report_date', 1)
      .then((rows) => {
        if (rows && rows.length) setReport(rows[0]);
        else setMissing(true);
      })
      .catch(() => setMissing(true));
  }, [clientId]);

  if (!report && !missing) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (missing) {
    return (
      <div className="dashboard-card p-10 text-center">
        <p className="text-sm text-muted-foreground">No published report for this client yet.</p>
        <Link to="/admin/agency/visibility" className="link-warm mt-3 inline-block">Back to Visibility Reports</Link>
      </div>
    );
  }

  const composite = typeof report.composite_score === 'number' ? report.composite_score : null;
  const headline = (report.key_findings || []).slice(0, 4);

  return (
    <div className="flex min-h-[calc(100vh-10rem)] animate-fade-in flex-col gap-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Consultation view · {formatDate(report.report_date)}</p>
          <h1 className="font-heading text-3xl font-light text-foreground">{client?.company_name || 'Visibility & Credibility Report'}</h1>
        </div>
        <Link
          to={`/admin/agency/visibility/${clientId}`}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Exit presentation
        </Link>
      </div>

      <div className="grid flex-1 gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="dashboard-card flex flex-col items-center justify-center p-8 text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Composite Score</p>
          <p className="molten-text font-heading text-[9rem] font-light leading-none">
            {composite === null ? '—' : composite}
          </p>
          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-muted-foreground">
            {composite === null ? 'Out of 100' : `${scoreLabel(composite)} · Out of 100`}
          </p>
        </div>
        <div className="dashboard-card flex flex-col justify-center p-6">
          <h3 className="mb-2 font-heading text-xl text-foreground">Category Scores</h3>
          <VisibilityRadarChart series={[{ name: 'This audit', report }]} height={380} />
        </div>
      </div>

      {headline.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {headline.map((f, i) => (
            <div key={i} className="dashboard-card p-5">
              <p className="text-xs uppercase tracking-widest text-primary">Finding {i + 1}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f}</p>
            </div>
          ))}
        </div>
      )}

      <LockedActionPlan label="Full action plan available with engagement" />
    </div>
  );
}