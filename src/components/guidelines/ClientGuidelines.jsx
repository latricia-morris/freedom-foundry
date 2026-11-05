import React from 'react';
import GuidelineBundle from './GuidelineBundle';
import { useGuidelines } from './useIgniteClient';

// Client-facing guideline library: renders nothing unless something was added to their account.
export default function ClientGuidelines() {
  const { data, isPending } = useGuidelines();
  if (isPending) return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;
  const g = data?.guideline;
  if (!g) return null;
  return (
    <section className="mb-8 rounded p-4 md:p-6" style={{ background: '#000' }}>
      <GuidelineBundle guideline={g} />
    </section>
  );
}