import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/** Full imported keyword research library: search, filter, and mark keywords
 *  as public target keywords or internal themes. */
export default function KeywordLibrary({ targetKeywords = [], internalThemes = [], onAddTarget, onAddTheme }) {
  const [rows, setRows] = useState(null);
  const [term, setTerm] = useState('');
  const [website, setWebsite] = useState('');
  const [intent, setIntent] = useState('');
  const [difficulty, setDifficulty] = useState('');

  useEffect(() => {
    let active = true;
    base44.entities.SeoKeyword.list('-volume', 500)
      .then((data) => { if (active) setRows(data || []); })
      .catch(() => { if (active) setRows([]); });
    return () => { active = false; };
  }, []);

  const websites = useMemo(
    () => [...new Set((rows || []).map((r) => r.website).filter(Boolean))].sort(),
    [rows],
  );
  const intents = useMemo(
    () => [...new Set((rows || []).map((r) => r.search_intent).filter(Boolean))].sort(),
    [rows],
  );
  const difficulties = useMemo(
    () => [...new Set((rows || []).map((r) => r.difficulty).filter(Boolean))].sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    if (!rows) return [];
    const needle = term.trim().toLowerCase();
    return rows.filter((row) => {
      if (needle && !(row.keyword || '').toLowerCase().includes(needle) && !(row.topic || '').toLowerCase().includes(needle)) return false;
      if (website && row.website !== website) return false;
      if (intent && row.search_intent !== intent) return false;
      if (difficulty && row.difficulty !== difficulty) return false;
      return true;
    });
  }, [rows, term, website, intent, difficulty]);

  return (
    <div className="dashboard-card space-y-4 p-6">
      <div>
        <h3 className="font-heading text-2xl text-foreground">Keyword library</h3>
        <p className="text-xs text-muted-foreground/70">
          The full research reports. Mark a keyword as a public target or keep it as an internal theme.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-48 flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search keywords or topics…"
            className="admin-input py-1.5 pl-8 text-sm"
          />
        </div>
        <select value={website} onChange={(e) => setWebsite(e.target.value)} className="admin-input w-auto py-1.5 text-xs" aria-label="Filter by site">
          <option value="">All sites</option>
          {websites.map((w) => <option key={w} value={w}>{w}</option>)}
        </select>
        <select value={intent} onChange={(e) => setIntent(e.target.value)} className="admin-input w-auto py-1.5 text-xs" aria-label="Filter by intent">
          <option value="">All intents</option>
          {intents.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="admin-input w-auto py-1.5 text-xs" aria-label="Filter by difficulty">
          <option value="">All difficulty</option>
          {difficulties.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {rows === null ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-4 text-center text-xs text-muted-foreground/70">
          {rows.length === 0 ? 'No keyword research imported yet.' : 'No keywords match those filters.'}
        </p>
      ) : (
        <div className="max-h-80 divide-y divide-border/50 overflow-y-auto">
          {filtered.map((row) => {
            const isTarget = targetKeywords.includes(row.keyword);
            const isTheme = internalThemes.includes(row.keyword);
            return (
              <div key={row.id} className="flex flex-wrap items-center gap-3 py-2">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-foreground">{row.keyword}</span>
                  <span className="block text-[11px] text-muted-foreground/70">
                    {[row.topic, row.search_intent].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{row.volume || 0}/mo</span>
                  <span className="rounded-sm border border-border px-1.5 py-0.5 uppercase tracking-wider">{row.difficulty || '—'}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onAddTarget(row.keyword)}
                    disabled={isTarget}
                    className={`rounded-sm px-2.5 py-1 text-[10px] uppercase tracking-widest transition-colors ${
                      isTarget ? 'btn-forge font-semibold' : 'border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    } disabled:cursor-default`}
                  >
                    {isTarget ? 'Targeted' : 'Target'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddTheme(row.keyword)}
                    disabled={isTheme}
                    className="rounded-sm border border-border px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:cursor-default disabled:opacity-50"
                  >
                    {isTheme ? 'Themed' : 'Theme'}
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}