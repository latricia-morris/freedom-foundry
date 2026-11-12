import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { REPORT_TYPE_LABELS, structurePrompt } from '@/lib/reportIntake';

/** Copies the report-structure prompt for the chosen report type, with a preview. */
export default function StructurePromptButton({ type }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const text = structurePrompt(type);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: 'Structure prompt copied', description: `${REPORT_TYPE_LABELS[type]} format is on your clipboard.` });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="dashboard-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-heading text-xl text-foreground">Report structure prompt</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Give this to your AI after your research prompt so the {REPORT_TYPE_LABELS[type]} report comes back ready to load.
          </p>
        </div>
        <button type="button" onClick={copy} className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Copied' : 'Copy structure prompt'}
        </button>
      </div>
      <details className="mt-4">
        <summary className="cursor-pointer text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">Preview the prompt</summary>
        <pre className="forged-well mt-3 max-h-80 overflow-auto whitespace-pre-wrap p-4 font-mono text-xs leading-relaxed text-muted-foreground">{text}</pre>
      </details>
    </div>
  );
}