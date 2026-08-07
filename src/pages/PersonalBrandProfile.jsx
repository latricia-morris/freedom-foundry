import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, Plus, X, Check } from 'lucide-react';
import PrivacyNote from '@/components/brand/PrivacyNote';
import AssetPreview from '@/components/brand/AssetPreview';
import BookLinks from '@/components/brand/BookLinks';

const FILE_ACCEPT = ".png,.jpg,.jpeg,.pdf,.ai,.eps,.webp";

export default function PersonalBrandProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const init = {
    first_name: '', last_name: '', business_name: '', headshot_urls: [], short_bio: '', long_bio: '',
    logo_urls: [], feature_links: [], phone: '', email: '', website: '',
    social_links: [], location_city: '', location_state: '', location_country: '',
    has_books: false, book_links: [],
    heading_font: '', subheading_font: '', body_font: '', accent_font: '',
    brand_voice: '', brand_tonality: '', brand_prompts: '', brand_specs: '', positioning: ''
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
  const textareaClass = "w-full rounded-xl px-4 py-3 text-sm text-[#1a1420] bg-white border border-black/10 placeholder:text-black/30 outline-none focus:border-[#b3232c] transition-colors resize-y";

  return (
    <div className="max-w-3xl animate-fade-in">
      <div className="mb-6">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#d9c9a3]">Brand Portal</span>
        <h1 className="font-heading text-3xl font-light text-[#f7f2ea] mt-1 mb-1">Personal <span className="molten-text italic">Brand</span></h1>
        <p className="text-sm text-[#f7f2ea]/60">Your personal identity, bio, fonts, voice, and assets.</p>
      </div>

      <PrivacyNote />

      <div className="editorial-container space-y-8">

        {/* Identity */}
        <section>
          <h2 className="font-heading text-lg mb-4">Identity</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">First Name</label><input className={inputClass} value={form.first_name} onChange={e => update('first_name', e.target.value)} /></div>
              <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Last Name</label><input className={inputClass} value={form.last_name} onChange={e => update('last_name', e.target.value)} /></div>
            </div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Business Name</label><input className={inputClass} value={form.business_name} onChange={e => update('business_name', e.target.value)} placeholder="Your business or practice name" /></div>
          </div>
        </section>

        <div className="h-px bg-black/10" />

        {/* Contact */}
        <section>
          <h2 className="font-heading text-lg mb-4">Contact</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Email</label><input className={inputClass} value={form.email} onChange={e => update('email', e.target.value)} /></div>
              <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Phone (with country code)</label><input className={inputClass} value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+1 555-555-5555" /></div>
            </div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Website</label><input className={inputClass} value={form.website} onChange={e => update('website', e.target.value)} placeholder="https://" /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">City</label><input className={inputClass} value={form.location_city} onChange={e => update('location_city', e.target.value)} /></div>
              <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">State / Region</label><input className={inputClass} value={form.location_state} onChange={e => update('location_state', e.target.value)} /></div>
              <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Country</label><input className={inputClass} value={form.location_country} onChange={e => update('location_country', e.target.value)} /></div>
            </div>
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
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Short Bio</label><textarea className={textareaClass} rows={3} value={form.short_bio} onChange={e => update('short_bio', e.target.value)} placeholder="One or two sentence bio..." /></div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Long Bio</label><textarea className={textareaClass} rows={8} value={form.long_bio} onChange={e => update('long_bio', e.target.value)} placeholder="Full bio for press kits, speaking introductions, etc." /></div>
          </div>
        </section>

        <div className="h-px bg-black/10" />

        {/* Headshots — up to 12 */}
        <section>
          <h2 className="font-heading text-lg mb-4">Headshots <span className="font-body text-sm text-[#1a1420]/40 font-normal">(up to 12)</span></h2>
          <div className="flex flex-wrap gap-3">
            {form.headshot_urls.map((url, i) => (
              <AssetPreview key={i} url={url} size="md" onRemove={() => removeItem('headshot_urls', i)} />
            ))}
            {form.headshot_urls.length < 12 && (
              <label className="w-20 h-20 rounded-xl border border-dashed border-black/20 flex items-center justify-center cursor-pointer hover:border-[#b3232c] transition-colors">
                <Upload className="w-4 h-4 opacity-40" />
                <input type="file" accept={FILE_ACCEPT} className="hidden" onChange={e => e.target.files[0] && handleUpload('headshot_urls', e.target.files[0])} />
              </label>
            )}
          </div>
        </section>

        <div className="h-px bg-black/10" />

        {/* Logos — up to 12 */}
        <section>
          <h2 className="font-heading text-lg mb-4">Logos <span className="font-body text-sm text-[#1a1420]/40 font-normal">(up to 12)</span></h2>
          <div className="flex flex-wrap gap-3">
            {form.logo_urls.map((url, i) => (
              <AssetPreview key={i} url={url} size="md" contain onRemove={() => removeItem('logo_urls', i)} />
            ))}
            {form.logo_urls.length < 12 && (
              <label className="w-20 h-20 rounded-xl border border-dashed border-black/20 flex items-center justify-center cursor-pointer hover:border-[#b3232c] transition-colors">
                <Upload className="w-4 h-4 opacity-40" />
                <input type="file" accept={FILE_ACCEPT} className="hidden" onChange={e => e.target.files[0] && handleUpload('logo_urls', e.target.files[0])} />
              </label>
            )}
          </div>
        </section>

        <div className="h-px bg-black/10" />

        {/* Books */}
        <section>
          <h2 className="font-heading text-lg mb-4">Published Books</h2>
          <BookLinks
            hasBooks={form.has_books}
            bookLinks={form.book_links}
            onToggle={v => update('has_books', v)}
            onUpdate={(i, f, v) => updateItem('book_links', i, f, v)}
            onAdd={() => addItem('book_links', { title: '', url: '' })}
            onRemove={i => removeItem('book_links', i)}
          />
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

        {/* Custom Links */}
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