import React, { useState, useEffect } from 'react';
import apiClient from '@/api/client';
import { useMembership } from '@/lib/useMembership';
import { Lock, Check } from 'lucide-react';

function ClientGate() {
  return (
    <div className="max-w-lg mx-auto py-16 text-center animate-fade-in">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ background: 'linear-gradient(131deg, rgba(179,35,44,0.12), rgba(217,98,44,0.08))' }}
      >
        <Lock className="w-7 h-7 text-[#d9c9a3]" strokeWidth={1} />
      </div>
      <h2 className="font-heading text-2xl font-light text-[#f7f2ea] mb-3">Client Feature</h2>
      <p className="text-sm text-[#f7f2ea]/60 leading-relaxed max-w-sm mx-auto">
        This feature is reserved for clients working directly with The Brand Revivalist and/or her agency, Ox & Iron.
      </p>
    </div>
  );
}

export default function BrandGuidelines() {
  const { isClient, loading: memberLoading } = useMembership();
  const [guidelines, setGuidelines] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const init = {
    heading_font: '', subheading_font: '', body_font: '', accent_font: '',
    logo_usage_notes: '', color_usage_notes: '', typography_notes: '',
    photography_style: '', tone_notes: '', brand_dont_list: '', additional_standards: ''
  };
  const [form, setForm] = useState(init);

  useEffect(() => {
    if (memberLoading) return;
    if (!isClient) { setLoading(false); return; }
    apiClient.entities.BrandGuidelines.filter({}, '-created_date', 1)
      .then(r => {
        const g = r?.[0] || null;
        setGuidelines(g);
        if (g) setForm({ ...init, ...g });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isClient, memberLoading]);

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (guidelines?.id) {
        await apiClient.entities.BrandGuidelines.update(guidelines.id, form);
      } else {
        const created = await apiClient.entities.BrandGuidelines.create(form);
        setGuidelines(created);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (_) {}
    setSaving(false);
  };

  if (memberLoading || loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;
  if (!isClient) return <ClientGate />;

  const textareaClass = "w-full rounded-xl px-4 py-3 text-sm text-[#1a1420] bg-white border border-black/10 placeholder:text-black/30 outline-none focus:border-[#b3232c] transition-colors resize-none";
  const inputClass = "w-full rounded-xl px-4 py-2.5 text-sm text-[#1a1420] bg-white border border-black/10 placeholder:text-black/30 outline-none focus:border-[#b3232c] transition-colors";

  return (
    <div className="max-w-3xl animate-fade-in">
      <div className="mb-6">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#d9c9a3]">Brand Portal</span>
        <h1 className="font-heading text-3xl font-light text-[#f7f2ea] mt-1 mb-1">Brand <span className="molten-text italic">Guidelines</span></h1>
        <p className="text-sm text-[#f7f2ea]/60">Standards, usage rules, and style notes for your brand.</p>
      </div>

      <div className="editorial-container space-y-6">
        {/* Font Kit */}
        <section>
          <h2 className="font-heading text-lg mb-4">Font Kit</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[['heading_font', 'Heading Font'], ['subheading_font', 'Subheading Font'], ['body_font', 'Body Font'], ['accent_font', 'Accent Font']].map(([k, label]) => (
              <div key={k}>
                <label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">{label}</label>
                <input className={inputClass} value={form[k]} onChange={e => update(k, e.target.value)} placeholder={`e.g. Cormorant Garamond`} />
              </div>
            ))}
          </div>
        </section>

        <div className="h-px bg-black/10" />

        <section>
          <h2 className="font-heading text-lg mb-4">Usage Standards</h2>
          <div className="space-y-4">
            {[
              ['logo_usage_notes', 'Logo Usage', 4],
              ['color_usage_notes', 'Color Usage', 3],
              ['typography_notes', 'Typography Notes', 3],
              ['photography_style', 'Photography Style', 3],
              ['tone_notes', 'Tone & Voice Notes', 4],
              ['brand_dont_list', "Brand Don'ts", 4],
              ['additional_standards', 'Additional Standards', 5],
            ].map(([k, label, rows]) => (
              <div key={k}>
                <label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">{label}</label>
                <textarea className={textareaClass} rows={rows} value={form[k]} onChange={e => update(k, e.target.value)} placeholder={`Enter ${label.toLowerCase()}...`} />
              </div>
            ))}
          </div>
        </section>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs uppercase tracking-widest text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}
        >
          {saved ? <Check className="w-4 h-4" /> : null}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Guidelines'}
        </button>
      </div>
    </div>
  );
}