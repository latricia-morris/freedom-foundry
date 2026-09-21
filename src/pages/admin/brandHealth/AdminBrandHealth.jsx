import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, FilePlus2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { COMPONENTS, COMPONENT_LABELS, STATUS_LABELS, fmtDate } from '@/lib/brandHealth';
import { maiValue } from '@/lib/matrix';

const EMPTY_FORM = {
  agency_client_id: '',
  component: 'website_discoverability',
  package_tier: '',
  status: 'requested',
  intake_received_date: '',
  review_scheduled_date: '',
};

/** Consultant workspace entry point: every brand health audit across clients. */
export default function AdminBrandHealth() {
  const [clients, setClients] = useState([]);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const load = () => {
    setLoading(true);
    Promise.all([
      base44.entities.AgencyClient.filter({}, 'company_name', 300),
      base44.entities.BrandHealthAudit.filter({}, '-created_date', 200),
    ])
      .then(([c, a]) => {
        setClients(c || []);
        setAudits(a || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const clientName = useMemo(() => {
    const map = {};
    (clients || []).forEach((c) => { map[c.id] = c.company_name; });
    return map;
  }, [clients]);

  const createAudit = async () => {
    if (!form.agency_client_id) {
      toast({ title: 'Choose a client first', variant: 'destructive' });
      return;
    }
    try {
      await base44.entities.BrandHealthAudit.create({
        ...form,
        package_tier: form.package_tier || null,
        intake_received_date: form.intake_received_date || null,
        review_scheduled_date: form.review_scheduled_date || null,
      });
      toast({ title: 'Audit created' });
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (err) {
      toast({ title: 'Could not create audit', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="mx-auto max-w-5xl animate-fade-in pb-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-light text-foreground">
            Digital <span className="molten-text italic">Brand Health</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Consultant-led audits: discovery, conversion readiness, and marketing matrix — scored, noted, and published by you.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="btn-forge inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest"
        >
          <FilePlus2 className="h-4 w-4" /> {showForm ? 'Hide form' : 'Create audit'}
        </button>
      </div>

      {showForm && (
        <div className="dashboard-card mb-6 space-y-3 p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-1 text-xs uppercase tracking-widest text-muted-foreground">
              Client
              <select className="admin-input" value={form.agency_client_id} onChange={(e) => setForm({ ...form, agency_client_id: e.target.value })}>
                <option value="">— client —</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-xs uppercase tracking-widest text-muted-foreground">
              Component
              <select className="admin-input" value={form.component} onChange={(e) => setForm({ ...form, component: e.target.value })}>
                {COMPONENTS.map((c) => <option key={c.key} value={c.key}>{c.title}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-xs uppercase tracking-widest text-muted-foreground">
              Package / tier
              <input className="admin-input" placeholder="e.g. Full diagnostic" value={form.package_tier} onChange={(e) => setForm({ ...form, package_tier: e.target.value })} />
            </label>
            <label className="space-y-1 text-xs uppercase tracking-widest text-muted-foreground">
              Status
              <select className="admin-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {Object.keys(STATUS_LABELS).map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-xs uppercase tracking-widest text-muted-foreground">
              Intake received
              <input className="admin-input" type="date" value={form.intake_received_date} onChange={(e) => setForm({ ...form, intake_received_date: e.target.value })} />
            </label>
            <label className="space-y-1 text-xs uppercase tracking-widest text-muted-foreground">
              Review / debrief date
              <input className="admin-input" type="date" value={form.review_scheduled_date} onChange={(e) => setForm({ ...form, review_scheduled_date: e.target.value })} />
            </label>
          </div>
          <button type="button" onClick={createAudit} className="btn-forge rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest">
            Create audit record
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      ) : !audits.length ? (
        <div className="dashboard-card p-10 text-center">
          <p className="text-sm text-muted-foreground">No brand health audits yet. Create the first one above.</p>
        </div>
      ) : (
        <div className="dashboard-card overflow-x-auto p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 text-left text-[10px] uppercase tracking-widest text-muted-foreground/70">
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Component</th>
                <th className="px-5 py-3 font-medium">Package</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Score</th>
                <th className="px-5 py-3 font-medium">Review date</th>
                <th className="px-5 py-3 font-medium text-right">Open</th>
              </tr>
            </thead>
            <tbody>
              {audits.map((a) => (
                <tr key={a.id} className="border-t border-border/30">
                  <td className="px-5 py-3 text-sm text-foreground">{clientName[a.agency_client_id] || '—'}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{COMPONENT_LABELS[a.component] || a.component}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{a.package_tier || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                      a.status === 'published_to_client' ? 'border-emerald-500/40 text-emerald-400' : 'border-border text-muted-foreground'
                    }`}>
                      {STATUS_LABELS[a.status] || a.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    {a.component === 'marketing_matrix'
                      ? (maiValue(a) !== null ? `MAI ${maiValue(a)}` : '—')
                      : typeof a.score === 'number' ? `${a.score}/100` : '—'}
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{a.review_scheduled_date ? fmtDate(a.review_scheduled_date) : '—'}</td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      to={`/admin/brand-health/${a.id}`}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" /> Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}