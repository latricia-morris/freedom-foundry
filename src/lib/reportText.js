// Imported audits arrive as text extracted from a PDF: markdown markers for
// emphasis, headings, bullet lists, and fixed-width tables drawn with dashes.
// These helpers turn that text into blocks a report component can lay out
// properly, so nothing reaches the page as a wall of raw markup.

const BULLET_RE = /^\s{0,2}[-*\u2022]\s+(.*)$/;
const ORDERED_RE = /^\s{0,2}(\d{1,2})[.)]\s+(.*)$/;
const HEADING_RE = /^\s{0,3}(#{1,6})\s*(.*\S)\s*$/;

/** Runs of dashes/equals on a line, or null when the line is not a rule. */
function ruleRuns(line) {
  if (!line || !/^[ \t]*[-=_][-=_ \t]*$/.test(line)) return null;
  const runs = [];
  const re = /[-=_]{3,}/g;
  let m;
  while ((m = re.exec(line))) runs.push({ start: m.index, end: m.index + m[0].length });
  const total = runs.reduce((n, r) => n + (r.end - r.start), 0);
  if (!runs.length || total < 3) return null;
  return runs;
}

/** Starts of interior runs of two or more spaces (column gaps). */
function gapStarts(line) {
  const out = [];
  const re = / {2,}/g;
  let m;
  while ((m = re.exec(line))) if (m.index > 0) out.push(m.index);
  return out;
}

/** PDF extraction turns en/em dashes into double and triple hyphens. */
function dashFix(text) {
  return String(text || '')
    .replace(/(\d)\s*-{2,4}\s*(\d)/g, '$1\u2013$2')
    .replace(/(?:\s*-\s*){3,}/g, ' \u2014 ')
    .replace(/(\S)-{3,}(\S)/g, '$1\u2014$2')
    .replace(/(\S)-{2,3}(\S)/g, '$1\u2013$2')
    .replace(/ +-{3,} +/g, ' \u2014 ')
    .replace(/ +-{2} +/g, ' \u2013 ')
    .replace(/\u2014(\s*\u2014)+/g, '\u2014')
    .replace(/\u2013(\s*\u2013)+/g, '\u2013');
}

function sliceCells(line, bounds) {
  const first = /^\s/.test(line) ? bounds[0] : 0;
  const cells = [line.slice(first, bounds[1] ?? line.length).trim()];
  for (let c = 1; c < bounds.length; c++) {
    const to = c + 1 < bounds.length ? bounds[c + 1] : line.length;
    cells.push(line.slice(bounds[c], to).trim());
  }
  const cleaned = cells.map((c) => dashFix(c.replace(/^#{1,6}\s*/, '').replace(/\s+/g, ' ')));
  while (cleaned.length > 1 && !cleaned[cleaned.length - 1]) cleaned.pop();
  return cleaned;
}

function mergeHeaderCells(headerLines, bounds) {
  const cells = [];
  headerLines.forEach((line) => {
    sliceCells(line, bounds).forEach((cell, i) => {
      if (cell && !cells[i]) cells[i] = cell;
    });
  });
  return cells;
}

/**
 * Rows of a fixed-width table. Blank lines separate rows when the source used
 * them; without them every line with content in the first column is a row.
 * Wrapped cells continue the row above, and prose ends the table.
 */
function readTableRows(lines, start, bounds) {
  // The table runs until a rule, a heading, or a line of prose.
  let end = start;
  while (end < lines.length) {
    const line = lines[end];
    if (ruleRuns(line) || HEADING_RE.test(line) || BULLET_RE.test(line)) break;
    if (line.trim() && !/^\s/.test(line) && gapStarts(line).length === 0) break;
    end++;
  }
  const spaced = (() => {
    let last = start;
    for (let k = start; k < end; k++) if (lines[k].trim()) last = k;
    return lines.slice(start, last + 1).some((l) => !l.trim());
  })();

  const rows = [];
  let cur = null;
  let blanks = 0;
  let i = start;
  for (; i < end; i++) {
    const line = lines[i];
    if (!line.trim()) { blanks++; continue; }
    if (HEADING_RE.test(line) || BULLET_RE.test(line)) break;
    if (!/^\s/.test(line) && gapStarts(line).length === 0) break;

    const cells = sliceCells(line, bounds);
    if (cells[0] && (!spaced || blanks > 0)) {
      cur = cells;
      rows.push(cur);
    } else if (cur) {
      cells.forEach((cell, ci) => {
        if (!cell) return;
        cur[ci] = cur[ci] ? `${cur[ci]} ${cell}` : cell;
      });
    } else {
      cur = cells;
      rows.push(cur);
    }
    blanks = 0;
  }

  const atRule = end < lines.length && !!ruleRuns(lines[end]);
  const next = i < end ? i : atRule ? end + 1 : end;
  return { rows, next };
}

/** Table whose column widths are drawn by a dashed rule beneath the header. */
function tableFromRules(lines, i) {
  let idx = i;
  const top = ruleRuns(lines[idx]);
  if (top && top.length === 1) idx++;

  const headerLines = [];
  while (idx < lines.length && headerLines.length < 2) {
    const line = lines[idx];
    if (!line.trim() || ruleRuns(line)) break;
    headerLines.push(line);
    idx++;
  }
  if (!headerLines.length) return null;

  const sep = idx < lines.length ? ruleRuns(lines[idx]) : null;
  if (!sep || sep.length < 2) return null;

  const bounds = sep.map((r) => r.start);
  const header = mergeHeaderCells(headerLines, bounds);
  const { rows, next } = readTableRows(lines, idx + 1, bounds);
  if (!rows.length) return null;
  return { block: { type: 'table', header, rows }, next };
}

/** A markdown pipe table: header row, dash separator, then one row per line. */
function isPipeSeparator(line) {
  if (!line || !line.includes('|')) return false;
  if (!/^[\s|:-]+$/.test(line)) return false;
  return (line.match(/-/g) || []).length >= 3;
}

function splitPipeRow(line) {
  let t = line.trim();
  if (t.startsWith('|')) t = t.slice(1);
  if (t.endsWith('|')) t = t.slice(0, -1);
  return t.split('|').map((c) => dashFix(c.replace(/^#{1,6}\s*/, '').replace(/\s+/g, ' ').trim()));
}

function tableFromPipes(lines, i) {
  if (!/^\s*\|/.test(lines[i])) return null;
  const sep = lines[i + 1];
  if (!sep || !isPipeSeparator(sep)) return null;

  const header = splitPipeRow(lines[i]);
  if (header.length < 2) return null;

  const rows = [];
  let k = i + 2;
  for (; k < lines.length; k++) {
    if (!/^\s*\|/.test(lines[k])) break;
    const cells = splitPipeRow(lines[k]);
    if (!cells.some(Boolean)) continue;
    const row = cells.slice(0, header.length);
    while (row.length < header.length) row.push('');
    rows.push(row);
  }
  if (!rows.length) return null;
  return { block: { type: 'table', header, rows }, next: k };
}

function readQuote(lines, start) {
  const parts = [];
  let i = start;
  while (i < lines.length && /^\s*>/.test(lines[i])) {
    const text = lines[i].replace(/^\s*>\s?/, '').trim();
    if (text) parts.push(text);
    i++;
  }
  return {
    block: { type: 'quote', text: dashFix(parts.join(' ').replace(/\s+/g, ' ')) },
    next: i,
  };
}

function looksLikeTableStart(lines, i) {
  for (let k = 1; k <= 2; k++) {
    const runs = lines[i + k] ? ruleRuns(lines[i + k]) : null;
    if (runs && runs.length >= 2) return true;
  }
  return false;
}

function readList(lines, start, ordered, blocks) {
  const marker = ordered ? ORDERED_RE : BULLET_RE;
  const items = [];
  let i = start;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      const next = lines[i + 1] || '';
      if (marker.test(next) || /^\s{2,}\S/.test(next)) { i++; continue; }
      break;
    }
    const m = line.match(marker);
    if (m) {
      items.push(m[m.length - 1]);
      i++;
      continue;
    }
    if (/^\s{2,}\S/.test(line) && items.length) {
      items[items.length - 1] = `${items[items.length - 1]} ${line.trim()}`;
      i++;
      continue;
    }
    break;
  }
  blocks.push({
    type: 'list',
    ordered,
    items: items.map((t) => dashFix(t.replace(/\s+/g, ' ').trim())).filter(Boolean),
  });
  return i;
}

function readParagraph(lines, start, blocks) {
  const segments = [];
  let cur = '';
  let i = start;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) break;
    if (ruleRuns(line) || HEADING_RE.test(line) || BULLET_RE.test(line) || ORDERED_RE.test(line)) break;
    if (/^\s*[|>]/.test(line)) break;
    if (looksLikeTableStart(lines, i)) break;

    const hard = /\\\s*$/.test(line);
    const clean = dashFix(
      line
        .replace(/\\\s*$/, '')
        .replace(/^#{1,6}\s*/, '')
        .replace(/\s#{1,6}\s+/g, ' ')
        .trim()
        .replace(/\s+/g, ' ')
    );
    if (clean) cur = cur ? `${cur} ${clean}` : clean;
    if (hard) { segments.push(cur); cur = ''; }
    i++;
  }
  if (cur) segments.push(cur);
  const text = segments.filter(Boolean).join('\n');
  if (text) blocks.push({ type: 'paragraph', text });
  return i > start ? i : start + 1;
}

export function parseReportBlocks(raw) {
  const lines = String(raw || '')
    .replace(/\r\n?/g, '\n')
    .replace(/\u00a0/g, ' ')
    .split('\n')
    .map((l) => l.replace(/\t/g, '    ').replace(/[ ]+$/, ''));

  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    const heading = line.match(HEADING_RE);
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length, text: dashFix(heading[2]) });
      i++;
      continue;
    }

    if (BULLET_RE.test(line)) { i = readList(lines, i, false, blocks); continue; }
    if (ORDERED_RE.test(line)) { i = readList(lines, i, true, blocks); continue; }

    const pipeTable = tableFromPipes(lines, i);
    if (pipeTable) { blocks.push(pipeTable.block); i = pipeTable.next; continue; }

    const table = tableFromRules(lines, i);
    if (table) { blocks.push(table.block); i = table.next; continue; }

    if (ruleRuns(line)) { blocks.push({ type: 'divider' }); i++; continue; }

    if (/^\s*>/.test(line)) {
      const quote = readQuote(lines, i);
      blocks.push(quote.block);
      i = quote.next;
      continue;
    }

    i = readParagraph(lines, i, blocks);
  }

  while (blocks.length && blocks[0].type === 'divider') blocks.shift();
  while (blocks.length && blocks[blocks.length - 1].type === 'divider') blocks.pop();
  return blocks;
}

/** Removes emphasis markers, code ticks, and stray escapes. */
export function stripInline(text) {
  return String(text || '')
    .replace(/\*\*|__|`|\*/g, '')
    .replace(/\\(?=\s|$)/g, '')
    .trim();
}

/**
 * A single line of report copy with every marker removed: no heading hashes,
 * no emphasis asterisks, no hyphen artifacts. Used wherever stored report text
 * reaches the page as a sentence.
 */
export function cleanLine(text) {
  return dashFix(stripInline(String(text || '')))
    .replace(/^#{1,6}\s*/, '')
    .replace(/\s#{1,6}\s+/g, ' ')
    .replace(/^[\s\u2022\-*]+/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Cover pages arrive as their own block of title, client, and date lines. None
// of it is report content, so it never renders.
const COVER_LABEL_RE =
  /^(prepared\s+(for|by)|report\s+date|date\s+of\s+report|assessment\s+date|published|version|confidential|table\s+of\s+contents|contents|page\s+\d+(\s+of\s+\d+)?|client|brand|company|website)\s*[:\u2014-]/i;
const COVER_TITLE_RE =
  /^(brand\s+health\s+(index|report)|visibility\s*(&|and)\s*credibility(\s+report)?|ai\s+visibility(\s+(audit|report))?|digital\s+brand\s+health|discoverability\s*(&|and)\s*conversion|marketing\s+matrix|cover(\s+page)?)\b/i;

function isCoverLine(line) {
  const t = cleanLine(line);
  if (!t) return true;
  if (COVER_LABEL_RE.test(t)) return true;
  if (COVER_TITLE_RE.test(t)) return true;
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(t)) return true;
  return false;
}

/** Drops a leading cover block (title, prepared-for, date, contents) from raw report text. */
export function stripCoverText(raw) {
  const lines = String(raw || '')
    .replace(/\r\n?/g, '\n')
    .split('\n');
  let i = 0;
  while (i < lines.length && (!lines[i].trim() || isCoverLine(lines[i]))) i++;
  if (i >= lines.length) return '';
  return lines.slice(i).join('\n');
}

/**
 * True when a stored audit section is cover material rather than a finding:
 * a title-page block with no actual prose behind it.
 */
export function isCoverSection(section) {
  if (section?.table?.rows?.length) return false;
  const title = stripSectionNumber(section?.title || '');
  const body = plainReportText(section?.body || '');
  if (body.length > 320) return false;
  const hasProse = body.split(/(?<=[.!?])\s+/).some((s) => s.split(/\s+/).length >= 12);
  if (hasProse) return false;
  if (COVER_TITLE_RE.test(title)) return true;
  const lines = String(section?.body || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return /^(cover|title\s*page|contents)$/i.test(title);
  return lines.length <= 8 && lines.every(isCoverLine);
}

/** One clean sentence-run of a report, for summaries and previews. */
export function plainReportText(raw) {
  const parts = [];
  parseReportBlocks(raw).forEach((b) => {
    if (b.type === 'heading') parts.push(b.text);
    else if (b.type === 'paragraph') parts.push(b.text.replace(/\n/g, ' '));
    else if (b.type === 'list') parts.push(b.items.join(' '));
    else if (b.type === 'quote') parts.push(b.text);
  });
  return dashFix(stripInline(parts.join(' '))).replace(/\s+/g, ' ').trim();
}

/** Section titles carry the source document's own numbering and split notes. */
export function stripSectionNumber(title) {
  return stripInline(title)
    .replace(/\s*\(continued(?:\s+\d+)?\)\s*$/i, '')
    .replace(/^\s*(?:\d{1,2}|[IVX]{1,4})\s*[.)·•]\s+/, '')
    .replace(/^\s*(?:\d{1,2}|[IVX]{1,4})\s*[:—-]\s+/, '')
    .trim();
}

/** True when a section title is the source's "continued" part of the one above. */
export function isContinuationTitle(title) {
  return /\(continued(?:\s+\d+)?\)\s*$/i.test(String(title || ''));
}