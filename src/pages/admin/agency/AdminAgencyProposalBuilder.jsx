import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import LineItemsEditor from '@/components/admin/agency/LineItemsEditor';
import PaymentRulesEditor from '@/components/admin/agency/PaymentRulesEditor';
import ProposalShareCard from '@/components/admin/agency/ProposalShareCard';
import { computeClientTotals } from '@/lib/agency';

function makeToken() {
  try {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 22);
  } catch {
    return Math.random().toString(36).slice(2, 14) + Date.now().toString(36);
  }
}

export default function AdminAgencyProposalBuilder() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const { toast } = useToast();

  const [clients, setClients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [proposal, setProposal] = useState(null);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [saving, setSaving] = useState(false);
  const [setup, setSetup] = useState({ client_id: '', title: '', template_id: '' });

  useEffect(() => {
    Promise.all([
      base44.entities.AgencyClient.filter({}, '-created_date', 300).catch(() => []),
      base44.entities.ProjectTemplate.filter({ active: true }, 'created_date', 50).catch(() => []),
      base44.entities.Proposal.filter({}, '-created_date', 500).catch(() => []),
    ]).then(([c, t, p]) => { setClients(c || []); setTemplates(t || []); setProposals(p || []); });
  }, []);

  const loadProposal = () => {
    if (isNew) return;
    base44.entities.Proposal.get(id)
      .then((record) => {
        setProposal(record);
        setMeta({
          title: record.title || '',
          expiration_date: (record.expiration_date || '').slice(0, 10),
          agreement_text: record.agreement_text || '',
          deposit_rule_type: record.deposit_rule_type || 'percentage',
          deposit_rule_value: record.deposit_rule_value ?? 50,
          milestone_rules: record.milestone_rules || [],
          source_template_id: record.source_template_id || '',
        });
      })
      .catch(() => setProposal(null));
    base44.entities.ProposalLineItem.filter({ proposal_id: id }, 'display_order', 200)
      .then((rows) => setItems(rows || []))
      .catch(() => setItems([]));
  };
  useEffect(loadProposal, [id, isNew]);

  // ── New proposal setup ─────────────────────────────────────────────────
  if (isNew) {
    const createDraft = async () => {
      if (!setup.client_id || !setup.title.trim()) {
        toast({ title: 'Client and title are required', variant: 'destructive' });
        return;
      }
      try {
        const year = new Date().getFullYear();
        const number = `P-${year}-${String((proposals.length || 0) + 1).padStart(3, '0')}`;
        const created = await base44.entities.Proposal.create({
          proposal_number: number,
          client_id: setup.client_id,
          title: setup.title.trim(),
          status: 'draft',
          deposit_rule_type: 'percentage',
          deposit_rule_value: 50,
          milestone_rules: [],
          share_token: makeToken(),
          source_template_id: setup.template_id || '',
          signature_status: 'pending',
          project_activation_status: 'not_eligible',
        });
        await base44.entities.AuditLog.create({
          actor_role: 'admin', entity_type: 'Proposal', entity_id: created.id,
          action: 'proposal_created', source: 'ui',
        });
        navigate(`/admin/agency/proposals/${created.id}`, { replace: true });
      } catch (e) {
        toast({ title: 'Could not create draft', description: e.message, variant: 'destructive' });
      }
    };

    return (
      <div className="mx-auto max-w-3xl animate-fade-in pb-12">
        <Link to="/admin/agency" className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Agency home
        </Link>
        <h1 className="mb-8 font-heading text-4xl font-light text-foreground">New <span className="molten-text italic">Proposal</span></h1>
        <div className="dashboard-card space-y-4 p-6">
          <label className="block">
            <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">Client</span>
            <select className="admin-input py-2 text-sm" value={setup.client_id} onChange={(e) => setSetup({ ...setup, client_id: e.target.value })}>
              <option value="">— Select a client —</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
            {clients.length === 0 && (
              <p className="mt-2 text-xs text-muted-foreground/70">
                No clients yet — <Link to="/admin/agency/clients" className="link-warm">add one first</Link>.
              </p>
            )}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">Proposal title</span>
            <input className="admin-input py-2 text-sm" placeholder="Brand identity + website rebuild" value={setup.title} onChange={(e) => setSetup({ ...setup, title: e.target.value })} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">Project template (used at activation)</span>
            <select className="admin-input py-2 text-sm" value={setup.template_id} onChange={(e) => setSetup({ ...setup, template_id: e.target.value })}>
              <option value="">— Default template —</option>
              {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>
          <button type="button" onClick={createDraft} className="btn-forge rounded-md px-5 py-2.5 text-xs font-semibold uppercase tracking-widest">
            Create draft
          </button>
        </div>
      </div>
    );
  }

  // ── Existing proposal builder ──────────────────────────────────────────
  if (!proposal || !meta) {
    return <div className="flex justify-center py-24"><div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" /></div>;
  }

  const saveMeta = async () => {
    setSaving(true);
    try {
      await base44.entities.Proposal.update(proposal.id, {
        title: meta.title,
        expiration_date: meta.expiration_date || null,
        agreement_text: meta.agreement_text,
        deposit_rule_type: meta.deposit_rule_type,
        deposit_rule_value: meta.deposit_rule_value,
        milestone_rules: meta.milestone_rules,
        source_template_id: meta.source_template_id,
      });
      toast({ title: 'Proposal saved.' });
      loadProposal();
    } catch (e) {
      toast({ title: 'Save failed', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const estimated = computeClientTotals(items, {});
  const client = clients.find((c) => c.id === proposal.client_id);

  return (
    <div className="mx-auto max-w-5xl animate-fade-in pb-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link to="/admin/agency/proposals" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All proposals
        </Link>
        <button type="button" onClick={saveMeta} disabled={saving} className="btn-forge inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <div className="mb-6">
        <h1 className="font-heading text-3xl font-light text-foreground">{proposal.proposal_number}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{client?.company_name || 'Client'} · estimated total {estimated.totalCents > 0 ? `$${(estimated.totalCents / 100).toFixed(2)}` : '—'}</p>
      </div>

      <div className="space-y-6">
        <ProposalShareCard proposal={proposal} itemCount={items.length} onReload={loadProposal} />

        <div className="dashboard-card space-y-4 p-6">
          <h3 className="font-heading text-2xl text-foreground">Proposal details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">Title</span>
              <input className="admin-input py-2 text-sm" value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">Acceptance deadline</span>
              <input type="date" className="admin-input py-2 text-sm" value={meta.expiration_date} onChange={(e) => setMeta({ ...meta, expiration_date: e.target.value })} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">Project template</span>
              <select className="admin-input py-2 text-sm" value={meta.source_template_id} onChange={(e) => setMeta({ ...meta, source_template_id: e.target.value })}>
                <option value="">— Default template —</option>
                {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-[10px] uppercase tracking-widest text-muted-foreground">Agreement terms (shown at signing)</span>
            <textarea
              className="admin-input min-h-[120px] py-2 text-sm"
              placeholder="Payment terms, revision rounds, ownership transfer, cancellation policy…"
              value={meta.agreement_text}
              onChange={(e) => setMeta({ ...meta, agreement_text: e.target.value })}
            />
          </label>
        </div>

        <LineItemsEditor proposalId={proposal.id} items={items} onReload={loadProposal} />

        <PaymentRulesEditor
          depositRuleType={meta.deposit_rule_type}
          depositRuleValue={meta.deposit_rule_value}
          milestoneRules={meta.milestone_rules}
          estimatedTotalCents={estimated.totalCents}
          onDepositChange={(type, value) => setMeta({ ...meta, deposit_rule_type: type, deposit_rule_value: value })}
          onMilestonesChange={(rules) => setMeta({ ...meta, milestone_rules: rules })}
        />
      </div>
    </div>
  );
}