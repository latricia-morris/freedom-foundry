import React from 'react';
import { MEDIA_LIBRARY } from '@/lib/proposalAgencyClient';

const LABEL = 'space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground';

/**
 * Post-parse review: recipient binding confirmation, editable critical
 * fields, import review notes, and media library status. Publish validation
 * runs server-side; this panel never changes legal agreement text.
 */
export default function ProposalReviewPanel({ parsed, client, form, setForm, onPublish, busy, publishResult, blockers }) {
  if (!parsed) return null;
  const isIndividual = !client?.company_name;
  const items = parsed?.investment?.items || [];

  return (
    <div className="mt-8 space-y-6">
      <div className="dashboard-card p-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Recipient binding</p>
        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <p className="text-muted-foreground"><span className="font-medium text-foreground">Client record:</span> {client?.primary_contact_name || 'Not selected'}{client?.company_name ? ` · ${client.company_name}` : ' · Individual'}</p>
          <p className="text-muted-foreground"><span className="font-medium text-foreground">From document:</span> {parsed?.recipient?.full_name || 'Not stated'}{parsed?.recipient?.company_name ? ` · ${parsed.recipient.company_name}` : ''}</p>
        </div>
        {client && parsed?.recipient?.company_name && !isIndividual &&
          parsed.recipient.company_name.toLowerCase() !== client.company_name.toLowerCase() ? (
          <p className="mt-2 text-xs text-red-400">
            The company name in the document differs from the client record. Confirm this proposal belongs to the
            selected client before publishing.
          </p>
        ) : null}
      </div>

      <div className="dashboard-card p-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Proposal settings</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className={LABEL}>Title
            <input className="admin-input" value={form.title || parsed?.title || ''} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </label>
          <label className={LABEL}>Project type
            <input className="admin-input" placeholder="e.g. website_optimization" value={form.project_type || ''} onChange={(e) => setForm((f) => ({ ...f, project_type: e.target.value }))} />
          </label>
          <label className={LABEL}>Valid for (days)
            <input className="admin-input" type="number" min="1" value={form.validity_days} onChange={(e) => setForm((f) => ({ ...f, validity_days: Number(e.target.value) || 30 }))} />
          </label>
        </div>
        <div className="mt-4 space-y-2">
          {[
            { key: 'approach', label: 'Show Our approach' },
            { key: 'capabilities', label: 'Show Capabilities' },
            { key: 'meet', label: 'Show Meet LaTricia' },
            { key: 'book', label: 'Show Book feature' },
          ].map((v) => (
            <label key={v.key} className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={form[v.key] !== false} onChange={(e) => setForm((f) => ({ ...f, [v.key]: e.target.checked }))} />
              {v.label}
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={form.web_change_elected === true} onChange={(e) => setForm((f) => ({ ...f, web_change_elected: e.target.checked }))} />
            Include the elected web-change rate clause ($150/hour for out-of-scope web work)
          </label>
        </div>
      </div>

      <div className="dashboard-card p-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Parsed content</p>
        <div className="mt-3 space-y-3 text-sm text-muted-foreground">
          <p><span className="font-medium text-foreground">Scope modules:</span> {(parsed?.scope_modules || []).length || 0}</p>
          {(parsed?.scope_modules || []).map((m) => (
            <div key={m.name} className="border-l-2 border-border pl-3">
              <p className="font-medium text-foreground">{m.name}{m.group ? ` · ${m.group}` : ''}</p>
              <p className="text-xs">{(m.deliverables || []).length} deliverables{m.revision_allowance ? ` · revisions: ${m.revision_allowance}` : ''}</p>
            </div>
          ))}
          <p><span className="font-medium text-foreground">Investment items:</span> {items.length}</p>
          {items.map((i) => (
            <p key={i.label} className="text-xs">
              {i.label} · {i.kind}{i.tier_group ? ` (${i.tier_group})` : ''} · {Number(i.unit_price) > 0 ? `$${i.unit_price}` : 'no price'}
            </p>
          ))}
          <p><span className="font-medium text-foreground">Timeline phases:</span> {(parsed?.timeline?.phases || []).length}</p>
          <p><span className="font-medium text-foreground">Payment schedule entries:</span> {(parsed?.investment?.schedule || []).length}</p>
        </div>
      </div>

      {(parsed?.unresolved || []).length || (parsed?.agreement_overrides || []).length ? (
        <div className="dashboard-card p-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Review before publishing</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {(parsed?.unresolved || []).map((u, i) => (
              <li key={`u-${i}`}><span className="font-medium text-foreground">{u.section}:</span> {u.note}</li>
            ))}
            {(parsed?.agreement_overrides || []).map((o, i) => (
              <li key={`o-${i}`}><span className="font-medium text-foreground">{o.clause}:</span> {o.change}</li>
            ))}
          </ul>
          {(parsed?.agreement_overrides || []).length ? (
            <label className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={form.overrides_confirmed === true} onChange={(e) => setForm((f) => ({ ...f, overrides_confirmed: e.target.checked }))} />
              I have reviewed the listed agreement overrides and approve them for this proposal.
            </label>
          ) : null}
        </div>
      ) : null}

      <div className="dashboard-card p-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Media library</p>
        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
          {MEDIA_LIBRARY.map((m) => (
            <li key={m.key}>
              <span className="font-medium text-foreground">{m.slot}</span> · {m.url ? 'Assigned' : 'Awaiting asset'}{m.hidden_by_default ? ' · hidden by default' : ''}
            </li>
          ))}
        </ul>
      </div>

      {blockers?.length ? (
        <div className="dashboard-card border-destructive/50 p-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-destructive">Publication blocked</p>
          <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
            {blockers.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
      ) : null}

      {publishResult ? (
        <div className="dashboard-card p-6">
          <p className="font-heading text-xl text-foreground">Published.</p>
          <p className="mt-1 text-sm text-muted-foreground">Version {publishResult.version} is live. The client has been emailed their secure link.</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <a href={`/proposal/${publishResult.token}`} target="_blank" rel="noreferrer" className="link-warm">Open proposal link &rarr;</a>
          </div>
        </div>
      ) : null}

      <button type="button" onClick={onPublish} disabled={busy} className="btn-forge rounded-sm px-6 py-3 text-sm font-semibold disabled:opacity-50">
        {busy ? 'Working...' : 'Publish proposal'}
      </button>
    </div>
  );
}