import React, { useState } from 'react';
import { LoaderCircle, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

const NARRATIVE_FIELDS = ['short_summary', 'challenge', 'objectives', 'scope_of_work', 'strategy', 'deliverables'];

/** One-click grounded draft of the case-study narrative. Fills empty sections only. */
export default function DraftStoryButton({ form, assets, onChange }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      const response = await base44.functions.invoke('portfolio-draft', {
        action: 'generate',
        payload: {
          project: {
            title: form.title || '',
            client_name: form.client_name || '',
            industry: form.industry || '',
            work_types: form.work_types || [],
            scope_of_work: form.scope_of_work || '',
            deliverables: form.deliverables || '',
            short_summary: form.short_summary || '',
            target_keywords: form.target_keywords || [],
            asset_summaries: (assets || [])
              .filter((a) => a.file_url)
              .slice(0, 40)
              .map((a) => `${a.title} (${a.asset_type})`),
          },
        },
      });
      const narrative = response?.data?.narrative || {};
      const draft = {};
      let filled = 0;
      NARRATIVE_FIELDS.forEach((key) => {
        const value = (narrative[key] || '').trim();
        if (value && value !== '[NEEDS REVIEW]' && !(form[key] || '').trim()) {
          draft[key] = value;
          filled += 1;
        }
      });
      if (filled) onChange(draft);
      const missing = (narrative.missing || []).join(', ');
      toast({
        title: filled ? `Drafted ${filled} section${filled === 1 ? '' : 's'} from the project facts.` : 'Nothing new could be drafted from the facts yet.',
        description: missing ? `Needs your review: ${missing}` : undefined,
      });
    } catch (e) {
      toast({ title: 'Draft failed', description: e.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={run}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-40"
    >
      {busy ? <LoaderCircle className="h-3.5 w-3.5 animate-spin text-primary" /> : <Sparkles className="h-3.5 w-3.5 text-primary" />}
      {busy ? 'Drafting…' : 'Draft the story'}
    </button>
  );
}