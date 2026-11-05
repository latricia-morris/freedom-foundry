// Turns uploaded HTML/XML brand guidelines into sanitized, searchable H1/H2 sections.
const BLOCK = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'table', 'blockquote', 'pre', 'hr', 'figure', 'img', 'dl']);
const KEEP = new Set([...BLOCK, 'li', 'strong', 'b', 'em', 'i', 'u', 'a', 'br', 'span', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'code', 'figcaption', 'sup', 'sub', 'small', 'dt', 'dd', 'mark']);
const DROP = new Set(['script', 'style', 'iframe', 'object', 'embed', 'noscript', 'template', 'head', 'meta', 'link', 'form', 'input', 'button', 'select', 'textarea', 'svg', 'canvas', 'video', 'audio', 'frame', 'frameset', 'base']);
const CONTAINERS = new Set(['div', 'section', 'article', 'header', 'footer', 'main', 'aside', 'nav', 'body', 'html', 'center']);
const XML_MAP = [
  [/^(h1|title|heading_?1|head_?1|chapter_?title)$/i, 'h1'],
  [/^(h2|subtitle|heading_?2|head_?2|section_?title)$/i, 'h2'],
  [/^(h3|heading_?3|head_?3)$/i, 'h3'],
  [/^(p|para|paragraph|body_?text|text)$/i, 'p'],
  [/^(li|item|list_?item)$/i, 'li'],
  [/^(ul|list|bullets)$/i, 'ul'],
];

const norm = (name, xml) => {
  if (!xml) return name.toLowerCase();
  const hit = XML_MAP.find(([re]) => re.test(name));
  return hit ? hit[1] : name.toLowerCase();
};

function copyAttrs(src, el, tag) {
  if (tag === 'a') {
    const href = (src.getAttribute('href') || '').trim();
    if (/^(https?:|mailto:|#)/i.test(href)) {
      el.setAttribute('href', href);
      if (!href.startsWith('#')) { el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener noreferrer'); }
    }
  }
  if (tag === 'img') {
    const s = (src.getAttribute('src') || '').trim();
    if (!/^(https:|data:image\/(png|jpe?g|gif|webp);)/i.test(s)) return false;
    el.setAttribute('src', s);
    el.setAttribute('alt', src.getAttribute('alt') || '');
    el.setAttribute('loading', 'lazy');
  }
  if (tag === 'td' || tag === 'th') {
    ['colspan', 'rowspan'].forEach((a) => { if (src.getAttribute(a)) el.setAttribute(a, String(parseInt(src.getAttribute(a), 10) || 1)); });
  }
  return true;
}

function clean(node, out, xml) {
  const frag = out.createDocumentFragment();
  for (const ch of Array.from(node.childNodes)) {
    if (ch.nodeType === 3 || ch.nodeType === 4) { frag.appendChild(out.createTextNode(ch.textContent)); continue; }
    if (ch.nodeType !== 1) continue;
    const tag = norm(ch.localName, xml);
    if (DROP.has(tag)) continue;
    const kids = clean(ch, out, xml);
    if (!KEEP.has(tag)) {
      if (xml && ch.children.length === 0 && ch.textContent.trim()) {
        const p = out.createElement('p'); p.appendChild(kids); frag.appendChild(p);
      } else if (xml || CONTAINERS.has(tag)) {
        frag.appendChild(out.createComment('b')); frag.appendChild(kids); frag.appendChild(out.createComment('b'));
      } else frag.appendChild(kids);
      continue;
    }
    const el = out.createElement(tag);
    if (!copyAttrs(ch, el, tag)) continue;
    el.appendChild(kids);
    frag.appendChild(el);
  }
  return frag;
}

function toBlocks(frag, out) {
  const blocks = [];
  let loose = null;
  for (const n of Array.from(frag.childNodes)) {
    if (n.nodeType === 8) { loose = null; continue; }
    if (n.nodeType === 1 && BLOCK.has(n.localName)) { loose = null; blocks.push(n); continue; }
    if (n.nodeType === 3 && !n.textContent.trim() && !loose) continue;
    const wrap = n.nodeType === 1 && n.localName === 'li' ? 'ul' : 'p';
    if (!loose || loose.localName !== wrap) { loose = out.createElement(wrap); blocks.push(loose); }
    loose.appendChild(n);
  }
  return blocks;
}

export function parseGuidelines(text, format) {
  const xml = format === 'xml';
  const src = new DOMParser().parseFromString(text, xml ? 'application/xml' : 'text/html');
  if (xml && src.querySelector('parsererror')) throw new Error('This XML file could not be read. Check that it is well-formed.');
  const out = document.implementation.createHTMLDocument('');
  const blocks = toBlocks(clean(xml ? src.documentElement : src.body, out, xml), out);

  const sections = [];
  let cur = null;
  let sub = null;
  blocks.forEach((b) => {
    const text = b.textContent.replace(/\s+/g, ' ').trim();
    if (b.localName === 'h1') { cur = { id: `s${sections.length}`, title: text || 'Untitled', blocks: [], subs: [] }; sections.push(cur); sub = null; return; }
    if (!cur) { cur = { id: 's0', title: 'Overview', blocks: [], subs: [] }; sections.push(cur); }
    if (b.localName === 'h2') { sub = { id: `${cur.id}-${cur.subs.length}`, title: text || 'Untitled', blocks: [] }; cur.subs.push(sub); return; }
    if (!text && b.localName !== 'img' && b.localName !== 'hr' && !b.querySelector('img')) return;
    (sub || cur).blocks.push({ html: b.outerHTML, text });
  });
  if (!sections.length) throw new Error('No readable content was found in this file.');
  return sections;
}

export function safeParse(text, format) {
  try {
    return { sections: parseGuidelines(text, format) };
  } catch (e) {
    return { error: e.message };
  }
}

const snippet = (t, q) => {
  const i = t.toLowerCase().indexOf(q);
  const a = Math.max(0, i - 50);
  const b = i + q.length + 80;
  return `${a ? '…' : ''}${t.slice(a, b)}${b < t.length ? '…' : ''}`;
};

export function searchGuidelines(sections, query) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const results = [];
  const scan = (id, path, title, blocks) => {
    if (title.toLowerCase().includes(q)) { results.push({ id, path, snippet: title }); return; }
    const hit = blocks.find((x) => x.text.toLowerCase().includes(q));
    if (hit) results.push({ id, path, snippet: snippet(hit.text, q) });
  };
  sections.forEach((s) => {
    scan(s.id, s.title, s.title, s.blocks);
    s.subs.forEach((u) => scan(u.id, `${s.title} › ${u.title}`, u.title, u.blocks));
  });
  return results.slice(0, 40);
}