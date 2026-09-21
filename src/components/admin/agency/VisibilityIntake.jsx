import React, { useState } from 'react';
import { ArrowLeft, FileUp, Loader2, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import {
  VISIBILITY_CATEGORIES,
  competitorsToText,
  parseCompetitors,
  parseLines,
  parseSocialChannels,
  sumScores,
  toLineText,
} from '@/lib/visibility';

const SNAPSHOT_FIELDS = [
  ['email_platform', 'Email platform'],
  ['email_frequency', 'Email frequency'],
  ['marketing_blasts', 'Marketing blasts'],
  ['drip_campaigns', 'Drip campaigns'],
  ['funnel_assets', 'Key funnel assets'],
  ['events_launches', 'Events & launches'],
];

/**
 * Admin intake: paste or upload a raw AI audit, extract a structured six-category
 * draft, review and edit every field, then save as a human-reviewed snapshot.
 */
export default function VisibilityIntake({ client, onSaved, onCancel }) {
  const { toast } = useToast();
  const [step, setStep] = useState('input');
  const [rawText, setRawText] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [sourceModel, setSourceModel] = useState('Model Source 1');
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [accessTier, setAccessTier] = useState(client.status === 'active' ? 'client' : 'prospect');

  const [composite, setComposite] = useState('');
  const [scores, setScores] = useState({});
  const [findingsText, setFindingsText] = useState('');
  const [fixesText, setFixesText] = useState('');
  const [competitorsText, setCompetitorsText] = useState('');
  const [analystNotes, setAnalystNotes] = useState('');
  const [socialText, setSocialText] = useState('');
  const [snap, setSnap] = useState(Object.fromEntries(SNAPSHOT_FIELDS.map(([key]) => [key, ''])));
  const [allocation, setAllocation] = useState([]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadPublicFile({ file });
      setFileUrl(res.file_url);
      setFileName(file.name);
      toast({ title: 'File uploaded', description: file.name });
    } catch (err) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const extract = async () => {
    if (!rawText.trim() && !fileUrl) {
      toast({ title: 'Nothing to extract', description: 'Paste audit text or upload a report file first.', variant: 'destructive' });
      return;
    }
    setExtracting(true);
    try {
      const res = await base44.functions.invoke('visibility-extract', {
        raw_text: rawText,
        file_url: fileUrl,
      });
      const draft = res.data?.draft;
      if (!draft) throw new Error(res.data?.error || 'Extraction returned nothing.');
      setScores(Object.fromEntries(VISIBILITY_CATEGORIES.map((c) => [c.key, draft.category_scores?.[c.key] ?? ''])));
      setComposite(
        typeof draft.composite_score === 'number'
          ? draft.composite_score
          : sumScores(draft.category_scores) ?? ''
      );
      setFindingsText(toLineText(draft.key_findings));
      setFixesText(toLineText(draft.recommended_fixes));
      setCompetitorsText(competitorsToText(draft.competitors_mentioned));
      const draftSnap = draft.business_snapshot || {};
      setSnap(Object.fromEntries(SNAPSHOT_FIELDS.map(([key]) => [key, draftSnap[key] || ''])));
      setAllocation(
        (draft.marketing_allocation || []).map((a) => ({ area: a.area || '', percent: a.percent ?? '', rationale: a.rationale || '' }))
      );
      if (draft.report_date_mentioned) {
        const parsed = new Date(draft.report_date_mentioned);
        if (!Number.isNaN(parsed.getTime())) setReportDate(parsed.toISOString().slice(0, 10));
      }
      setStep('review');
    } catch (err) {
      toast({ title: 'Extraction failed', description: err.message, variant: 'destructive' });
    } finally {
      setExtracting(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const existing = await base44.entities.VisibilityReport.filter({ agency_client_id: client.id }, '-report_date', 1);
      await base44.entities.VisibilityReport.create({
        agency_client_id: client.id,
        report_date: reportDate || null,
        is_baseline: !(existing && existing.length),
        access_tier: accessTier,
        composite_score: composite === '' ? null : Number(composite),
        category_scores: Object.fromEntries(
          VISIBILITY_CATEGORIES.map((c) => [
            c.key,
            scores[c.key] === '' || scores[c.key] == null ? null : Number(scores[c.key]),
          ])
        ),
        key_findings: parseLines(findingsText),
        recommended_fixes: parseLines(fixesText),
        competitor_map: parseCompetitors(competitorsText),
        analyst_notes: analystNotes || null,
        social_channels: parseSocialChannels(socialText),
        business_snapshot: Object.fromEntries(Object.entries(snap).map(([key, value]) => [key, value || null])),
        marketing_allocation: allocation
          .filter((a) => a.area.trim())
          .map((a) => ({
            area: a.area.trim(),
            percent: a.percent === '' || a.percent == null ? null : Number(a.percent),
            rationale: a.rationale.trim() || null,
          })),
        raw_input_text: rawText || (fileUrl ? `[Uploaded report file: ${fileName}] ${fileUrl}` : ''),
        input_method: fileUrl ? 'upload' : 'paste',
        source_model: sourceModel,
        verification_status: 'human_reviewed',
      });
      toast({ title: 'Report saved', description: `${client.company_name} visibility snapshot published.` });
      onSaved();
    } catch (err) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const missing = VISIBILITY_CATEGORIES.filter((c) => scores[c.key] === '' || scores[c.key] == null);

  return (
    <div className="dashboard-card mb-6 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl text-foreground">New report — {client.company_name}</h2>
          <p className="text-xs text-muted-foreground">
            {step === 'input' ? 'Step 1 of 2 · Source intake' : 'Step 2 of 2 · Review and publish'}
          </p>
        </div>
        <button
          type="button"
          onClick={step === 'review' ? () => setStep('input') : onCancel}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {step === 'review' ? 'Back to source' : 'Cancel'}
        </button>
      </div>

      {step === 'input' ? (
        <div className="space-y-4">
          <textarea
            className="admin-input min-h-40"
            placeholder="Paste the raw audit output here. The extraction keeps whatever it cannot clearly score as blank instead of guessing."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Report file (PDF / TXT / MD)</label>
              <div className="flex items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
                  {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileUp className="h-3.5 w-3.5" />}
                  {fileName || 'Upload file'}
                  <input type="file" accept=".pdf,.txt,.md" className="hidden" onChange={handleFile} disabled={uploading} />
                </label>
                {fileUrl && <span className="text-xs text-emerald-400">Uploaded</span>}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Source label (internal only)</label>
              <input className="admin-input" value={sourceModel} onChange={(e) => setSourceModel(e.target.value)} placeholder="e.g. Model Source 1" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Report date</label>
              <input type="date" className="admin-input" value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Access tier</label>
              <select className="admin-input" value={accessTier} onChange={(e) => setAccessTier(e.target.value)}>
                <option value="prospect">Prospect (scores and findings only)</option>
                <option value="client">Client (full report)</option>
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={extract}
            disabled={extracting || uploading || (!rawText.trim() && !fileUrl)}
            className="btn-forge inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-xs font-semibold uppercase tracking-widest disabled:opacity-50"
          >
            {extracting ? <><Loader2 className="h-4 w-4 animate-spin" /> Extracting draft…</> : <><Sparkles className="h-4 w-4" /> Extract draft</>}
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Composite score (0-100)</label>
              <input type="number" min="0" max="100" className="admin-input" value={composite} onChange={(e) => setComposite(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Report date</label>
              <input type="date" className="admin-input" value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Access tier</label>
              <select className="admin-input" value={accessTier} onChange={(e) => setAccessTier(e.target.value)}>
                <option value="prospect">Prospect</option>
                <option value="client">Client</option>
              </select>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Category scores — blank stays unscored</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {VISIBILITY_CATEGORIES.map((c) => (
                <div key={c.key}>
                  <label className="mb-1 block text-xs text-muted-foreground">{c.label} <span className="text-muted-foreground/60">(max {c.max})</span></label>
                  <input
                    type="number"
                    min="0"
                    max={c.max}
                    className="admin-input"
                    value={scores[c.key] ?? ''}
                    onChange={(e) => setScores((prev) => ({ ...prev, [c.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            {missing.length > 0 && (
              <p className="mt-2 text-xs text-amber-400">
                Not clearly stated in the source: {missing.map((c) => c.label).join(', ')}. Fill in manually or leave unscored.
              </p>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Key findings (one per line, always visible)</label>
              <textarea className="admin-input min-h-32" value={findingsText} onChange={(e) => setFindingsText(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Recommended fixes (one per line, gated)</label>
              <textarea className="admin-input min-h-32" value={fixesText} onChange={(e) => setFixesText(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Competitors — one per line: Name — positioning (gated)</label>
              <textarea className="admin-input min-h-24" value={competitorsText} onChange={(e) => setCompetitorsText(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Analyst notes (gated)</label>
              <textarea className="admin-input min-h-24" value={analystNotes} onChange={(e) => setAnalystNotes(e.target.value)} />
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Business snapshot — AI-drafted, review and edit</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SNAPSHOT_FIELDS.map(([key, label]) => (
                <div key={key}>
                  <label className="mb-1 block text-xs text-muted-foreground">{label}</label>
                  <input
                    className="admin-input"
                    value={snap[key]}
                    onChange={(e) => setSnap((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder="Leave blank if unknown"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Suggested marketing emphasis — AI-drafted, review and edit</p>
              <button
                type="button"
                onClick={() => setAllocation((prev) => [...prev, { area: '', percent: '', rationale: '' }])}
                className="text-[10px] uppercase tracking-widest text-primary transition-opacity hover:opacity-80"
              >
                + Add item
              </button>
            </div>
            <div className="space-y-2">
              {allocation.map((a, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-[1.2fr_80px_2fr_auto]">
                  <input className="admin-input" value={a.area} onChange={(e) => setAllocation((prev) => prev.map((it, idx) => (idx === i ? { ...it, area: e.target.value } : it)))} placeholder="Channel / function" />
                  <input type="number" min="0" max="100" className="admin-input" value={a.percent} onChange={(e) => setAllocation((prev) => prev.map((it, idx) => (idx === i ? { ...it, percent: e.target.value } : it)))} placeholder="%" />
                  <input className="admin-input" value={a.rationale} onChange={(e) => setAllocation((prev) => prev.map((it, idx) => (idx === i ? { ...it, rationale: e.target.value } : it)))} placeholder="Rationale tied to the scores" />
                  <button
                    type="button"
                    onClick={() => setAllocation((prev) => prev.filter((_, idx) => idx !== i))}
                    className="px-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    ×
                  </button>
                </div>
              ))}
              {!allocation.length && (
                <p className="text-xs text-muted-foreground/70">No allocation drafted. Add items manually or re-extract.</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">
              Social channels — one per line: Platform — handle — URL — followers — notes
            </label>
            <textarea
              className="admin-input min-h-28"
              value={socialText}
              onChange={(e) => setSocialText(e.target.value)}
              placeholder="e.g. Instagram — @the.brand.revivalist — https://www.instagram.com/the.brand.revivalist/ — 724 followers, 766 posts — Bio: Brand Architect & Artisan"
            />
          </div>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="btn-forge inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-xs font-semibold uppercase tracking-widest disabled:opacity-50"
          >
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Publishing…</> : 'Publish human-reviewed report'}
          </button>
        </div>
      )}
    </div>
  );
}