import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useBrandHealth } from '@/hooks/useBrandHealth';
import AnchorNav from '@/components/brandHealth/AnchorNav';
import AuditStatusPanel from '@/components/brandHealth/AuditStatusPanel';
import AuditSection from '@/components/brandHealth/AuditSection';
import { PUBLISHED_STATUS, latestByComponent } from '@/lib/brandHealth';

const NAV = [
  { id: 'bh-strategy', label: 'Strategy' },
  { id: 'bh-channel-map', label: 'Channel Map' },
  { id: 'bh-journey', label: 'Journey' },
  { id: 'bh-opportunities', label: 'Opportunities' },
  { id: 'bh-actions', label: 'Actions' },
];

/** Marketing Matrix subpage: the consultant-built channel and journey map. */
export default function BrandHealthMatrix() {
  const { data, error, reload } = useBrandHealth();
  const [statusAudit, setStatusAudit] = useState(null);

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
        <h1 className="font-heading text-4xl font-light sm:text-5xl">Marketing <span className="molten-text italic">Matrix</span></h1>
        <p className="mt-3 text-sm">The report could not be loaded. Please try again in a moment.</p>
      </div>
    );
  }

  if (!data.client) {
    return (
      <div className="dash-editorial-block">
        <h1 className="font-heading text-4xl font-light sm:text-5xl">Marketing <span className="molten-text italic">Matrix</span></h1>
        <p className="mt-3 text-sm">
          Your Marketing Matrix activates once your account is connected to a brand engagement.
        </p>
      </div>
    );
  }

  const latest = latestByComponent(data.audits);
  const audit = latest.marketing_matrix;
  const published = audit && audit.status === PUBLISHED_STATUS;
  const findings = audit ? (data.findings || []).filter((f) => f.audit_id === audit.id) : [];
  const credit = audit ? ((data.credits || []).find((c) => c.audit_id === audit.id) || null) : null;
  const matrixChannels = audit ? (data.matrix || []).filter((c) => c.audit_id === audit.id) : [];
  const leverage = audit ? (data.leverage || []).filter((o) => o.audit_id === audit.id) : [];

  return (
    <div className="animate-fade-in">
      <Link to="/brand-portal/brand-health" className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Brand Health Index
      </Link>
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-light text-foreground sm:text-5xl">Marketing <span className="molten-text italic">Matrix</span></h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">
          Channel fit and customer journey alignment for your growth strategy.
        </p>
      </div>

      {statusAudit ? (
        <AuditStatusPanel audit={statusAudit} onClose={() => setStatusAudit(null)} />
      ) : (
        <>
          {published && <AnchorNav items={NAV} />}
          <AuditSection
            component={{
              key: 'marketing_matrix',
              title: 'Marketing Matrix',
              matrix: true,
              missing: "It looks like we haven't yet developed a Marketing Matrix for your brand.",
            }}
            audit={audit}
            findings={findings}
            credit={credit}
            onOpenStatus={setStatusAudit}
            reload={reload}
            matrixChannels={matrixChannels}
            leverage={leverage}
          />
        </>
      )}
    </div>
  );
}