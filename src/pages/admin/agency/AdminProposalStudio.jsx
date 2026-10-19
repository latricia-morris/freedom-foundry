import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload } from 'lucide-react';
import { fmtMoney } from '@/lib/proposalFormat';
import { STATUS_LABELS, buildDraftPayload } from '@/lib/proposalStudioModel';
import ProposalReviewPanel from '@/components/admin/proposal/ProposalReviewPanel';

/**
 * Proposal Studio: select client, import one Markdown file or paste it, parse,
 * review, and publish. Published proposals are managed below with secure
 * client links and offline receipt recording.
 */
export default function AdminProposalStudio() {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [markdown, setMarkdown] = useState('');
  const [parsed, setParsed] = useState(null);
  const [form, setForm] = useState({ validity_days: 30, approach: true, capabilities: true, meet: true, book: true, web_change_elected: false, overrides_confirmed: false, title: '', project_type: '' });
  const [docId, setDocId] = useState('');
  const [busy, setBusy] = useState(false);
  const [parseError, setParseError] = useState('');
  const [publishResult, setPublishResult] = useState(null);
  const [blockers, setBlockers] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [offlineFor, setOfflineFor] = useState(null);
  const [offlineForm, setOfflineForm] = useState({ amount: '', method: 'check', reference: '', date: new Date().toISOString().slice(0, 10) });

  useEffect(() => {
    (async () => {
      const page = await base44.entities.AgencyClient.filter({}, '-created_date', 100);
      setClients(page.items || page);
      const docs = await base44.entities.ProposalDoc.filter({}, '-created_date', 50);
      setProposals(docs.items || docs);
    })();
  }, []);

  const client = clients.find((c) => c.id === clientId) || null;

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setMarkdown(String(reader.result || ''));
    reader.readAsText(file);
  };

  const parse = async () => {
    setBusy(true);
    setParseError('');
    setParsed(null);
    try {
      const res = (await base44.functions.invoke('proposal-import', { action: 'parse', markdown, proposal_id: docId || undefined }))?.data || {};
      setParsed(res.parsed);
    } catch (e) {
      setParseError(String(e?.message || 'Parsing failed. Check the Markdown and try again.'));
    } finally {
      setBusy(false);
    }
  };

  const publish = async () => {
    if (!client) return;
    setBusy(true);
    setBlockers(null);
    setPublishResult(null);
    try {
      const payload = buildDraftPayload({ parsed, client, form });
      let id = docId;
      if (!id) {
        const created = (await base44.functions.invoke('proposal-import', { action: 'save-draft', agency_client_id: client.id, payload }))?.data || {};
        id = created.id;
        setDocId(id);
      } else {
        await base44.functions.invoke('proposal-import', { action: 'save-draft', proposal_id: id, agency_client_id: client.id, payload });
      }
      const res = (await base44.functions.invoke('proposal-import', {
        action: 'publish',
        proposal_id: id,
        web_change_elected: form.web_change_elected === true,
        overrides_confirmed: form.overrides_confirmed === true,
        expiry_date: payload.expiry_date,
      }))?.data || {};
      if (res.error === 'blocked') setBlockers(res.blockers || []);
      else if (res.token) setPublishResult(res);
      const docs = await base44.entities.ProposalDoc.filter({}, '-created_date', 50);
      setProposals(docs.items || docs);
    } catch (e) {
      setBlockers([String(e?.message || 'Publishing failed.')]);
    } finally {
      setBusy(false);
    }
  };

  const recordOffline = async () => {
    setBusy(true);
    try {
      await base44.functions.invoke('proposal-import', {
        action: 'record-offline',
        proposal_id: offlineFor.id,
        amount_cents: Math.round((Number(offlineForm.amount) || 0) * 100),
        method: offlineForm.method,
        reference: offlineForm.reference,
      });
      setOfflineFor(null);
      const docs = await base44.entities.ProposalDoc.filter({}, '-created_date', 50);
      setProposals(docs.items || docs);
    } finally {
      setBusy(false);
    }
  };

  const depositFor = (p) => {
    const schedule = p.investment?.schedule || [];
    const pct = schedule[0]?.percent ?? 50;
    const total = (p.investment?.items || []).reduce((s, i) => s + Math.round((Number(i.unit_price) || 0) * 100) * (i.quantity_default || 1), 0);
    return Math.round((total * pct) / 100);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="font-heading text-4xl font-light text-foreground sm:text-5xl">Proposal <span className="molten-text italic">Studio</span></h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Import one Markdown file, review the parsed proposal, and publish it to your client with a secure link.
        </p>
      </div>

      <div className="dashboard-card space-y-5 p-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">1. Client and document</p>
        <label className="block space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          Select client and company
          <select className="admin-input" value={clientId} onChange={(e) => setClientId(e.target.value)}>
            <option value="">Select a client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.company_name ? `${c.company_name} · ${c.primary_contact_name}` : c.primary_contact_name}</option>
            ))}
          </select>
        </label>
        <label className="block space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          Paste the complete Markdown
          <textarea className="admin-input min-h-40" rows={8} value={markdown} onChange={(e) => setMarkdown(e.target.value)} />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-sm border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
            <Upload className="h-4 w-4" /> Upload Markdown file
            <input type="file" accept=".md,.markdown,.txt" className="hidden" onChange={onFile} />
          </label>
          <button type="button" onClick={parse} disabled={busy || markdown.trim().length < 40 || !clientId} className="btn-forge rounded-sm px-5 py-2.5 text-sm font-semibold disabled:opacity-50">
            {busy ? 'Working...' : 'Parse proposal'}
          </button>
        </div>
        {parseError ? <p className="text-sm text-red-400">{parseError}</p> : null}
      </div>

      <ProposalReviewPanel
        parsed={parsed}
        client={client}
        form={form}
        setForm={setForm}
        onPublish={publish}
        busy={busy}
        publishResult={publishResult}
        blockers={blockers}
      />

      <div className="dashboard-card p-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Published proposals</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <th className="py-2.5 pr-4 font-semibold">Client</th>
                <th className="py-2.5 pr-4 font-semibold">Proposal</th>
                <th className="py-2.5 pr-4 font-semibold">Version</th>
                <th className="py-2.5 pr-4 font-semibold">Status</th>
                <th className="py-2.5 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((p) => (
                <tr key={p.id} className="border-b border-border/50">
                  <td className="py-3 pr-4 text-muted-foreground">{clients.find((c) => c.id === p.agency_client_id)?.company_name || 'Individual'}</td>
                  <td className="py-3 pr-4 font-medium text-foreground">{p.title}</td>
                  <td className="py-3 pr-4 text-muted-foreground">v{p.version || 1}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{STATUS_LABELS[p.status] || p.status}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      {p.share_token ? (
                        <a href={`/proposal/${p.share_token}`} target="_blank" rel="noreferrer" className="link-warm">Open link</a>
                      ) : null}
                      {['signed_awaiting_payment', 'awaiting_offline_deposit'].includes(p.status) ? (
                        <button
                          type="button"
                          onClick={() => {
                            setOfflineFor(p);
                            setOfflineForm((f) => ({ ...f, amount: (depositFor(p) / 100).toFixed(2) }));
                          }}
                          className="rounded-sm border border-border px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                        >
                          Record offline payment
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {!proposals.length ? (
                <tr><td colSpan={5} className="py-6 text-center text-sm text-muted-foreground">No proposals yet. Import your first Markdown file above.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {offlineFor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-sm border border-border bg-card p-6">
            <h3 className="font-heading text-2xl font-light text-foreground">Record offline payment</h3>
            <p className="mt-1 text-sm text-muted-foreground">{offlineFor.title}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">Amount (USD)
                <input className="admin-input" type="number" step="0.01" value={offlineForm.amount} onChange={(e) => setOfflineForm((f) => ({ ...f, amount: e.target.value }))} />
              </label>
              <label className="block space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">Method
                <select className="admin-input" value={offlineForm.method} onChange={(e) => setOfflineForm((f) => ({ ...f, method: e.target.value }))}>
                  <option value="check">Check</option>
                  <option value="cash">Cash</option>
                </select>
              </label>
              <label className="block space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">Reference
                <input className="admin-input" value={offlineForm.reference} onChange={(e) => setOfflineForm((f) => ({ ...f, reference: e.target.value }))} />
              </label>
              <label className="block space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">Received date
                <input className="admin-input" type="date" value={offlineForm.date} onChange={(e) => setOfflineForm((f) => ({ ...f, date: e.target.value }))} />
              </label>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <button type="button" onClick={recordOffline} disabled={busy} className="btn-forge rounded-sm px-5 py-2.5 text-sm font-semibold disabled:opacity-50">
                {busy ? 'Saving...' : 'Record receipt'}
              </button>
              <button type="button" onClick={() => setOfflineFor(null)} className="text-sm text-muted-foreground transition-colors hover:text-foreground">Cancel</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}