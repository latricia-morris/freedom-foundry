import { useEffect, useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

/* Chrome brand + fire gradient used by every reference-styled share page. */
export function FireDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <linearGradient id="fire-icon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F15A29" />
          <stop offset="52%" stopColor="#E2462C" />
          <stop offset="100%" stopColor="#CE2530" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const iconPaths = {
  copy: 'M9.9 4.0h8.2a1.9 1.9 0 0 1 1.9 1.9v8.2M4.0 9.9a1.9 1.9 0 0 1 1.9-1.9h8.2a1.9 1.9 0 0 1 1.9 1.9v8.2a1.9 1.9 0 0 1-1.9 1.9H5.9a1.9 1.9 0 0 1-1.9-1.9z',
  download: 'M12 3.5v11m0 0 4.5-4.5M12 14.5 7.5 10M4.5 19.5h15',
  print: 'M7 8.5V4h10v4.5M7 17.5H5a1.5 1.5 0 0 1-1.5-1.5v-5A1.5 1.5 0 0 1 5 9.5h14a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5h-2M7 14h10v6H7z',
};

export function Icon({ path }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={iconPaths[path]} />
    </svg>
  );
}

/* Loads every specimen font the brand may reference. */
const KNOWN_FONTS = ['Cormorant Garamond', 'DM Sans', 'Inter', 'Libre Baskerville', 'Lora', 'Montserrat', 'Playfair Display', 'Poppins', 'Raleway', 'Space Grotesk', 'Urbanist'];

export function usePublicFonts(families) {
  useEffect(() => {
    const loadable = (families || []).filter((f) => f && KNOWN_FONTS.includes(f));
    if (!loadable.length) return undefined;
    const id = 'freedom-foundry-public-fonts';
    if (document.getElementById(id)) return undefined;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${loadable.map((f) => `family=${f.replaceAll(' ', '+')}:wght@400;500;600;700`).join('&')}&display=swap`;
    document.head.appendChild(link);
    return undefined;
  }, [families?.join('|')]);
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function useFontAvailability(family) {
  const [state, setState] = useState(family ? 'loading' : 'none');
  useEffect(() => {
    if (!family) return undefined;
    let active = true;
    setState('loading');
    const fontSet = document.fonts;
    if (!fontSet) {
      if (active) setState('unavailable');
      return undefined;
    }
    (async () => {
      try {
        const spec = `16px "${family}"`;
        let faces = await fontSet.load(spec);
        if (!faces.length) { await wait(400); faces = await fontSet.load(spec); }
        if (!faces.length) { await fontSet.ready; faces = await fontSet.load(spec); }
        if (active) setState(faces.length ? 'available' : 'unavailable');
      } catch {
        if (active) setState('unavailable');
      }
    })();
    return () => { active = false; };
  }, [family]);
  return state;
}

/* Clipboard with the reference's fallback dialog. */
export function useCopy() {
  const [fallbackText, setFallbackText] = useState(null);
  const copy = useCallback(async (text) => {
    try {
      if (!navigator.clipboard) throw new Error();
      await navigator.clipboard.writeText(text);
      toast({ title: 'Details copied.' });
    } catch {
      setFallbackText(text);
    }
  }, []);
  const dialog = fallbackText == null ? null : (
    <div className="copydialog" role="dialog" aria-label="Copy text">
      <div className="dialogheader">
        <span>Select and copy the text below</span>
        <button type="button" className="btn small" onClick={() => setFallbackText(null)}>
          <Icon path="copy" /> Close
        </button>
      </div>
      <textarea className="fallback" readOnly value={fallbackText} onFocus={(e) => e.target.select()} />
    </div>
  );
  return { copy, dialog };
}

/* Highlights the tab of the section currently in view. */
export function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0] || null);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: '-15% 0px -60% 0px' });
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids.join('|')]);
  return active;
}

export function Tabs({ items, active }) {
  return (
    <nav className="tabs" aria-label="Page sections">
      {items.map(([id, label]) => (
        <a key={id} href={`#${id}`} className="tab" aria-current={active === id ? 'true' : undefined}>{label}</a>
      ))}
    </nav>
  );
}