import React from 'react';

/** Skimmable bulleted key points. */
export default function KeyPoints({ points, max = 3, className = '' }) {
  const list = (points || []).filter(Boolean).slice(0, max);
  if (!list.length) return null;

  return (
    <ul className={`space-y-2.5 ${className}`}>
      {list.map((p, i) => (
        <li key={i} className="flex gap-3 text-sm leading-snug text-muted-foreground">
          <span className="molten-bar mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full" />
          <span className="min-w-0 break-words">{p}</span>
        </li>
      ))}
    </ul>
  );
}