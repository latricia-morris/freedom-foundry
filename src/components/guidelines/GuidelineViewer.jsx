import React, { useId, useMemo, useState } from 'react';
import './guidelines.css';
import GuidelineSearch from './GuidelineSearch';
import GuidelineToc from './GuidelineToc';
import GuidelineDoc from './GuidelineDoc';
import { searchGuidelines } from '@/lib/guidelineParser';

export default function GuidelineViewer({ sections, compact, resources }) {
  const pre = `gl${useId().replace(/:/g, '')}-`;
  const [q, setQ] = useState('');
  const [flash, setFlash] = useState(null);
  const results = useMemo(() => searchGuidelines(sections, q), [sections, q]);

  const go = (id) => {
    const el = document.getElementById(pre + id);
    if (!el) return;
    if (el.tagName === 'DETAILS') el.open = true;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setFlash(id);
    setTimeout(() => setFlash(null), 1600);
  };

  return (
    <div className={`glx ${compact ? 'gl-compact' : ''}`}>
      <div className="gl-bar">
        <GuidelineSearch q={q} setQ={setQ} results={results} onPick={(id) => { go(id); setQ(''); }} />
        {resources}
      </div>
      <div className="gl-body">
        <GuidelineToc sections={sections} onGo={go} />
        <GuidelineDoc sections={sections} pre={pre} flash={flash} />
      </div>
    </div>
  );
}