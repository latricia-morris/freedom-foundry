import React, { useEffect, useState } from 'react';
import { ChevronDown, Loader2, Pencil, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import EditableList from './EditableList';
import { VISIBILITY_CATEGORIES } from '@/lib/visibility';

const toNumber = (value, max) => {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(max, n));
};

/**
 * Field-level editor for one visibility snapshot: the composite, each category
 * score, the key findings, and the priority recommendations. Every change is
 * written back to the report record, so the scorecard, the client portal, and
 * presentation mode all read the corrected data.
 */
export default function ReportFieldEditor({ report, onSaved, collapsible = true }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(!collapsible);
  const [composite, setComposite] = useState('');
  const [cats, setCats] = useState({});
  const [findings, setFindings] = useState([]);
  const [fixes, setFixes] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!report) return;
    setComposite(typeof report.composite_score === 'number' ? String(report.composite_score) : '');
    setCats(
      Object.fromEntries(
        VISIBILITY_CATEGORIES.map((c) => {
          const v = report.category_scores?.[c.key];
          return [c.key, typeof v === 'number' ? String(v) : ''];
        })
      )
    );
    setFindings([...(report.key_findings || [])]);
    setFixes([...(report.recommended_fixes || [])]);
  }, [report]);

  if (!report) return null;

  const save = async () => {
    setSaving(true);
    try {
      const updated = await base44.entities.VisibilityReport.update(report.id, {
        composite_score: toNumber(composite, 100),
        category_scores: Object.fromEntries(
          VISIBILITY_CATEGORIES.map((c) => [c.key, toNumber(cats[c.key], c.max)])
        ),
        key_findings: findings.map((f) => f.trim()).filter(Boolean),
        recommended_fixes: fixes.map((f) => f.trim()).filter(Boolean),
      });
      onSaved?.(updated);
      toast({ title: 'Report fields saved', description: 'The index and the client portal now read these values.' });
    } catch (err) {
      toast({ title: 'Could not save the fields', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-heading text-xl text-foreground">Edit report fields</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {report.source_model || 'Unlabeled source'} · {report.report_date || 'undated'} — scores, findings, and recommendations write straight to this snapshot.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {open && (
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="btn-forge inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save fields
            </button>
          )}
          {collapsible && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            >
              <Pencil className="h-4 w-4" /> {open ? 'Close' : 'Edit'}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="mt-5 space-y-6">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
              Composite score (0–100)
            </label>
            <input
              className="admin-input mt-2 max-w-[10rem]"
              inputMode="numeric"
              value={composite}
              placeholder="—"
              onChange={(e) => setComposite(e.target.value)}
            />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
              Category scores (0–20, blank means the source did not score it)
            </p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {VISIBILITY_CATEGORIES.map((c) => (
                <div key={c.key} className="flex items-center gap-3">
                  <span className="flex-1 text-sm text-foreground">{c.label}</span>
                  <input
                    className="admin-input w-20 text-center"
                    inputMode="numeric"
                    value={cats[c.key] ?? ''}
                    placeholder="—"
                    onChange={(e) => setCats((prev) => ({ ...prev, [c.key]: e.target.value }))}
                  />
                  <span className="w-8 text-xs text-muted-foreground/60">/{c.max}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
              Key findings
            </p>
            <div className="mt-2">
              <EditableList
                items={findings}
                onChange={setFindings}
                placeholder="One finding, stated plainly"
                addLabel="Add finding"
              />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
              Priority recommendations
            </p>
            <div className="mt-2">
              <EditableList
                items={fixes}
                onChange={setFixes}
                placeholder="The specific move, with the cause it addresses"
                addLabel="Add recommendation"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}