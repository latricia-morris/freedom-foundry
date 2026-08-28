import React from 'react';
import { Link } from 'react-router-dom';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function LegalSection({ section }) {
  return (
    <section className="border-t border-[#1a1420]/10 pt-6 first:border-t-0 first:pt-0">
      <h2 className="font-heading text-xl text-[#1a1420] mb-3">{section.title}</h2>
      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph} className="text-sm leading-7 text-[#2c2c33] mb-3 last:mb-0">
          {paragraph}
        </p>
      ))}
      {section.bullets && (
        <ul className="list-disc pl-5 space-y-2 text-sm leading-6 text-[#2c2c33]">
          {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
        </ul>
      )}
      {section.blocks?.map((block) => (
        <div key={block.heading} className="mt-5 first:mt-3">
          <h3 className="text-sm font-semibold text-[#1a1420] mb-2">{block.heading}</h3>
          {block.paragraphs?.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-7 text-[#2c2c33] mb-3 last:mb-0">
              {paragraph}
            </p>
          ))}
          {block.bullets && (
            <ul className="list-disc pl-5 space-y-2 text-sm leading-6 text-[#2c2c33]">
              {block.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
            </ul>
          )}
        </div>
      ))}
    </section>
  );
}

export default function LegalPage({ title, accent, effectiveDate, intro, sections, contactType }) {
  return (
    <div className="min-h-[100dvh] bg-[#14110f] text-[#f7f5f5]">
      <header className="border-b border-[#f0d9b5]/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 lg:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="Freedom Foundry home">
            <img
              src={`${basePath}/forge-logo.png`}
              alt="Freedom Foundry"
              className="h-10 w-10 rounded-xl object-cover shadow-[0_0_14px_rgba(217,98,44,0.4)]"
            />
            <div className="leading-tight">
              <p className="font-heading text-lg tracking-[0.04em]">FREEDOM FOUNDRY</p>
              <p className="text-[9px] uppercase tracking-[0.25em] text-[#d9c9a3]">By The Brand Revivalist</p>
            </div>
          </Link>
          <Link to="/" className="text-sm text-[#b7b3b0] transition-colors hover:text-[#f7f5f5]">
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-14 lg:px-8 lg:py-20">
        <div className="mb-8">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.28em] text-[#d9622c]">
            Freedom Foundry
          </p>
          <h1 className="font-heading text-4xl font-light leading-tight sm:text-5xl">
            {title} <span className="molten-text italic">{accent}</span>
          </h1>
          <p className="mt-4 text-sm text-[#b7b3b0]">Effective Date: {effectiveDate}</p>
        </div>

        <article className="editorial-container space-y-6">
          {intro.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-7 text-[#2c2c33]">{paragraph}</p>
          ))}
          {sections.map((section) => <LegalSection key={section.title} section={section} />)}
          <div className="border-t border-[#1a1420]/10 pt-6 text-sm leading-7 text-[#2c2c33]">
            For questions regarding these {contactType}, contact{' '}
            <a className="link-molten" href="mailto:latricia@thebrandrevivalist.com">
              latricia@thebrandrevivalist.com
            </a>
            .
          </div>
        </article>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 px-5 py-8 text-xs text-[#8d8b89] lg:px-8">
        <span>© {new Date().getFullYear()} The Brand Revivalist</span>
        <div className="flex gap-4">
          <Link to="/privacy" className="hover:text-[#f7f5f5]">Privacy</Link>
          <Link to="/terms" className="hover:text-[#f7f5f5]">Terms</Link>
        </div>
      </footer>
    </div>
  );
}