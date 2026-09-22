import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useBrandHealth } from '@/hooks/useBrandHealth';
import AnchorNav from '@/components/brandHealth/AnchorNav';
import AuditStatusPanel from '@/components/brandHealth/AuditStatusPanel';
import AuditSection from '@/components/brandHealth/AuditSection';
import { latestByComponent } from '@/lib/brandHealth';

const NAV = [
  { id: 'website-discoverability', label: 'Discoverability' },
  { id: 'conversion-readiness', label: 'Conversion Readiness' },
];

/**
 * Website Discoverability & Conversion Readiness subpage: both
 * consultant-led reviews in one place, with intake, status, and published
 * reports handled per component.
 */
export default function BrandHealthWebsite() {
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
        <h1 className="font-heading text-4xl font-light sm:text-5xl">Website <span className="molten-text italic">Audits</span></h1>
        <p className="mt-3 text-sm">The report could not be loaded. Please try again in a moment.</p>
      </div>
    );
  }

  if (!data.client) {
    return (
      <div className="dash-editorial-block">
        <h1 className="font-heading text-4xl font-light sm:text-5xl">Website <span className="molten-text italic">Audits</span></h1>
        <p className="mt-3 text-sm">
          These reviews activate once your account is connected to a brand engagement.
        </p>
      </div>
    );
  }

  const latest = latestByComponent(data.audits);
  const findingsFor = (audit) => (data.findings || []).filter((f) => f.audit_id === audit.id);
  const creditFor = (audit) => (data.credits || []).find((c) => c.audit_id === audit.id) || null;
  const components = [
    { key: 'website_discoverability', title: 'Website Discoverability', descriptor: 'Can the right person find this business and recognize it as relevant, legitimate, and worth investigating?' },
    { key: 'conversion_readiness', title: 'Website Conversion Readiness', descriptor: 'Once qualified people arrive, does the website help them understand the value, believe the business, and move forward with confidence?' },
  ];

  return (
    <div className="animate-fade-in">
      <Link to="/brand-portal/brand-health" className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Brand Health Index
      </Link>
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-light text-foreground sm:text-5xl">
          Website Discoverability <span className="text-muted-foreground">&amp;</span> <span className="molten-text italic">Conversion Readiness</span>
        </h1>
        <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">
          Two consultant-led reviews of your website: whether the right people can find you, and whether
          the site moves them forward with confidence.
        </p>
      </div>

      {statusAudit ? (
        <AuditStatusPanel audit={statusAudit} onClose={() => setStatusAudit(null)} />
      ) : (
        <>
          <AnchorNav items={NAV} />
          <div className="space-y-10">
            {components.map((component) => {
              const audit = latest[component.key];
              return (
                <section key={component.key} id={component.key.replace(/_/g, '-')} className="scroll-mt-32 lg:scroll-mt-44">
                  <AuditSection
                    component={{ ...component, matrix: false, missing: `It looks like we haven't yet conducted a ${component.title} review for your brand.` }}
                    audit={audit}
                    findings={audit ? findingsFor(audit) : []}
                    credit={audit ? creditFor(audit) : null}
                    onOpenStatus={setStatusAudit}
                    reload={reload}
                  />
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}