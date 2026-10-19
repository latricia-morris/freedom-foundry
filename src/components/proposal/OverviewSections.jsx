import React from 'react';
import { Image } from '@/components/ui/image';
import { fmtDate } from '@/lib/proposalFormat';

const eyebrow = 'text-warm text-[11px] font-semibold uppercase tracking-[0.16em]';

const FAMILY_PORTRAIT_URL =
  'https://media.base44.com/images/public/6a6982f0647238bf2b5d67bf/9c579b559_latriciaandkiddos2025-38.jpg';

function LogoTile({ logo }) {
  if (!logo.url) return null;
  const light = logo.panel === 'light';
  return (
    <div
      className={`flex h-20 items-center justify-center rounded-sm px-4 ${
        light ? 'bg-[#f5f5f5]' : 'bg-[#101116] border border-white/10'
      }`}
    >
      <Image src={logo.url} alt={logo.name} fittingType="fit" className="h-10 w-full max-w-[140px] md:h-12" />
    </div>
  );
}

/**
 * Overview: cover, introduction, approach, capabilities, Meet LaTricia, and
 * the book feature. All copy arrives frozen from the published proposal.
 */
export default function OverviewSections({ proposal, onRequestChange }) {
  const c = proposal.content || {};
  const cover = c.cover || {};
  const intro = c.introduction || {};
  const approach = c.approach || {};
  const capabilities = c.capabilities || {};
  const meet = c.meet || {};
  const book = c.book || {};
  const visible = proposal.sections_visible || {};
  const recipient = proposal.recipient || {};

  return (
    <div className="space-y-20">
      <section id="overview" className="relative scroll-mt-24">
        <p className={eyebrow}>{cover.eyebrow}</p>
        <h1 className="mt-3 max-w-3xl font-heading text-4xl font-light leading-tight text-foreground sm:text-5xl">
          {proposal.title}
        </h1>
        {cover.recipient ? <p className="mt-3 font-heading text-xl italic text-muted-foreground">{cover.recipient}</p> : null}
        <p className="mt-2 text-sm text-muted-foreground">Prepared by: {cover.prepared_by}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Issued: {fmtDate(proposal.issue_date)} &middot; Valid through: {fmtDate(proposal.expiry_date)}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href="#project" className="btn-forge inline-flex min-h-11 items-center rounded-sm px-6 py-3 text-sm font-semibold">Explore your proposal</a>
          <a href="#investment" className="inline-flex min-h-11 items-center rounded-sm border border-primary/40 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-primary/10">Review investment</a>
          <button type="button" onClick={onRequestChange} className="inline-flex min-h-11 items-center px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">Request a change</button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-3xl font-light text-foreground sm:text-4xl">{intro.heading}</h2>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">{intro.body}</p>
        <p className="pt-2 font-heading text-lg text-foreground">{intro.closing}</p>
        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{intro.role}</p>
      </section>

      {visible.approach !== false && approach.heading ? (
        <section className="space-y-6">
          <div>
            <p className={eyebrow}>{approach.eyebrow}</p>
            <h2 className="mt-1 font-heading text-3xl font-light text-foreground sm:text-4xl">{approach.heading}</h2>
          </div>
          {(approach.body || []).map((p, i) => (
            <p key={i} className="max-w-2xl text-base leading-relaxed text-muted-foreground">{p}</p>
          ))}
          <div className="grid gap-6 pt-2 sm:grid-cols-3">
            {(approach.blocks || []).map((b) => (
              <div key={b.heading}>
                <p className="font-heading text-lg text-foreground">{b.heading}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{approach.footer}</p>
        </section>
      ) : null}

      {visible.capabilities !== false && capabilities.heading ? (
        <section className="space-y-6">
          <div>
            <p className={eyebrow}>{capabilities.eyebrow}</p>
            <h2 className="mt-1 font-heading text-3xl font-light text-foreground sm:text-4xl">{capabilities.heading}</h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">{capabilities.intro}</p>
          </div>
          <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
            {(capabilities.categories || []).map((cat) => (
              <div key={cat.name}>
                <h3 className="font-heading text-xl text-foreground">{cat.name}</h3>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-relaxed text-muted-foreground">
                  {cat.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{capabilities.always_show}</p>
        </section>
      ) : null}

      {visible.meet !== false && meet.heading ? (
        <section className="space-y-6">
          <div>
            <p className={eyebrow}>{meet.eyebrow}</p>
            <h2 className="mt-1 font-heading text-3xl font-light text-foreground sm:text-4xl">{meet.heading}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{meet.role_line}</p>
          </div>
          <div className="relative">
            {meet.portrait_url ? (
              <Image src={meet.portrait_url} alt="LaTricia Morris" fittingType="fit" className="w-full" />
            ) : null}
            <div className="mt-4 max-w-md lg:absolute lg:left-6 lg:top-6 lg:mt-0 lg:max-w-sm">
              <p className="text-base leading-relaxed text-foreground lg:[text-shadow:0_1px_12px_rgba(5,5,6,0.9)]">{meet.body}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground lg:hidden">Copy continues here; the full portrait is preserved on every screen size.</p>
          <div className="mt-12 grid items-center gap-8 md:grid-cols-2">
            <div className="rounded-sm bg-[#f5f5f5] p-4 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
              <Image
                src={FAMILY_PORTRAIT_URL}
                alt="LaTricia Morris with her children"
                fittingType="fit"
                originWidth={1024}
                originHeight={683}
                className="w-full"
              />
            </div>
            <p className="font-heading text-xl italic leading-relaxed text-muted-foreground">
              LaTricia and her children &mdash; the family at the heart of the work.
            </p>
          </div>
          <div className="grid gap-6 pt-2 sm:grid-cols-3">
            {(meet.credentials || []).map((cred) => (
              <div key={cred.heading}>
                <p className="font-heading text-lg text-foreground">{cred.heading}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{cred.body}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-6 pt-2 md:grid-cols-2">
            <div>
              <p className="font-heading text-lg text-foreground">{meet.recognition_heading}</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-relaxed text-muted-foreground">
                {(meet.recognition_items || []).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div>
              <p className="font-heading text-lg text-foreground">{meet.media_heading}</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {(meet.media_logos || []).map((logo) => <LogoTile key={logo.name} logo={logo} />)}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {visible.book !== false && book.heading ? (
        <section className="space-y-6">
          <div>
            <p className={eyebrow}>{book.eyebrow}</p>
            <h2 className="mt-1 font-heading text-3xl font-light text-foreground sm:text-4xl">{book.heading}</h2>
            <p className="mt-1 font-heading text-lg italic text-muted-foreground">{book.subheading}</p>
          </div>
          <div className="grid items-start gap-10 md:grid-cols-2">
            <div className="space-y-4">
              <p className="text-base leading-relaxed text-muted-foreground">{book.body}</p>
              <ul className="list-inside list-disc space-y-1 text-sm leading-relaxed text-muted-foreground">
                {(book.list || []).map((item) => <li key={item}>{item}</li>)}
              </ul>
              <a
                href={book.button_url}
                target="_blank"
                rel="noopener noreferrer"
                className="link-warm inline-block"
              >
                {book.button_label} &rarr;
              </a>
            </div>
            <div className="flex items-center justify-center">
              {book.mockup_url ? (
                <Image src={book.mockup_url} alt={`${book.heading} book`} fittingType="fit" className="w-full max-w-sm" />
              ) : null}
            </div>
          </div>
          {book.news_heading ? (
            <div className="border-t border-border/60 pt-6">
              <p className="font-heading text-lg text-foreground">{book.news_heading}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{book.news_copy}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                {(book.announcement_logos || []).map((logo) => (
                  <div key={logo.name}>
                    {logo.link && logo.confirmed ? (
                      <a href={logo.link} target="_blank" rel="noopener noreferrer" aria-label={logo.name}>
                        <LogoTile logo={logo} />
                      </a>
                    ) : (
                      <LogoTile logo={logo} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}