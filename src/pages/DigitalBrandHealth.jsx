import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import HealthOverviewTab from '@/components/brandHealth/HealthOverviewTab';
import AuditStatusPanel from '@/components/brandHealth/AuditStatusPanel';
import AuditSection from '@/components/brandHealth/AuditSection';
import { COMPONENTS, latestByComponent } from '@/lib/brandHealth';

const TABS = ['Overview', 'Website Discoverability & Conversion Readiness', 'Marketing Matrix'];
const COMPONENT_TAB = { website_discoverability: 1, conversion_readiness: 1, marketing_matrix: 2 };

/**
 * Client-facing Digital Brand Health portal: consultant-led audits across
 * three components, with a persistent three-tab structure and a status-only
 * view for audits still in progress.
 */
export default function DigitalBrandHealth() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState(0);
  const [statusAudit, setStatusAudit] = useState(null);

  useEffect(() => {
    base44.functions
      .invoke('get-brand-health', {})
      .then((res) => setData(res.data))
      .catch(() => setError(true));
  }, []);

  const latest = useMemo(() => latestByComponent(data?.audits), [data]);
  const findingsFor = (audit) => (data?.findings || []).filter((f) => f.audit_id === audit.id);
  const creditFor = (audit) => (data?.credits || []).find((c) => c.audit_id === audit.id) || null;

  if (!data && !error) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dash-editorial-block">
        <h1 className="font-heading text-3xl font-light">Digital <span className="molten-text italic">Brand Health</span></h1>
        <p className="mt-2 text-sm">The report could not be loaded. Please try again in a moment.</p>
      </div>
    );
  }

  if (!data.client) {
    return (
      <div className="dash-editorial-block">
        <h1 className="font-heading text-3xl font-light">Digital <span className="molten-text italic">Brand Health</span></h1>
        <p className="mt-2 text-sm">
          Digital Brand Health activates once your account is connected to a brand engagement. Your audits will appear here.
        </p>
      </div>
    );
  }

  const openStatus = (audit) => setStatusAudit(audit);
  const openReport = (componentKey) => {
    setStatusAudit(null);
    setTab(COMPONENT_TAB[componentKey] ?? 0);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-light text-foreground">Digital <span className="molten-text italic">Brand Health</span></h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          A focused view of how your business is found, trusted, understood, and positioned to move the right people toward action.
        </p>
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-border" role="tablist" aria-label="Digital Brand Health views">
        {TABS.map((label, i) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={tab === i}
            onClick={() => { setTab(i); setStatusAudit(null); }}
            className={`-mb-px border-b-2 pb-3 text-sm tracking-wide transition-colors ${
              tab === i ? 'border-primary font-medium text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {statusAudit ? (
        <AuditStatusPanel audit={statusAudit} onClose={() => setStatusAudit(null)} />
      ) : tab === 0 ? (
        <HealthOverviewTab latest={latest} onOpenStatus={openStatus} onOpenReport={openReport} />
      ) : (
        <div className="space-y-10">
          {(tab === 1 ? COMPONENTS.filter((c) => !c.matrix) : COMPONENTS.filter((c) => c.matrix)).map((component) => (
            <AuditSection
              key={component.key}
              component={component}
              audit={latest[component.key]}
              findings={latest[component.key] ? findingsFor(latest[component.key]) : []}
              credit={latest[component.key] ? creditFor(latest[component.key]) : null}
              onOpenStatus={openStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}