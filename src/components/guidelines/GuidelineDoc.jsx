import React from 'react';

// Block HTML is rebuilt from an allowlist in guidelineParser before it reaches this component.
const Blocks = ({ blocks }) => (blocks.length ? <div className="gl-prose" dangerouslySetInnerHTML={{ __html: blocks.map((b) => b.html).join('') }} /> : null);

export default function GuidelineDoc({ sections, pre, flash }) {
  return (
    <article className="gl-doc">
      {sections.map((s) => (
        <section key={s.id} id={pre + s.id} className={`gl-sec ${flash === s.id ? 'flash' : ''}`}>
          <h1 className="gl-h1">{s.title}</h1>
          <Blocks blocks={s.blocks} />
          {s.subs.map((u) => (
            <details key={u.id} id={pre + u.id} open className={`gl-sub ${flash === u.id ? 'flash' : ''}`}>
              <summary className="gl-h2">{u.title}</summary>
              <Blocks blocks={u.blocks} />
            </details>
          ))}
        </section>
      ))}
    </article>
  );
}