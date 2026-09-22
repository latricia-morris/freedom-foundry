import React from 'react';
import { clientSafeSections } from '@/lib/visibility';
import AuditFindingRow from './AuditFindingRow';

const SURFACE_GRADIENT =
  'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0) 45%), linear-gradient(135deg, #14161A, #101216)';

/**
 * Audit findings: one contained surface of structured diagnostic rows
 * separated by dividers. Client-safe filtering happens in
 * clientSafeSections; each row's hierarchy and expandable source
 * detail live in AuditFindingRow.
 */
export default function AuditSections({ report }) {
  const sections = clientSafeSections(report);
  if (!sections.length) return null;

  return (
    <div className="overflow-hidden rounded-sm border border-border/60" style={{ background: SURFACE_GRADIENT }}>
      <div className="divide-y divide-border/30">
        {sections.map((s, i) => (
          <AuditFindingRow key={`${s.title}-${i}`} section={s} index={i} />
        ))}
      </div>
    </div>
  );
}