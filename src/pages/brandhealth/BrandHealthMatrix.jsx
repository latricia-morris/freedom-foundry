import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useBrandHealth } from '@/hooks/useBrandHealth';
import AuditStatusPanel from '@/components/brandHealth/AuditStatusPanel';
import AuditSection from '@/components/brandHealth/AuditSection';
import { latestByComponent } from '@/lib/brandHealth';

/** Marketing Matrix subpage: the consultant-built channel and journey map. */
export default function BrandHealthMatrix() {
  const { data, error } = useBrandHealth();
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
        <h1 className="font-heading text-3xl font-light">Marketing <span className="molten-text italic">Matrix</span></h1>
        <p className="mt-2 text-sm">The report could not be loaded. Please try again in a moment.</p>
      </div>
    );
  }

  if (!data.client) {
    return (
      <div className="dash-editorial-block">
        <h1 className="font-heading text-3xl font-light">Marketing <span className="molten-text italic">Matrix</span></h1>
        <p className="mt-2 text-sm">
          Your Marketing Matrix activates once your account is connected to a brand engagement.
        </p>
      </div>
    );
  }

  const latest = latestByComponent(data.audits);
  const audit = latest.marketing_matrix;
  const findings = audit ? (data.findings || []).filter((f) => f.audit_id === audit.id) : [];
  const credit = audit ? ((data.credits || []).find((c) => c.audit_id === audit.id) || null) : null;

  return (
    <div className="animate-fade-in">
      <Link to="/brand-portal/brand-health" className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Digital Brand Health
      </Link>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-light text-foreground">Marketing <span className="molten-text italic">Matrix</span></h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Channel fit and customer journey alignment for your growth strategy.
        </p>
      </div>

      {statusAudit ? (
        <AuditStatusPanel audit={statusAudit} onClose={() => setStatusAudit(null)} />
      ) : (
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
        />
      )}
    </div>
  );
}