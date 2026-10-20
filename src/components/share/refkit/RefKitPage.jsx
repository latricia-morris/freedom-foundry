import './refkit.css';
import { FireDefs, useCopy, useActiveSection, Tabs, usePublicFonts } from './shared';
import { TopBar, Mast, Section, Palette, FontGrid, StrategyStack, Masonry, UrlsGrid, ContactRow, BookPanel, Portrait } from './pieces';
import { buildModel, paras } from './shareModel';

const TITLES = { corporate: 'Corporate Brand', personal: 'Personal Brand', media_kit: 'Media Kit' };

export default function RefKitPage({ type, profile }) {
  const m = buildModel(type, profile);
  const { copy, dialog } = useCopy();
  usePublicFonts(m.fonts.map(([, f]) => f));
  const corp = type === 'corporate';
  const tabs = corp
    ? [['overview', 'Overview'], ['identity', 'Visual identity'], m.fonts.length && ['typography', 'Typography'], m.strategy.length && ['strategy', 'Strategy & voice'], ['contact', 'Links & contact']]
    : [['overview', 'Introduction'], profile.long_bio && ['biography', type === 'media_kit' ? 'Biography & credentials' : 'Biography'], type === 'personal' && (m.strategy.length || m.fonts.length) && ['expression', 'Brand expression'], m.assets.length && ['assets', type === 'media_kit' ? 'Media assets' : 'Images & assets'], ['contact', type === 'media_kit' ? 'Media contact' : 'Books & contact']];
  const items = tabs.filter(Boolean);
  const active = useActiveSection(items.map(([id]) => id));
  const book = m.books[0];

  return (
    <div className="refkit" style={{ minHeight: '100vh' }}>
      <FireDefs />
      <TopBar label={`Shared ${TITLES[type]}`} />
      <main className="page">
        <Mast title={TITLES[type]} subtitle={corp ? m.brand : m.person || m.brand} onCopyAll={() => copy(m.all)} />
        <Tabs items={items} active={active} />

        {corp ? (
          <Section id="overview" heading={m.brand} copy={copy} copyValue={m.lead}>
            <div className="introgrid">
              <div className="lead">{paras(m.lead).map((t, i) => <p key={i} style={{ margin: '0 0 16px' }}>{t}</p>)}</div>
              {m.logo && <div className="brandlogo"><a href={m.logo} target="_blank" rel="noopener noreferrer"><img src={m.logo} alt={`${m.brand} logo`} /></a></div>}
            </div>
          </Section>
        ) : (
          <Section id="overview" heading="Introduction" copy={copy} copyValue={profile.short_bio} copyLabel="Copy short bio">
            {m.portrait
              ? <Portrait image={m.portrait} name={m.person} blurb={profile.short_bio} />
              : <p className="lead">{profile.short_bio}</p>}
          </Section>
        )}

        {corp && (
          <Section id="identity" heading="Visual identity" sub="Paint-style swatches, exact saved values, and artwork." copy={copy} copyValue={m.colors.map((c) => c.hex.toUpperCase()).join('\n')} copyLabel="Copy all colors">
            {m.colors.length > 0 && <Palette colors={m.colors} copy={copy} />}
            <div className="space" />
            {m.assets.length > 0 && <Masonry assets={m.assets} />}
          </Section>
        )}
        {corp && m.fonts.length > 0 && <Section id="typography" heading="Typography" sub="Font roles and readable specimens." copy={copy} copyValue={m.fonts.map(([r, f]) => `${r}: ${f}`).join('\n')}><FontGrid fonts={m.fonts} copy={copy} /></Section>}
        {corp && m.strategy.length > 0 && <Section id="strategy" heading="Strategy & voice" copy={copy} copyValue={m.strategy.map(([h, t]) => `${h}\n${t}`).join('\n\n')}><StrategyStack blocks={m.strategy} /></Section>}

        {!corp && profile.long_bio && (
          <Section id="biography" heading={type === 'media_kit' ? 'Biography & credentials' : `About ${profile.first_name || m.person}`} copy={copy} copyValue={profile.long_bio} copyLabel="Copy full bio">
            <div className="read">{paras(profile.long_bio).map((t, i) => <p key={i}>{t}</p>)}</div>
          </Section>
        )}
        {type === 'personal' && (m.strategy.length > 0 || m.fonts.length > 0) && (
          <Section id="expression" heading="Brand expression" copy={copy} copyValue={m.strategy.map(([h, t]) => `${h}\n${t}`).join('\n\n')}>
            <StrategyStack blocks={m.strategy.filter(([h]) => ['Positioning', 'Brand voice', 'Tone'].includes(h))} />
            {m.fonts.length > 0 && <><div className="space" /><FontGrid fonts={m.fonts} copy={copy} /></>}
          </Section>
        )}
        {!corp && m.assets.length > 0 && <Section id="assets" heading={type === 'media_kit' ? 'Media assets' : 'Images & assets'} sub="Click any image to open or download it."><Masonry assets={m.assets} /></Section>}

        <Section id="contact" heading={corp ? 'Links & contact' : type === 'media_kit' ? 'Media contact' : 'Books & contact'}>
          {!corp && book && <><BookPanel book={book} /><div className="space" /></>}
          {m.links.length > 0 && <UrlsGrid links={m.links} copy={copy} />}
          <ContactRow email={profile.email} phone={profile.phone} location={m.location} />
        </Section>
        <footer className="footer">Shared via Freedom Foundry</footer>
      </main>
      {dialog}
    </div>
  );
}