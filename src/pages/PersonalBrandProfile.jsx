import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, Plus, X, Check } from 'lucide-react';

export default function PersonalBrandProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const init = {
    first_name: '', last_name: '', headshot_urls: [], short_bio: '', long_bio: '',
    logo_urls: [], speaker_one_sheet_url: '', feature_links: [], phone: '', email: '',
    website: '', social_links: [], heading_font: '', subheading_font: '', body_font: '',
    accent_font: '', brand_voice: '', brand_tonality: '', brand_prompts: '', brand_specs: '', positioning: ''
  };
  const [form, setForm] = useState(init);

  useEffect(() => {
    base44.entities.PersonalBrandProfile.filter({}, '-created_date', 1)
      .then(p => {
        const r = p?.[0] || null;
        setProfile(r);
        if (r) setForm({ ...init, ...r });
      })
      .finally(() => setLoading(false));
  }, []);

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const updateItem = (k, i, f, v) => setForm(prev => ({ ...prev, [k]: prev[k].map((item, idx) => idx === i ? { ...item, [f]: v } : item) }));
  const addItem = (k, obj) => setForm(prev => ({ ...prev, [k]: [...prev[k], obj] }));
  const removeItem = (k, i) => setForm(prev => ({ ...prev, [k]: prev[k].filter((_, idx) => idx !== i) }));

  const handleUpload = async (key, file) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, [key]: [...(prev[key] || []), file_url] }));
  };

  const handleOneSheetUpload = async (file) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update('speaker_one_sheet_url', file_url);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (profile?.id) {
        await base44.entities.PersonalBrandProfile.update(profile.id, form);
      } else {
        const created = await base44.entities.PersonalBrandProfile.create(form);
        setProfile(created);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (_) {}
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;

  const inputClass = "w-full rounded-xl px-4 py-2.5 text-sm text-[#1a1420] bg-white border border-black/10 placeholder:text-black/30 outline-none focus:border-[#b3232c] transition-colors";
  const textareaClass = "w-full rounded-xl px-4 py-3 text-sm text-[#1a1420] bg-white border border-black/10 placeholder:text-black/30 outline-none focus:border-[#b3232c] transition-colors resize-none";

  return (
    <div className="max-w-3xl animate-fade-in">
      <div className="mb-6">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#d9c9a3]">Brand Portal</span>
        <h1 className="font-heading text-3xl font-light text-[#f7f2ea] mt-1 mb-1">Personal <span className="molten-text italic">Brand</span></h1>
        <p className="text-sm text-[#f7f2ea]/60">Your personal identity, bio, fonts, voice, and assets.</p>
      </div>

      <div className="editorial-container space-y-8">

        {/* Basics */}
        <section>
          <h2 className="font-heading text-lg mb-4">Identity</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">First Name</label><input className={inputClass} value={form.first_name} onChange={e => update('first_name', e.target.value)} /></div>
              <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Last Name</label><input className={inputClass} value={form.last_name} onChange={e => update('last_name', e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Email</label><input className={inputClass} value={form.email} onChange={e => update('email', e.target.value)} /></div>
              <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Phone</label><input className={inputClass} value={form.phone} onChange={e => update('phone', e.target.value)} /></div>
            </div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Website</label><input className={inputClass} value={form.website} onChange={e => update('website', e.target.value)} placeholder="https://" /></div>
          </div>
        </section>

        <div className="h-px bg-black/10" />

        {/* Font Kit */}
        <section>
          <h2 className="font-heading text-lg mb-4">Font Kit</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Heading Font</label><input className={inputClass} value={form.heading_font} onChange={e => update('heading_font', e.target.value)} placeholder="e.g. Cormorant Garamond" /></div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Subheading Font</label><input className={inputClass} value={form.subheading_font} onChange={e => update('subheading_font', e.target.value)} placeholder="e.g. Playfair Display" /></div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Body Font</label><input className={inputClass} value={form.body_font} onChange={e => update('body_font', e.target.value)} placeholder="e.g. Urbanist" /></div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Accent Font</label><input className={inputClass} value={form.accent_font} onChange={e => update('accent_font', e.target.value)} placeholder="e.g. Sacramento" /></div>
          </div>
        </section>

        <div className="h-px bg-black/10" />

        {/* Voice & Strategy */}
        <section>
          <h2 className="font-heading text-lg mb-4">Voice & Strategy</h2>
          <div className="space-y-4">
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Brand Voice</label><textarea className={textareaClass} rows={3} value={form.brand_voice} onChange={e => update('brand_voice', e.target.value)} placeholder="How do you sound? What's your communication style?" /></div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Tonality</label><textarea className={textareaClass} rows={3} value={form.brand_tonality} onChange={e => update('brand_tonality', e.target.value)} placeholder="Describe the emotional register and energy of your brand..." /></div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Positioning</label><textarea className={textareaClass} rows={3} value={form.positioning} onChange={e => update('positioning', e.target.value)} placeholder="How are you positioned in the market? What's your unique stance?" /></div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Brand Prompts / AI Context</label><textarea className={textareaClass} rows={4} value={form.brand_prompts} onChange={e => update('brand_prompts', e.target.value)} placeholder="Key phrases, descriptors, and context for AI tools to accurately represent your brand..." /></div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Brand Specs</label><textarea className={textareaClass} rows={4} value={form.brand_specs} onChange={e => update('brand_specs', e.target.value)} placeholder="Technical or strategic brand specifications for designers and marketing teams..." /></div>
          </div>
        </section>

        <div className="h-px bg-black/10" />

        {/* Bios */}
        <section>
          <h2 className="font-heading text-lg mb-4">Bios</h2>
          <div className="space-y-4">
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Short Bio</label><input className={inputClass} value={form.short_bio} onChange={e => update('short_bio', e.target.value)} placeholder="One or two sentence bio..." /></div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Long Bio</label><textarea className={textareaClass} rows={6} value={form.long_bio} onChange={e => update('long_bio', e.target.value)} placeholder="Full bio for press kits, speaking introductions, etc." /></div>
          </div>
        </section>

        <div className="h-px bg-black/10" />

        {/* Headshots */}
        <section>
          <h2 className="font-heading text-lg mb-4">Headshots</h2>
          <div className="flex flex-wrap gap-3">
            {form.headshot_urls.map((url, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-black/10">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button onClick={() => removeItem('headshot_urls', i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"><X className="w-3 h-3" /></button>
              </div>
            ))}
            <label className="w-20 h-20 rounded-xl border border-dashed border-black/20 flex items-center justify-center cursor-pointer hover:border-[#b3232c] transition-colors">
              <Upload className="w-4 h-4 opacity-40" />
              <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && handleUpload('headshot_urls', e.target.files[0])} />
            </label>
          </div>
        </section>

        <div className="h-px bg-black/10" />

        {/* Logos */}
        <section>
          <h2 className="font-heading text-lg mb-4">Logos</h2>
          <div className="flex flex-wrap gap-3">
            {form.logo_urls.map((url, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-black/10 bg-white">
                <img src={url} alt="" className="w-full h-full object-contain p-1" />
                <button onClick={() => removeItem('logo_urls', i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"><X className="w-3 h-3" /></button>
              </div>
            ))}
            <label className="w-20 h-20 rounded-xl border border-dashed border-black/20 flex items-center justify-center cursor-pointer hover:border-[#b3232c] transition-colors">
              <Upload className="w-4 h-4 opacity-40" />
              <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && handleUpload('logo_urls', e.target.files[0])} />
            </label>
          </div>
        </section>

        <div className="h-px bg-black/10" />

        {/* Speaker One Sheet */}
        <section>
          <h2 className="font-heading text-lg mb-2">Speaker One Sheet</h2>
          {form.speaker_one_sheet_url ? (
            <div className="flex items-center gap-3">
              <a href={form.speaker_one_sheet_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-black/10 text-sm text-[#1a1420] hover:border-[#b3232c] transition-colors">
                View Speaker One Sheet
              </a>
              <button onClick={() => update('speaker_one_sheet_url', '')} className="text-xs text-red-700/60 hover:text-red-700 transition-colors">Remove</button>
            </div>
          ) : (
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-black/20 text-sm text-[#1a1420]/50 hover:border-[#b3232c] hover:text-[#1a1420]/80 transition-colors w-fit">
              <Upload className="w-4 h-4" /> Upload Speaker One Sheet
              <input type="file" accept=".pdf,image/*" className="hidden" onChange={e => e.target.files[0] && handleOneSheetUpload(e.target.files[0])} />
            </label>
          )}
        </section>

        <div className="h-px bg-black/10" />

        {/* Social Links */}
        <section>
          <h2 className="font-heading text-lg mb-4">Social Links</h2>
          <div className="space-y-2">
            {form.social_links.map((link, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${inputClass} flex-1`} value={link.platform || ''} onChange={e => updateItem('social_links', i, 'platform', e.target.value)} placeholder="Platform" />
                <input className={`${inputClass} flex-[2]`} value={link.url || ''} onChange={e => updateItem('social_links', i, 'url', e.target.value)} placeholder="URL" />
                <button onClick={() => removeItem('social_links', i)} className="px-2 text-black/30 hover:text-black/60"><X className="w-4 h-4" /></button>
              </div>
            ))}
            <button onClick={() => addItem('social_links', { platform: '', url: '' })} className="flex items-center gap-1.5 text-sm text-[#b3232c] hover:opacity-80 transition-opacity"><Plus className="w-4 h-4" /> Add Social</button>
          </div>
        </section>

        <div className="h-px bg-black/10" />

        {/* Feature Links */}
        <section>
          <h2 className="font-heading text-lg mb-4">Custom Links</h2>
          <div className="space-y-2">
            {form.feature_links.map((link, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${inputClass} flex-1`} value={link.label || ''} onChange={e => updateItem('feature_links', i, 'label', e.target.value)} placeholder="Label" />
                <input className={`${inputClass} flex-[2]`} value={link.url || ''} onChange={e => updateItem('feature_links', i, 'url', e.target.value)} placeholder="URL" />
                <button onClick={() => removeItem('feature_links', i)} className="px-2 text-black/30 hover:text-black/60"><X className="w-4 h-4" /></button>
              </div>
            ))}
            {form.feature_links.length < 5 && (
              <button onClick={() => addItem('feature_links', { label: '', url: '' })} className="flex items-center gap-1.5 text-sm text-[#b3232c] hover:opacity-80 transition-opacity"><Plus className="w-4 h-4" /> Add Link</button>
            )}
          </div>
        </section>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs uppercase tracking-widest text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}
        >
          {saved ? <Check className="w-4 h-4" /> : null}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Personal Brand'}
        </button>
      </div>
    </div>
  );
}