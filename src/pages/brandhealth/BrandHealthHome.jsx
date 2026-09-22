import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import HeroScore from '@/components/brandHealth/HeroScore';
import PillarCard from '@/components/brandHealth/PillarCard';
import { useBrandHealth } from '@/hooks/useBrandHealth';
import { PUBLISHED_STATUS, STATUS_LABELS, fmtDate, latestByComponent } from '@/lib/brandHealth';
import { formatDate } from '@/lib/visibility';

/**
 * Brand Health Index: a dashboard-style overview — big overall gradient
 * score in the hero, then one modular score card per area with large
 * gradient numbers, a status pill, and skimmable key points. No long
 * summaries; each card opens its area's full dashboard.
 */
export default function BrandHealthHome() {
  const { data, error } = useBrandHealth();
  const [vis, setVis] = useState(undefined);

  useEffect(() => {
    let alive = true;
    base44.functions
      .invoke('get-visibility-reports', {})
      .then((res) => {
        if (alive) setVis(res.data || {});
      })
      .catch(() => {
        if (alive) setVis({});
      });
    return () => {
      alive = false;
    };
  }, []);

  const loading = (!data && !error) || vis === undefined;

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dash-editorial-block">
        <h1 className="font-heading text-4xl font-light sm:text-5xl">Brand Health <span className="molten-text italic">Index</span></h1>
        <p className="mt-3 text-sm">The report could not be loaded. Please try again in a moment.</p>
      </div>
    );
  }

  if (!data.client) {
    return (
      <div className="dash-editorial-block">
        <h1 className="font-heading text-4xl font-light sm:text-5xl">Brand Health <span className="molten-text italic">Index</span></h1>
        <p className="mt-3 text-sm">
          Brand Health activates once your account is connected to a brand engagement. Your scores will appear here.
        </p>
      </div>
    );
  }

  const latest = latestByComponent(data.audits);
  const visReport = (vis.reports || [])[0] || null;
  const wd = latest.website_discoverability || null;
  const cr = latest.conversion_readiness || null;
  const mm = latest.marketing_matrix || null;

  const publishedScore = (a) =>
    a && a.status === PUBLISHED_STATUS && typeof a.score === 'number' ? a.score : null;
  const visScore = visReport && typeof visReport.composite_score === 'number' ? visReport.composite_score : null;
  const wdScore = publishedScore(wd);
  const crScore = publishedScore(cr);
  const maiScore = mm && mm.status === PUBLISHED_STATUS && typeof mm.mai === 'number' ? mm.mai : null;

  const live = [visScore, wdScore, crScore, maiScore].filter((s) => typeof s === 'number');
  const overall = live.length ? Math.round(live.reduce((a, b) => a + b, 0) / live.length) : null;

  const statusOf = (a) =>
    !a
      ? { label: 'Not Started', tone: 'muted' }
      : a.status === PUBLISHED_STATUS
        ? { label: `Reviewed ${fmtDate(a.reviewed_date)}`, tone: 'complete' }
        : { label: STATUS_LABELS[a.status] || 'In Progress', tone: 'progress' };

  const findingsFor = (audit) => (audit ? (data.findings || []).filter((f) => f.audit_id === audit.id) : []);

  const webAudits = [wd, cr].filter(Boolean);
  const webStatus = webAudits.length
    ? webAudits.every((a) => a.status === PUBLISHED_STATUS)
      ? { label: `Reviewed ${fmtDate((wd && wd.reviewed_date) || (cr && cr.reviewed_date))}`, tone: 'complete' }
      : { label: 'In Progress', tone: 'progress' }
    : { label: 'Not Started', tone: 'muted' };

  const websitePoints = [...findingsFor(wd), ...findingsFor(cr)].slice(0, 3).map((f) => f.title).filter(Boolean);
  const matrixPoints = mm
    ? (data.leverage || []).filter((o) => o.audit_id === mm.id).slice(0, 3).map((o) => o.title).filter(Boolean)
    : [];
  const visPoints = ((visReport && visReport.key_findings) || []).slice(0, 3);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-heading text-4xl font-light text-foreground sm:text-5xl">
          Brand Health <span className="molten-text italic">Index</span>
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Your combined standing across visibility, website performance, and marketing strategy.
        </p>
      </div>

      <HeroScore
        label="Overall Brand Health"
        value={overall}
        pill={live.length ? `${live.length} of 4 measures live` : 'Assessment in progress'}
        subline="An average of every published score below. Open any area to explore its full dashboard."
        stats={[
          { label: 'Visibility', value: visScore },
          { label: 'Discoverability', value: wdScore },
          { label: 'Conversion', value: crScore },
          { label: 'Alignment', value: maiScore },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <PillarCard
          to="/brand-portal/brand-health/visibility"
          title="Visibility & Credibility"
          scores={[{ label: 'Composite Score', value: visScore }]}
          status={visReport ? `Snapshot ${formatDate(visReport.report_date)}` : 'Not Started'}
          statusTone={visReport ? 'complete' : 'muted'}
          points={visPoints}
          fallback="How your brand appears across AI search engines, public listings, and trusted sources."
        />
        <PillarCard
          to="/brand-portal/brand-health/website"
          title="Website Discoverability & Conversion Readiness"
          scores={[
            { label: 'Discoverability', value: wdScore },
            { label: 'Conversion', value: crScore },
          ]}
          status={webStatus.label}
          statusTone={webStatus.tone}
          points={websitePoints}
          fallback="Whether the right people can find your business — and take the next step once they do."
        />
        <PillarCard
          to="/brand-portal/brand-health/marketing-matrix"
          title="Marketing Matrix"
          scores={[{ label: 'Market Alignment Index', value: maiScore }]}
          status={statusOf(mm).label}
          statusTone={statusOf(mm).tone}
          points={matrixPoints}
          fallback="Channel fit and customer journey alignment for your growth strategy."
        />
      </div>
    </div>
  );
}