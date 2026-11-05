import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function GuidelineToc({ sections, onGo }) {
  const [open, setOpen] = useState({});
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <nav className={`gl-toc ${mobileOpen ? 'm-open' : ''}`} aria-label="Guidelines contents">
      <button type="button" className="gl-toctoggle" onClick={() => setMobileOpen(!mobileOpen)} aria-expanded={mobileOpen}>
        Contents <ChevronDown size={16} />
      </button>
      <ol className="gl-toclist">
        {sections.map((s) => (
          <li key={s.id}>
            <div className="gl-h1row">
              <button type="button" className="gl-h1link" onClick={() => onGo(s.id)}>{s.title}</button>
              {s.subs.length > 0 && (
                <button type="button" className="gl-exp" aria-expanded={!!open[s.id]} aria-label={`Show sections in ${s.title}`}
                  onClick={() => setOpen({ ...open, [s.id]: !open[s.id] })}>
                  <ChevronDown size={15} className={open[s.id] ? '' : 'closed'} />
                </button>
              )}
            </div>
            {open[s.id] && (
              <ol className="gl-h2list">
                {s.subs.map((u) => <li key={u.id}><button type="button" onClick={() => onGo(u.id)}>{u.title}</button></li>)}
              </ol>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}