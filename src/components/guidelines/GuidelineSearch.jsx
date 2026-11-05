import React from 'react';
import { Search } from 'lucide-react';

function Highlight({ text, q }) {
  const esc = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (!esc) return text;
  return text.split(new RegExp(`(${esc})`, 'ig')).map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : part));
}

export default function GuidelineSearch({ q, setQ, results, onPick }) {
  const active = q.trim().length >= 2;
  return (
    <div className="gl-search">
      <Search size={16} aria-hidden="true" />
      <input type="search" placeholder="Search brand guidelines" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search brand guidelines" />
      {active && (
        <div className="gl-results" role="listbox">
          {results.length ? results.map((r) => (
            <button key={r.id} type="button" onClick={() => onPick(r.id)}>
              <span className="gl-rpath">{r.path}</span>
              <span className="gl-rsnip"><Highlight text={r.snippet} q={q} /></span>
            </button>
          )) : <p>No matches for "{q.trim()}".</p>}
        </div>
      )}
    </div>
  );
}