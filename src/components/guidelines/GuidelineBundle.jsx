import React, { useMemo } from 'react';
import './guidelines.css';
import GuidelineViewer from './GuidelineViewer';
import GuidelineResources from './GuidelineResources';
import { safeParse } from '@/lib/guidelineParser';

export default function GuidelineBundle({ guideline: g, compact }) {
  const parsed = useMemo(() => (g?.source_text ? safeParse(g.source_text, g.source_format) : null), [g]);
  if (!g) return null;
  const resources = <GuidelineResources published_url={g.published_url} pdf_url={g.pdf_url} />;
  if (parsed?.sections) return <GuidelineViewer sections={parsed.sections} compact={compact} resources={resources} />;
  return (
    <div className="glx">
      {parsed?.error && <p className="gl-error">The searchable guidelines could not be displayed: {parsed.error}</p>}
      {resources}
    </div>
  );
}