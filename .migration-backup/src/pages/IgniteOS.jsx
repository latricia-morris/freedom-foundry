import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMembership } from '@/lib/useMembership';
import { Lock, Check, Plus, X, Flame } from 'lucide-react';

function ClientGate() {
  return (
    <div className="max-w-2xl mx-auto py-16 animate-fade-in">
      <div className="mb-8">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(131deg, rgba(179,35,44,0.12), rgba(217,98,44,0.08))' }}>
          <Flame className="w-6 h-6 text-[#d9c9a3]" strokeWidth={1.5} />
        </div>
        <h2 className="font-heading text-2xl font-light text-[#f7f2ea] mb-4 text-center">Ignite OS</h2>
        <div className="editorial-container space-y-4">
          <p className="text-sm text-[#2c2c33] leading-relaxed">
            Ignite OS is our proprietary brand activation system. This is where we take a brand from
            development to deployment, helping take your new brand or rebrand to the market with
            optimal efficacy.
          </p>
          <p className="text-sm text-[#2c2c33] leading-relaxed">
            It's a structured operating system that turns strategy into momentum — aligning your
            identity, messaging, and experience into a coordinated launch so your brand doesn't
            just enter the market, it lands with impact.
          </p>
        </div>
      </div>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(131deg, rgba(179,35,44,0.08), rgba(217,98,44,0.04))' }}>
          <Lock className="w-5 h-5 text-[#d9c9a3]" strokeWidth={1} />
        </div>
        <h3 className="font-heading text-xl font-light text-[#f7f2ea] mb-2">Client Feature</h3>
        <p className="text-sm text-[#f7f2ea]/60 leading-relaxed max-w-sm mx-auto">
          Ignite OS is reserved for clients working directly with The Brand Revivalist and/or Ox &amp; Iron.
        </p>
      </div>
    </div>
  );
}

export default function IgniteOS() {
  const { isClient, loading: memberLoading } = useMembership();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const init = { phase: '', activation_goals: '', brand_strategy: '', action_items: [], milestones: [], notes: '', status: 'active' };
  const [form, setForm] = useState(init);

  useEffect(() => {
    if (memberLoading) return;
    if (!isClient) { setLoading(false); return; }
    base44.entities.IgniteOS.filter({}, '-created_date', 1)
      .then(r => {
        const g = r?.[0] || null;
        setRecord(g);
        if (g) setForm({ ...init, ...g });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isClient, memberLoading]);

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const addAction = () => setForm(prev => ({ ...prev, action_items: [...prev.action_items, { text: '', done: false }] }));
  const updateAction = (i, field, val) => setForm(prev => ({ ...prev, action_items: prev.action_items.map((a, idx) => idx === i ? { ...a, [field]: val } : a) }));
  const removeAction = (i) => setForm(prev => ({ ...prev, action_items: prev.action_items.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (record?.id) {
        await base44.entities.IgniteOS.update(record.id, form);
      } else {
        const created = await base44.entities.IgniteOS.create(form);
        setRecord(created);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (_) {}
    setSaving(false);
  };

  if (memberLoading || loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;
  if (!isClient) return <ClientGate />;

  const inputClass = "w-full rounded-xl px-4 py-2.5 text-sm text-[#1a1420] bg-white border border-black/10 placeholder:text-black/30 outline-none focus:border-[#b3232c] transition-colors";
  const textareaClass = "w-full rounded-xl px-4 py-3 text-sm text-[#1a1420] bg-white border border-black/10 placeholder:text-black/30 outline-none focus:border-[#b3232c] transition-colors resize-none";

  return (
    <div className="max-w-3xl animate-fade-in">
      <div className="mb-6">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#d9c9a3]">Brand Portal</span>
        <h1 className="font-heading text-3xl font-light text-[#f7f2ea] mt-1 mb-1">
          Ignite <span className="molten-text italic">OS</span>
        </h1>
        <p className="text-sm text-[#f7f2ea]/60">Your brand activation operating system — from development to deployment.</p>
      </div>

      <div className="editorial-container space-y-6">
        <div>
          <label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Current Phase</label>
          <input className={inputClass} value={form.phase} onChange={e => update('phase', e.target.value)} placeholder="e.g. Phase 1 — Identity Activation" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Activation Goals</label>
          <textarea className={textareaClass} rows={4} value={form.activation_goals} onChange={e => update('activation_goals', e.target.value)} placeholder="What are the primary activation objectives for this phase?" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Brand Strategy</label>
          <textarea className={textareaClass} rows={4} value={form.brand_strategy} onChange={e => update('brand_strategy', e.target.value)} placeholder="Core strategic positioning and approach..." />
        </div>

        {/* Action Items */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-3">Action Items</label>
          <div className="space-y-2">
            {form.action_items.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  onClick={() => updateAction(i, 'done', !item.done)}
                  className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${item.done ? 'border-[#b3232c] bg-[#b3232c]' : 'border-black/20 bg-white'}`}
                >
                  {item.done && <Check className="w-3 h-3 text-white" />}
                </button>
                <input
                  className={`flex-1 ${inputClass} ${item.done ? 'line-through opacity-50' : ''}`}
                  value={item.text}
                  onChange={e => updateAction(i, 'text', e.target.value)}
                  placeholder="Action item..."
                />
                <button onClick={() => removeAction(i)} className="p-1 text-black/30 hover:text-black/60 transition-colors"><X className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            <button onClick={addAction} className="flex items-center gap-1.5 text-sm text-[#b3232c] hover:opacity-80 transition-opacity">
              <Plus className="w-4 h-4" /> Add Action Item
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Notes</label>
          <textarea className={textareaClass} rows={4} value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Additional notes, context, or observations..." />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs uppercase tracking-widest text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}
        >
          {saved ? <Check className="w-4 h-4" /> : null}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Ignite OS'}
        </button>
      </div>
    </div>
  );
}