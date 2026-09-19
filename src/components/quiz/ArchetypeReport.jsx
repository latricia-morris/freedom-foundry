import React from 'react';

const SectionHeading = ({ children }) => (
  <h3 className="text-[11px] font-body uppercase tracking-[0.28em] text-[#d9622c] mb-3">{children}</h3>
);

const BodyText = ({ paras, className = '' }) => (
  <div className={className}>
    {paras.map((p, i) => (
      <p key={i} className="text-sm text-white/70 leading-relaxed mb-3 last:mb-0">{p}</p>
    ))}
  </div>
);

const ListBlock = ({ title, items, tone }) => (
  <div>
    <p className={`text-xs uppercase tracking-widest mb-3 ${tone === 'off' ? 'text-white/40' : 'text-[#f0d9b5]'}`}>{title}</p>
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={i} className="text-sm text-white/70 leading-relaxed flex gap-2.5">
          <span className={tone === 'off' ? 'text-white/25 shrink-0' : 'text-[#d9622c] shrink-0'}>—</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  </div>
);

const Section = ({ children }) => (
  <section className="bg-black/40 border border-white/10 rounded-xl p-8">
    {children}
  </section>
);

export default function ArchetypeReport({ report, compact = false, name, score, pct }) {
  if (!report) return null;
  const display = report.display || name;

  if (compact) {
    return (
      <div className="bg-black/40 border border-white/10 rounded-xl p-8 mb-6">
        <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
          <p className="text-[10px] uppercase tracking-widest text-[#d9622c]">Secondary Archetype</p>
          <p className="text-sm text-white/40 tabular-nums">{score} points · {pct}%</p>
        </div>
        <h3 className="font-heading text-2xl text-[#f7f2ea] mb-1">The {display}</h3>
        {report.slogan && <p className="text-sm italic text-white/50 mb-4">{report.slogan}</p>}
        <BodyText paras={report.meaning || []} className="mb-5" />
        {!!(report.strengths || []).length && (
          <div>
            <SectionHeading>Your core strengths at a glance</SectionHeading>
            <ul className="space-y-2">
              {report.strengths.map(s => (
                <li key={s.title} className="text-sm text-white/70 leading-relaxed">
                  <span className="text-[#f0d9b5]">{s.title}.</span> {s.body}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  const { article = 'a' } = report;

  return (
    <div className="space-y-6 mb-6">
      <Section>
        <SectionHeading>What it means to be {article} {display} brand</SectionHeading>
        <BodyText paras={report.meaning || []} />
      </Section>

      <Section>
        <SectionHeading>Where most {display} brands get stuck</SectionHeading>
        <BodyText paras={report.stuck || []} />
      </Section>

      <Section>
        <SectionHeading>{report.shift?.heading}</SectionHeading>
        <BodyText paras={report.shift?.paras || []} />
      </Section>

      <Section>
        <SectionHeading>{report.contrast?.heading}</SectionHeading>
        <div className="grid md:grid-cols-2 gap-8">
          <ListBlock title="Playing small" items={report.contrast?.playingSmall || []} tone="off" />
          <ListBlock title={report.contrast?.owningIt?.heading} items={report.contrast?.owningIt?.items || []} />
        </div>
      </Section>

      <Section>
        <SectionHeading>The uncomfortable truth</SectionHeading>
        <BodyText paras={report.truth || []} />
      </Section>

      <Section>
        <SectionHeading>Your core strengths</SectionHeading>
        <ul className="space-y-4">
          {(report.strengths || []).map(s => (
            <li key={s.title}>
              <p className="text-sm font-medium text-[#f0d9b5] mb-1">{s.title}</p>
              <p className="text-sm text-white/70 leading-relaxed">{s.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section>
        <SectionHeading>Market posture, voice &amp; language</SectionHeading>
        <div className="space-y-4 mb-5">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#f0d9b5] mb-1.5">Market posture</p>
            <p className="text-sm text-white/70 leading-relaxed">{report.posture}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-[#f0d9b5] mb-1.5">Voice &amp; tonality</p>
            <p className="text-sm text-white/70 leading-relaxed">{report.voice}</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#f0d9b5] mb-2">{report.language?.serves?.heading}</p>
            <p className="text-sm text-white/70 leading-relaxed">{report.language?.serves?.words}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/40 mb-2">{report.language?.undermines?.heading}</p>
            <p className="text-sm text-white/50 leading-relaxed">{report.language?.undermines?.words}</p>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading>Billion-dollar brands with this archetype</SectionHeading>
        <div className="space-y-4">
          {(report.brands || []).map(b => (
            <div key={b.name}>
              <p className="text-sm font-medium text-[#f7f2ea] mb-1">{b.name}</p>
              <p className="text-sm text-white/60 leading-relaxed">{b.blurb}</p>
            </div>
          ))}
        </div>
      </Section>

      <section className="bg-gradient-to-b from-[#3a2119] to-black/60 border border-[#d9622c]/20 rounded-xl p-8">
        <SectionHeading>Your next move</SectionHeading>
        <p className="text-sm text-white/70 leading-relaxed mb-4">{report.nextMove?.intro}</p>
        <div className="border-l-2 border-[#d9622c] pl-4">
          <p className="text-sm text-white/85 leading-relaxed font-medium">{report.nextMove?.action}</p>
        </div>
      </section>
    </div>
  );
}