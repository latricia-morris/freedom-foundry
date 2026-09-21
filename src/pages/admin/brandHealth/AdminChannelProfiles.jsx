import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

const FIT_FIELDS = [
  { key: 'best_fit_industries', label: 'Best-fit industries', long: false },
  { key: 'best_fit_niches', label: 'Best-fit niches', long: false },
  { key: 'best_fit_business_models', label: 'Best-fit business models', long: false },
  { key: 'best_fit_offer_types', label: 'Best-fit offer types', long: false },
  { key: 'best_fit_buyer_situations', label: 'Best-fit buyer situations', long: true },
  { key: 'best_fit_customer_value_range', label: 'Best-fit customer-value range', long: false },
  { key: 'best_fit_geography', label: 'Best-fit geography', long: false },
  { key: 'best_fit_positioning', label: 'Best-fit positioning types', long: false },
];

const REQUIREMENT_FIELDS = [
  { key: 'prerequisites', label: 'Prerequisites', long: true },
  { key: 'required_assets', label: 'Required assets', long: true },
  { key: 'required_capabilities', label: 'Required operational capabilities', long: true },
  { key: 'common_risks', label: 'Common risks', long: true },
  { key: 'common_failure_points', label: 'Common failure points', long: true },
  { key: 'poor_fit_scenarios', label: 'Poor-fit scenarios', long: true },
  { key: 'leverage_ideas', label: 'Leverage ideas', long: true },
  { key: 'related_vault_resources', label: 'Related Vault resources', long: false },
  { key: 'related_services', label: 'Related Freedom Foundry services / packages', long: true },
  { key: 'typical_time_to_impact', label: 'Typical time to impact', long: false },
  { key: 'typical_investment', label: 'Typical investment level', long: false },
];

/**
 * Consultant-only Channel Profile Library: reusable internal intellectual
 * property that speeds up and steadies channel decisions. It informs the
 * review — it never overrides consultant judgment or auto-publishs anything.
 */
export default function AdminChannelProfiles() {
  const [profiles, setProfiles] = useState(null);
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const { toast } = useToast();

  const load = () => {
    base44.entities.ChannelProfile.filter({}, 'name', 300)
      .then((rows) => setProfiles(rows || []))
      .catch(() => setProfiles([]));
  };
  useEffect(load, []);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return profiles || [];
    return (profiles || []).filter((p) => (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
  }, [profiles, search]);

  const addProfile = async () => {
    if (!newName.trim()) {
      toast({ title: 'Give the profile a name first', variant: 'destructive' });
      return;
    }
    try {
      await base44.entities.ChannelProfile.create({ name: newName.trim(), description: newDescription.trim() || null });
      setNewName('');
      setNewDescription('');
      load();
    } catch (err) {
      toast({ title: 'Could not add profile', description: err.message, variant: 'destructive' });
    }
  };

  const commit = async (id, patch) => {
    try {
      await base44.entities.ChannelProfile.update(id, patch);
    } catch (err) {
      toast({ title: 'Could not save profile', description: err.message, variant: 'destructive' });
      load();
    }
  };

  const remove = async (id) => {
    try {
      await base44.entities.ChannelProfile.delete(id);
      load();
    } catch (err) {
      toast({ title: 'Could not delete profile', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="mx-auto max-w-5xl animate-fade-in pb-12">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-light text-foreground">
          Channel <span className="molten-text italic">Profile Library</span>
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Internal channel intelligence: fit criteria, prerequisites, metrics, risks, and leverage ideas.
          It informs your reviews — it never overrides your judgment or publishes anything to a client.
        </p>
      </div>

      <div className="dashboard-card mb-6 p-5">
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-48 flex-1 space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
            Search profiles
            <input className="admin-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g. Local, Email, Partnerships" />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-border/40 pt-4">
          <label className="min-w-48 flex-1 space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
            New profile name
            <input className="admin-input" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e. g. Community Sponsorships" />
          </label>
          <label className="min-w-48 flex-1 space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
            Description
            <input className="admin-input" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
          </label>
          <button type="button" onClick={addProfile} className="btn-forge inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-widest">
            <Plus className="h-4 w-4" /> Add profile
          </button>
        </div>
      </div>

      {!profiles ? (
        <div className="flex justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((p) => (
            <ProfileCard key={p.id} profile={p} onSave={commit} onDelete={remove} />
          ))}
          {!shown.length && (
            <div className="dashboard-card p-10 text-center">
              <p className="text-sm text-muted-foreground">No profiles match. Add one above.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FieldRow({ profile, field, onSave }) {
  const [value, setValue] = useState(profile[field.key] || '');
  useEffect(() => setValue(profile[field.key] || ''), [profile?.id, profile?.updated_date, field.key]);
  const commit = () => {
    if ((value || null) === (profile[field.key] || null)) return;
    onSave(profile.id, { [field.key]: value || null });
  };
  return (
    <label className="block space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
      {field.label}
      {field.long ? (
        <textarea className="admin-input" rows={2} value={value} onChange={(e) => setValue(e.target.value)} onBlur={commit} />
      ) : (
        <input className="admin-input" value={value} onChange={(e) => setValue(e.target.value)} onBlur={commit} />
      )}
    </label>
  );
}

function ListField({ profile, field, onSave }) {
  const [text, setText] = useState((profile[field.key] || []).join('\n'));
  useEffect(() => setText((profile[field.key] || []).join('\n')), [profile?.id, profile?.updated_date, field.key]);
  const commit = () => {
    const list = text.split('\n').map((s) => s.trim()).filter(Boolean);
    if (JSON.stringify(list) === JSON.stringify(profile[field.key] || [])) return;
    onSave(profile.id, { [field.key]: list });
  };
  return (
    <label className="block space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
      {field.label} <span className="normal-case tracking-normal text-muted-foreground/60">(one per line)</span>
      <textarea className="admin-input" rows={2} value={text} onChange={(e) => setText(e.target.value)} onBlur={commit} />
    </label>
  );
}

function ProfileCard({ profile, onSave, onDelete }) {
  const [name, setName] = useState(profile.name || '');
  const [description, setDescription] = useState(profile.description || '');
  useEffect(() => {
    setName(profile.name || '');
    setDescription(profile.description || '');
  }, [profile?.id, profile?.updated_date]);

  const commitName = () => { if ((name || null) !== (profile.name || null)) onSave(profile.id, { name: name || null }); };
  const commitDescription = () => { if ((description || null) !== (profile.description || null)) onSave(profile.id, { description: description || null }); };

  return (
    <details className="dashboard-card px-5 py-4">
      <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">{profile.name}</p>
          {profile.description && <p className="mt-0.5 text-xs text-muted-foreground">{profile.description}</p>}
        </div>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Edit</span>
      </summary>
      <div className="mt-4 space-y-4 border-t border-border/40 pt-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
            Profile name
            <input className="admin-input" value={name} onChange={(e) => setName(e.target.value)} onBlur={commitName} />
          </label>
          <label className="block space-y-1 text-[10px] uppercase tracking-widest text-muted-foreground">
            Description
            <input className="admin-input" value={description} onChange={(e) => setDescription(e.target.value)} onBlur={commitDescription} />
          </label>
        </div>

        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-primary">Fit criteria</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {FIT_FIELDS.map((f) => <FieldRow key={f.key} profile={profile} field={f} onSave={onSave} />)}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-primary">Requirements &amp; experience</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {REQUIREMENT_FIELDS.map((f) => <FieldRow key={f.key} profile={profile} field={f} onSave={onSave} />)}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-primary">Roles &amp; metrics</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <ListField profile={profile} field={{ key: 'typical_journey_roles', label: 'Typical buyer-journey roles' }} onSave={onSave} />
            <ListField profile={profile} field={{ key: 'recommended_metrics', label: 'Recommended metrics' }} onSave={onSave} />
          </div>
        </div>

        <div className="flex justify-end border-t border-border/40 pt-3">
          <button
            type="button"
            onClick={() => onDelete(profile.id)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete profile
          </button>
        </div>
      </div>
    </details>
  );
}