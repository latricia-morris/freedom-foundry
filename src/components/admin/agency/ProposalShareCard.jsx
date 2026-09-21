import React, { useState } from 'react';
import { Ban, Copy, ExternalLink, Send, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { formatUsd, PROPOSAL_STATUS_LABELS, PROPOSAL_STATUS_STYLES } from '@/lib/agency';

/** Send / share / void / manual deposit verification controls. */
export default function ProposalShareCard({ proposal, itemCount, onReload }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState('');
  const link = proposal.share_token ? `${window.location.origin}/p/${proposal.share_token}` : '';

  const send = async () => {
    if (!itemCount) {
      toast({ title: 'Add line items first', description: 'A proposal needs scope before it can be sent.', variant: 'destructive' });
      return;
    }
    setBusy('send');
    try {
      await base44.entities.Proposal.update(proposal.id, {
        status: 'sent',
        sent_at: new Date().toISOString(),
      });
      await base44.entities.AuditLog.create({
        actor_role: 'admin', entity_type: 'Proposal', entity_id: proposal.id,
        action: 'proposal_sent', source: 'ui', before_value: { status: proposal.status },
      });
      toast({ title: 'Proposal sent status set', description: 'Share the client link below.' });
      onReload();
    } catch (e) {
      toast({ title: 'Could not send', description: e.message, variant: 'destructive' });
    } finally {
      setBusy('');
    }
  };

  const voidProposal = async () => {
    if (!window.confirm('Void this proposal? The client link will stop working for new acceptance.')) return;
    setBusy('void');
    try {
      await base44.entities.Proposal.update(proposal.id, { status: 'cancelled' });
      await base44.entities.AuditLog.create({
        actor_role: 'admin', entity_type: 'Proposal', entity_id: proposal.id,
        action: 'proposal_voided', source: 'ui', before_value: { status: proposal.status },
      });
      onReload();
    } finally {
      setBusy('');
    }
  };

  const manualActivate = async () => {
    if (!window.confirm('Mark the deposit as paid and activate the project? Only use this when the deposit was collected outside Stripe (check, transfer, etc.).')) return;
    setBusy('activate');
    try {
      const res = await base44.functions.invoke('agency-proposals', {
        action: 'admin-activate', proposal_id: proposal.id,
      });
      const payload = res.data || {};
      if (payload.ok) toast({ title: 'Deposit verified', description: 'Project activated from the accepted scope.' });
      else toast({ title: 'Could not activate', description: payload.error || 'Check the exception queue.', variant: 'destructive' });
      onReload();
    } catch (e) {
      toast({ title: 'Could not activate', description: e.message, variant: 'destructive' });
    } finally {
      setBusy('');
    }
  };

  const canSend = ['draft', 'internal_review', 'cancelled'].includes(proposal.status);
  const awaitingDeposit = ['accepted_awaiting_deposit', 'deposit_checkout_opened'].includes(proposal.status);

  return (
    <div className="dashboard-card space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-heading text-2xl text-foreground">Client link</h3>
          <p className="text-xs text-muted-foreground/70">
            The client reviews, selects, signs, and pays the deposit at this secure link.
          </p>
        </div>
        <span className={`rounded-sm border px-2.5 py-1 text-[10px] uppercase tracking-wider ${PROPOSAL_STATUS_STYLES[proposal.status] || 'border-border text-muted-foreground'}`}>
          {PROPOSAL_STATUS_LABELS[proposal.status] || proposal.status}
        </span>
      </div>

      {link && (
        <div className="flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-md border border-border bg-background/60 px-3 py-2 text-xs text-muted-foreground">{link}</code>
          <button type="button" onClick={() => { navigator.clipboard?.writeText(link); toast({ title: 'Link copied' }); }} className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
            <Copy className="h-3.5 w-3.5" /> Copy
          </button>
          <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
            <ExternalLink className="h-3.5 w-3.5" /> Test view
          </a>
        </div>
      )}

      {proposal.accepted_contract_total_cents != null && (
        <p className="text-sm text-muted-foreground">
          Accepted contract total: <span className="text-foreground">{formatUsd(proposal.accepted_contract_total_cents)}</span>
          {proposal.accepted_scope_snapshot?.deposit_cents != null && (
            <> · Deposit: <span className="text-primary">{formatUsd(proposal.accepted_scope_snapshot.deposit_cents)}</span></>
          )}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {canSend && (
          <button type="button" onClick={send} disabled={busy === 'send'} className="btn-forge inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest disabled:opacity-50">
            <Send className="h-4 w-4" /> {busy === 'send' ? 'Marking sent…' : 'Mark as sent'}
          </button>
        )}
        {awaitingDeposit && (
          <button type="button" onClick={manualActivate} disabled={busy === 'activate'} className="btn-forge inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest disabled:opacity-50">
            <ShieldCheck className="h-4 w-4" /> {busy === 'activate' ? 'Verifying…' : 'Verify deposit manually'}
          </button>
        )}
        {!['deposit_paid', 'cancelled'].includes(proposal.status) && (
          <button type="button" onClick={voidProposal} className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-destructive">
            <Ban className="h-4 w-4" /> Void
          </button>
        )}
      </div>
    </div>
  );
}