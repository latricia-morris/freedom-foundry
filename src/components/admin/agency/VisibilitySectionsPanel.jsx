import React, { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import SectionsEditor from './SectionsEditor';

/**
 * Admin panel: the stored full audit for one report, editable verbatim.
 * Sections persist in source order; the two gating flags decide what the
 * client-side report renders.
 */
export default function VisibilitySectionsPanel({ report, onUpdated }) {
  const { toast } = useToast();
  const [sections, setSections] = useState(report.audit_sections || []);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const cleaned = sections
        .filter((s) => (s.title || '').trim())
        .map((s, i) => ({
          title: s.title.trim(),
          order: i,
          methodology: s.methodology || 'none',
          body: s.body || '',
          table: s.table?.rows?.length ? s.table : undefined,
          client_visible: s.client_visible !== false,
          release_with_recommendations: !!s.release_with_recommendations,
        }));
      const updated = await base44.entities.VisibilityReport.update(report.id, { audit_sections: cleaned });
      onUpdated?.(updated);
      toast({ title: 'Full audit saved', description: `${cleaned.length} section${cleaned.length === 1 ? '' : 's'} stored on this snapshot.` });
    } catch (err) {
      toast({ title: 'Could not save sections', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-card mt-6 p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-heading text-xl text-foreground">Full Audit — Source Sections</h3>
          <p className="text-xs text-muted-foreground">
            Every measurement section, preserved verbatim in the source's order. Self-test lists release to the client only when recommendations are enabled.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="btn-forge inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save sections
        </button>
      </div>
      <SectionsEditor sections={sections} onChange={setSections} />
      {!sections.length && (
        <p className="text-sm text-muted-foreground/70">No sections stored on this snapshot. Add them here or re-run the intake with the full audit text.</p>
      )}
    </div>
  );
}