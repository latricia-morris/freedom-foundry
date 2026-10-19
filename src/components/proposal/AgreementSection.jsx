import React from 'react';

/**
 * Agreement: the full versioned terms frozen at publish. Readable body text,
 * never tiny gray legal print. Contract terms are never hidden.
 */
export default function AgreementSection({ proposal }) {
  const sections = proposal.agreement_sections || [];

  return (
    <section id="agreement" className="scroll-mt-24 space-y-10">
      <div>
        <p className="text-warm text-[11px] font-semibold uppercase tracking-[0.16em]">Agreement</p>
        <h2 className="mt-1 font-heading text-3xl font-light text-foreground sm:text-4xl">Terms &amp; Policies</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          These terms work together with the selected scope, investment, payment schedule, and timeline conditions.
          Please review them before signing. If something needs to change, request an adjustment so we can address it
          before you accept.
        </p>
        {proposal.agreement_version ? (
          <p className="mt-2 text-xs text-muted-foreground">Agreement library version: {proposal.agreement_version}</p>
        ) : null}
      </div>

      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.heading}>
            <h3 className="font-heading text-xl text-foreground">{section.heading}</h3>
            <div className="mt-2 space-y-3">
              {(section.paragraphs || []).map((p, i) => (
                <p key={i} className="max-w-3xl text-base leading-relaxed text-muted-foreground">{p}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}