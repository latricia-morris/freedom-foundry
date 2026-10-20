import { Icon, useFontAvailability } from './shared';

export const SPECIMEN_TEXT = 'The future feels unmistakably yours.';

export const safeUrl = (url) => {
  if (!url) return null;
  try {
    const parsed = new URL(String(url).includes('://') ? url : `https://${url}`);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : null;
  } catch { return null; }
};

export function TopBar({ label }) {
  return (
    <header className="top">
      <div className="brand">FREEDOM FOUNDRY<small>BY THE BRAND REVIVALIST&reg;</small></div>
      <span className="shared gradient">{label}</span>
    </header>
  );
}

export function Mast({ title, subtitle, onCopyAll }) {
  return (
    <header className="mast">
      <div>
        <span className="eyebrow gradient">SHARED BRAND PORTAL</span>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="actions">
        <button type="button" className="btn primary" onClick={onCopyAll}><Icon path="copy" /> Copy all details</button>
        <button type="button" className="btn" onClick={() => window.print()}><Icon path="print" /> Print / save PDF</button>
      </div>
    </header>
  );
}

export function Section({ id, heading, sub, copyValue, copy, copyLabel = 'Copy section', children }) {
  return (
    <section id={id} className="section">
      <div className="sectionhead">
        <div>
          <h2>{heading}</h2>
          {sub && <p>{sub}</p>}
        </div>
        {copyValue && (
          <button type="button" className="copy" onClick={() => copy(copyValue)}>
            <Icon path="copy" /> <span>{copyLabel}</span>
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

export function Palette({ colors, copy }) {
  return (
    <>
      <div className="palette">
        {colors.map((c, i) => {
          const hex = String(c.hex || '').toUpperCase();
          return (
            <button key={`${hex}-${i}`} type="button" className="paint" onClick={() => copy(hex)} aria-label={`Copy color ${hex}`}>
              <span className="pigment" style={{ background: hex }} />
              <span className="paintlabel">
                <span>
                  {c.name && <small style={{ display: 'block' }}>{c.name}</small>}
                  <code>{hex}</code>
                </span>
                <Icon path="copy" />
              </span>
            </button>
          );
        })}
      </div>
      <p className="palettehint">Click a swatch to copy its HEX value.</p>
    </>
  );
}

function FontCard({ role, family, copy }) {
  const state = useFontAvailability(family);
  return (
    <article className={`fontcard ${role.toLowerCase()}`}>
      <span className="eyebrow gradient">{role} font</span>
      <p className="specimen" style={state === 'available' ? { fontFamily: `"${family}", serif` } : undefined}>{SPECIMEN_TEXT}</p>
      <div className="fontmeta">
        <span>{family}</span>
        <button type="button" className="copy" onClick={() => copy(family)}><Icon path="copy" /> <span>Copy name</span></button>
      </div>
      {state === 'unavailable' && <p className="asset-hint">Font preview unavailable. The specimen uses a fallback font and does not represent {family}.</p>}
    </article>
  );
}

export function FontGrid({ fonts, copy }) {
  return <div className="fontgrid">{fonts.map(([r, f]) => <FontCard key={r} role={r} family={f} copy={copy} />)}</div>;
}

export function StrategyStack({ blocks }) {
  return (
    <div className="strategy-stack">
      {blocks.map(([h, t]) => (
        <div key={h} className="strategy-block"><h3>{h}</h3>{t.split(/\n{2,}/).map((p, i) => <p key={i} style={{ marginBottom: 12 }}>{p}</p>)}</div>
      ))}
    </div>
  );
}

export function Masonry({ assets }) {
  return (
    <div className="masonry">
      {assets.map((a, i) => (
        <figure key={`${a.url}-${i}`} className="asset">
          <a className="image-download" href={a.url} target="_blank" rel="noopener noreferrer" download>
            <img src={a.url} alt={a.label} loading="lazy" />
          </a>
          <figcaption><strong>{a.label}</strong></figcaption>
        </figure>
      ))}
    </div>
  );
}

export function UrlsGrid({ links, copy }) {
  return (
    <div className="urls">
      {links.map(([label, href]) => (
        <article key={`${label}-${href}`} className="urlcard">
          <div>
            <p className="urllabel">{label}</p>
            <a className="urlvalue gradient" href={href} target="_blank" rel="noopener noreferrer">{href}</a>
          </div>
          <button type="button" className="copyurl" onClick={() => copy(href)} aria-label={`Copy ${label} link`}><Icon path="copy" /></button>
        </article>
      ))}
    </div>
  );
}

export function ContactRow({ email, phone, location }) {
  if (!email && !phone && !location) return null;
  return (
    <div className="contact">
      {email && <a className="gradient" href={`mailto:${email}`}>{email}</a>}
      {phone && <a href={`tel:${String(phone).replace(/[^\d+]/g, '')}`}>{phone}</a>}
      {location && <span>{location}</span>}
    </div>
  );
}

export function BookPanel({ book, image }) {
  const href = safeUrl(book.url);
  return (
    <div className="bookpanel">
      {image && <a href={image} target="_blank" rel="noopener noreferrer"><img src={image} alt={book.title} /></a>}
      <div style={image ? undefined : { gridColumn: '1 / -1' }}>
        <span className="eyebrow gradient">PUBLISHED AUTHOR</span>
        <h3>{book.title}</h3>
        {book.description && <p>{book.description}</p>}
        {href && <a className="btn primary" href={href} target="_blank" rel="noopener noreferrer">Explore the book</a>}
        {href && <a className="bookurl gradient" href={href} target="_blank" rel="noopener noreferrer">{href}</a>}
      </div>
    </div>
  );
}

export function Portrait({ image, name, blurb }) {
  return (
    <div className="portrait">
      <img src={image} alt={name} />
      <div className="portraitcopy">
        <span className="eyebrow gradient">THE BRAND REVIVALIST&reg;</span>
        <h2>{name}</h2>
        {blurb && <p>{blurb}</p>}
      </div>
    </div>
  );
}