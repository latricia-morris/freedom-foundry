import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, Plus, X, Check, Sun, Moon, Share2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { createShareLink } from '@/lib/shareUtils';
import PrivacyNote from '@/components/brand/PrivacyNote';
import SetupTaskFooter from '@/components/brand/SetupTaskFooter';
import AssetPreview from '@/components/brand/AssetPreview';
import BookLinks from '@/components/brand/BookLinks';

const FILE_ACCEPT = ".png,.jpg,.jpeg,.pdf,.ai,.eps,.webp";

export default function CorporateBrandProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [lightMode, setLightMode] = useState(false);
  const [shareLink, setShareLink] = useState(null);
  const [generatingShare, setGeneratingShare] = useState(false);

  const init = {
    company_name: '', tagline: '', mission_statement: '', phone: '', email: '', website: '',
    location_city: '', location_state: '', location_country: '',
    has_books: false, book_links: [],
    heading_font: '', subheading_font: '', body_font: '', accent_font: '',
    colors: [], logo_urls: [], moodboard_urls: [],
    brand_voice: '', brand_tonality: '', brand_personality: '', brand_prompts: '',
    brand_specs: '', positioning: '', target_audience: ''
  };
  const [form, setForm] = useState(init);

  useEffect(() => {
    base44.entities.CorporateBrandProfile.filter({}, '-created_date', 1)
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
        await base44.entities.CorporateBrandProfile.update(profile.id, form);
      } else {
        const created = await base44.entities.CorporateBrandProfile.create(form);
        setProfile(created);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (_) {}
    setSaving(false);
  };

  const handleShare = async () => {
    setGeneratingShare(true);
    try {
      const brandName = form.company_name || 'member';
      const url = await createShareLink('corporate', profile.id, brandName);
      setShareLink(url);
      try { await navigator.clipboard.writeText(url); } catch (_) {}
      toast({ title: 'Share link copied!', description: 'Your corporate brand link is ready.' });
    } catch (_) { toast({ title: 'Could not generate link', variant: 'destructive' }); }
    setGeneratingShare(false);
  };

  const profileRef = useRef(profile);
  profileRef.current = profile;
  const isInitialLoad = useRef(true);
  useEffect(() => {
    if (loading) return;
    if (isInitialLoad.current) { isInitialLoad.current = false; return; }
    const timer = setTimeout(async () => {
      try {
        if (profileRef.current?.id) {
          await base44.entities.CorporateBrandProfile.update(profileRef.current.id, form);
        } else {
          const created = await base44.entities.CorporateBrandProfile.create(form);
          setProfile(created);
        }
      } catch (_) {}
    }, 2000);
    return () => clearTimeout(timer);
  }, [form, loading]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;

  const inputClass = "w-full rounded-xl px-4 py-2.5 text-sm text-[#1a1420] bg-white border border-black/10 placeholder:text-black/30 outline-none focus:border-[#b3232c] transition-colors";
  const textareaClass = "w-full rounded-xl px-4 py-3 text-sm text-[#1a1420] bg-white border border-black/10 placeholder:text-black/30 outline-none focus:border-[#b3232c] transition-colors resize-y";

  return (
    <div className="max-w-3xl animate-fade-in">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#d9c9a3]">Brand Portal</span>
          <h1 className="font-heading text-3xl font-light text-[#f7f2ea] mt-1 mb-1">Corporate <span className="molten-text italic">Brand</span></h1>
          <p className="text-sm text-[#f7f2ea]/60">Company identity, colors, typography, and brand strategy.</p>
        </div>
        <div className="flex items-center gap-3 mt-1">
          {profile?.id && (
            <button onClick={handleShare} disabled={generatingShare} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm text-[#f7f2ea]/70 hover:text-[#f7f2ea] hover:border-white/20 transition-colors disabled:opacity-40 whitespace-nowrap">
              <Share2 className="w-4 h-4" /> {generatingShare ? 'Generating...' : 'Share'}
            </button>
          )}
          <button onClick={() => setLightMode(!lightMode)} className="flex items-center gap-1.5 text-xs text-[#f7f2ea]/40 hover:text-[#f7f2ea]/70 transition-colors">
            {lightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span className="hidden sm:inline">{lightMode ? 'Dark' : 'Light'}</span>
          </button>
        </div>
      </div>

      {shareLink && (
        <div className="mb-6 p-4 rounded-xl border border-white/10 bg-white/[0.03] flex items-center gap-3">
          <span className="text-sm text-[#f7f2ea]/70 flex-1 truncate">{shareLink}</span>
          <button onClick={() => { navigator.clipboard.writeText(shareLink); toast({ title: 'Copied!' }); }} className="text-xs text-[#f7f2ea]/50 hover:text-[#f7f2ea] transition-colors">Copy</button>
        </div>
      )}

      <PrivacyNote />

      <div className="editorial-container space-y-8">

        {/* Company Identity */}
        <section>
          <h2 className="font-heading text-lg mb-4">Company Identity</h2>
          <div className="space-y-4">
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Company Name</label><input className={inputClass} value={form.company_name} onChange={e => update('company_name', e.target.value)} /></div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Tagline</label><input className={inputClass} value={form.tagline} onChange={e => update('tagline', e.target.value)} /></div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Mission Statement</label><textarea className={textareaClass} rows={3} value={form.mission_statement} onChange={e => update('mission_statement', e.target.value)} /></div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Target Audience</label><textarea className={textareaClass} rows={3} value={form.target_audience} onChange={e => update('target_audience', e.target.value)} placeholder="Who does this brand serve?" /></div>
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

        {/* Colors */}
        <section>
          <h2 className="font-heading text-lg mb-4">Brand Colors</h2>
          <div className="space-y-2">
            {form.colors.map((color, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input type="color" value={color.hex || '#000000'} onChange={e => updateItem('colors', i, 'hex', e.target.value)} className="w-12 h-10 rounded-lg border border-black/10 cursor-pointer" />
                <input className={`${inputClass} flex-1`} value={color.name || ''} onChange={e => updateItem('colors', i, 'name', e.target.value)} placeholder="Color name" />
                <input className={`${inputClass} w-32`} value={color.hex || ''} onChange={e => updateItem('colors', i, 'hex', e.target.value)} placeholder="#000000" />
                <button onClick={() => removeItem('colors', i)} className="px-2 text-black/30 hover:text-black/60"><X className="w-4 h-4" /></button>
              </div>
            ))}
            <button onClick={() => addItem('colors', { name: '', hex: '#000000' })} className="flex items-center gap-1.5 text-sm text-[#b3232c] hover:opacity-80 transition-opacity"><Plus className="w-4 h-4" /> Add Color</button>
          </div>
        </section>

        <div className="h-px bg-black/10" />

        {/* Voice & Strategy */}
        <section>
          <h2 className="font-heading text-lg mb-4">Voice & Strategy</h2>
          <div className="space-y-4">
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Brand Voice</label><textarea className={textareaClass} rows={3} value={form.brand_voice} onChange={e => update('brand_voice', e.target.value)} placeholder="Describe how the brand communicates..." /></div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Tonality</label><textarea className={textareaClass} rows={3} value={form.brand_tonality} onChange={e => update('brand_tonality', e.target.value)} placeholder="The emotional register and energy..." /></div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Brand Personality</label><textarea className={textareaClass} rows={3} value={form.brand_personality} onChange={e => update('brand_personality', e.target.value)} placeholder="Key personality traits..." /></div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Positioning</label><textarea className={textareaClass} rows={3} value={form.positioning} onChange={e => update('positioning', e.target.value)} placeholder="Market position and differentiation..." /></div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Brand Prompts / AI Context</label><textarea className={textareaClass} rows={4} value={form.brand_prompts} onChange={e => update('brand_prompts', e.target.value)} placeholder="Key phrases and context for AI tools..." /></div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Brand Specs</label><textarea className={textareaClass} rows={4} value={form.brand_specs} onChange={e => update('brand_specs', e.target.value)} placeholder="Technical brand specifications for designers and marketing teams..." /></div>
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

        {/* Moodboard */}
        <section>
          <h2 className="font-heading text-lg mb-4">Mood Board</h2>
          <div className="flex flex-wrap gap-3">
            {form.moodboard_urls.map((url, i) => (
              <AssetPreview key={i} url={url} size="lg" onRemove={() => removeItem('moodboard_urls', i)} />
            ))}
            <label className="w-24 h-24 rounded-xl border border-dashed border-black/20 flex items-center justify-center cursor-pointer hover:border-[#b3232c] transition-colors">
              <Upload className="w-4 h-4 opacity-40" />
              <input type="file" accept={FILE_ACCEPT} className="hidden" onChange={e => e.target.files[0] && handleUpload('moodboard_urls', e.target.files[0])} />
            </label>
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

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs uppercase tracking-widest text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}
        >
          {saved ? <Check className="w-4 h-4" /> : null}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Corporate Brand'}
        </button>

        <SetupTaskFooter taskKey="corporate" form={form} onSave={handleSave} />
      </div>
    </div>
  );
}