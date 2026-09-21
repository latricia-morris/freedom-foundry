import React, { useState } from 'react';
import { Loader2, Sparkles, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

const STATUS_ENUM = ['pending_activation', 'onboarding', 'active', 'waiting_on_client', 'internal_review', 'client_review', 'delivery_hold', 'completed', 'archived', 'on_hold'];
const HEALTH_ENUM = ['on_track', 'at_risk', 'delayed', 'waiting_on_client', 'on_hold'];

/**
 * Small AI affordance: one-line description in, a fully populated project
 * draft out — dropped into the table's add row for review before saving.
 */
export default function AiProjectAssistant({ clients, onDraft }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You set up projects in a branding agency's operations system. Clients (choose exactly one company name from this list, or return an empty string): ${clients.map((c) => c.company_name).join('; ')}. Project statuses (return exactly one): ${STATUS_ENUM.join(', ')}. Health values (return exactly one): ${HEALTH_ENUM.join(', ')}. Today is ${new Date().toISOString().slice(0, 10)}. Create ONE project from this one-line description: "${text.trim()}". Keep the name short. due_date must be YYYY-MM-DD or an empty string. manager is a person's name or an empty string.`,
        response_json_schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            client: { type: 'string' },
            status: { type: 'string' },
            client_project_health: { type: 'string' },
            due_date: { type: 'string' },
            manager: { type: 'string' },
          },
          required: ['name', 'client', 'status', 'client_project_health', 'due_date', 'manager'],
        },
      });
      const d = res?.data ?? res;
      const wanted = (d.client || '').toLowerCase().trim();
      const match = clients.find((c) => wanted && (c.company_name.toLowerCase() === wanted || c.company_name.toLowerCase().includes(wanted)));
      onDraft({
        name: d.name || text.trim(),
        client_id: match?.id || '',
        status: STATUS_ENUM.includes(d.status) ? d.status : 'pending_activation',
        client_project_health: HEALTH_ENUM.includes(d.client_project_health) ? d.client_project_health : 'on_track',
        client_target_completion_date: /^\d{4}-\d{2}-\d{2}$/.test(d.due_date || '') ? d.due_date : '',
        assigned_project_manager: (d.manager || '').trim(),
      });
      setOpen(false);
      setText('');
      toast({ title: 'AI draft ready', description: 'Review the highlighted row, then press Enter to save.' });
    } catch (e) {
      toast({ title: 'AI draft failed', description: e.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      >
        <Sparkles className="h-3.5 w-3.5" /> AI add project
      </button>
    );
  }

  return (
    <div className="flex w-full max-w-xl items-center gap-2">
      <input
        autoFocus
        className="admin-input flex-1 py-2 text-sm"
        placeholder="Describe the project in one line…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); generate(); }
          if (e.key === 'Escape') setOpen(false);
        }}
      />
      <button
        type="button"
        onClick={generate}
        disabled={busy || !text.trim()}
        className="btn-forge inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-widest disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} Draft
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Close AI assistant"
        className="rounded-sm p-1.5 text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}