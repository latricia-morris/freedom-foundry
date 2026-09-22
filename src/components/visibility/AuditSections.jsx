import React from 'react';
import { clientSafeSections } from '@/lib/visibility';
import AuditFindingCard from './AuditFindingCard';

/**
 * Audit findings: one open card per diagnostic, stacked in presentation
 * order. Client-safe filtering happens in clientSafeSections; each card
 * renders its full content openly — no hidden disclosures.
 */
export default function AuditSections({ report }) {
  const sections = clientSafeSections(report);
  if (!sections.length) return null;

  return (
    <div className="grid gap-4">
      {sections.map((s, i) => (
        <AuditFindingCard key={`${s.title}-${i}`} section={s} index={i} />
      ))}
    </div>
  );
}