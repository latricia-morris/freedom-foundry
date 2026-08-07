import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, Plus, X, Check, Copy, Share2, ExternalLink, Sparkles } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import PrivacyNote from '@/components/brand/PrivacyNote';
import AssetPreview from '@/components/brand/AssetPreview';
import BookLinks from '@/components/brand/BookLinks';

const FILE_ACCEPT = ".png,.jpg,.jpeg,.pdf,.ai,.eps,.webp";

export default function MediaKit() {
  const [kit, setKit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareLink, setShareLink] = useState(null);
  const [generatingShare, setGeneratingShare] = useState(false);
  const [populated, setPopulated] = useState(false);

  const init = {
    first_name: '', last_name: '', business_name: '', short_bio: '', long_bio: '',
    headshot_urls: [], logo_urls: [], phone: '', email: '', website: '',
    social_links: [], feature_links: [],
    location_city: '', location_state: '', location_country: '',
    has_books: false, book_links: []
  };
  const [form, setForm] = useState(init);

  useEffect(() => {
    base44.entities.MediaKit.filter({}, '-created_date', 1)
      .then(r => {
        const rec = r?.[0] || null;
        setKit(rec);
        if (rec) setForm({ ...init, ...rec });
      })
      .catch(() => {})
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

  const handlePopulateFromPersonal = async () => {
    try {
      const personal = await base44.entities.PersonalBrandProfile.filter({}, '-created_date', 1);
      const p = personal?.[0];
      if (!p) {
        toast({ title: "No Personal Brand found", description: "Fill out your Personal Brand page first." });
        return;
      }
      setForm(prev => ({
        ...prev,
        first_name: prev.first_name || p.first_name || '',
        last_name: prev.last_name || p.last_name || '',
        business_name: prev.business_name || p.business_name || '',
        short_bio: prev.short_bio || p.short_bio || '',
        long_bio: prev.long_bio || p.long_bio || '',
        headshot_urls: prev.headshot_urls?.length ? prev.headshot_urls : (p.headshot_urls || []),
        logo_urls: prev.logo_urls?.length ? prev.logo_urls : (p.logo_urls || []),
        phone: prev.phone || p.phone || '',
        email: prev.email || p.email || '',
        website: prev.website || p.website || '',
        social_links: prev.social_links?.length ? prev.social_links : (p.social_links || []),
        feature_links: prev.feature_links?.length ? prev.feature_links : (p.feature_links || []),
        location_city: prev.location_city || p.location_city || '',
        location_state: prev.location_state || p.location_state || '',
        location_country: prev.location_country || p.location_country || '',
        has_books: prev.has_books || p.has_books || false,
        book_links: prev.book_links?.length ? prev.book_links : (p.book_links || []),
      }));
      setPopulated(true);
      toast({ title: "Populated from Personal Brand", description: "Shared fields copied over. Review and save." });
    } catch (_) {
      toast({ title: "Could not load Personal Brand", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (kit?.id) {
        await base44.entities.MediaKit.update(kit.id, form);
      } else {
        const created = await base44.entities.MediaKit.create(form);
        setKit(created);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (_) {}
    setSaving(false);
  };

  const handleGenerateShare = async () => {
    setGeneratingShare(true);
    try {
      const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
      await base44.entities.ShareLink.create({
        token,
        profile_type: 'media_kit',
        profile_id: kit?.id || '',
        is_active: true
      });
      const url = `${window.location.origin}/share/${token}`;
      setShareLink(url);
      await navigator.clipboard.writeText(url);
      toast({ title: "Share link copied!", description: "Your media kit link is ready to share." });
    } catch (_) {}
    setGeneratingShare(false);
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!" });
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;

  const inputClass = "w-full rounded-xl px-4 py-2.5 text-sm text-[#1a1420] bg-white border border-black/10 placeholder:text-black/30 outline-none focus:border-[#b3232c] transition-colors";
  const textareaClass = "w-full rounded-xl px-4 py-3 text-sm text-[#1a1420] bg-white border border-black/10 placeholder:text-black/30 outline-none focus:border-[#b3232c] transition-colors resize-y";

  return (
    <div className="max-w-3xl animate-fade-in">
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#d9c9a3]">Brand Portal</span>
          <h1 className="font-heading text-3xl font-light text-[#f7f2ea] mt-1 mb-1">Media <span className="molten-text italic">Kit</span></h1>
          <p className="text-sm text-[#f7f2ea]/60">Press-ready bios, headshots, and contact info.</p>
        </div>
        <button
          onClick={handleGenerateShare}
          disabled={generatingShare || !kit?.id}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm text-[#f7f2ea]/70 hover:text-[#f7f2ea] hover:border-white/20 transition-colors disabled:opacity-40"
        >
          <Share2 className="w-4 h-4" />
          {generatingShare ? 'Generating...' : 'Share Media Kit'}
        </button>
      </div>

      <PrivacyNote />

      {/* Populate from Personal Brand */}
      {!populated && !kit?.id && (
        <div className="mb-6 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-[#f7f2ea]/70 font-medium">Already filled out your Personal Brand?</p>
            <p className="text-xs text-[#f7f2ea]/40 mt-0.5">Pull shared fields (name, bio, contact, headshots, books) into this media kit.</p>
          </div>
          <button
            onClick={handlePopulateFromPersonal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm whitespace-nowrap"
            style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}
          >
            <Sparkles className="w-4 h-4" /> Populate from Personal Brand
          </button>
        </div>
      )}

      {shareLink && (
        <div className="mb-6 p-4 rounded-xl border border-white/10 bg-white/[0.03] flex items-center gap-3">
          <span className="text-sm text-[#f7f2ea]/70 flex-1 truncate">{shareLink}</span>
          <button onClick={() => copyText(shareLink)} className="flex items-center gap-1.5 text-xs text-[#f7f2ea]/50 hover:text-[#f7f2ea] transition-colors"><Copy className="w-3.5 h-3.5" /> Copy</button>
          <a href={shareLink} target="_blank" rel="noopener noreferrer" className="text-[#f7f2ea]/50 hover:text-[#f7f2ea] transition-colors"><ExternalLink className="w-3.5 h-3.5" /></a>
        </div>
      )}

      <div className="editorial-container space-y-8">

        {/* Name */}
        <section>
          <h2 className="font-heading text-lg mb-4">Name</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">First Name</label><input className={inputClass} value={form.first_name} onChange={e => update('first_name', e.target.value)} /></div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Last Name</label><input className={inputClass} value={form.last_name} onChange={e => update('last_name', e.target.value)} /></div>
          </div>
          <div className="mt-4"><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Business Name</label><input className={inputClass} value={form.business_name} onChange={e => update('business_name', e.target.value)} placeholder="Your business or practice name" /></div>
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

        {/* Bios */}
        <section>
          <h2 className="font-heading text-lg mb-4">Bios</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs uppercase tracking-wider text-[#1a1420]/50">Short Bio</label>
                {form.short_bio && <button onClick={() => copyText(form.short_bio)} className="text-xs text-[#b3232c] flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</button>}
              </div>
              <textarea className={textareaClass} rows={3} value={form.short_bio} onChange={e => update('short_bio', e.target.value)} placeholder="One or two sentence bio..." />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs uppercase tracking-wider text-[#1a1420]/50">Long Bio</label>
                {form.long_bio && <button onClick={() => copyText(form.long_bio)} className="text-xs text-[#b3232c] flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</button>}
              </div>
              <textarea className={textareaClass} rows={8} value={form.long_bio} onChange={e => update('long_bio', e.target.value)} placeholder="Full bio for press, speaking, and partnerships..." />
            </div>
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

        {/* Social Links */}
        <section>
          <h2 className="font-heading text-lg mb-4">Social Links</h2>
          <div className="space-y-2">
            {form.social_links.map((link, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${inputClass} flex-1`} value={link.platform || ''} onChange={e => updateItem('social_links', i, 'platform', e.target.value)} placeholder="Platform" />
                <input className={`${inputClass} flex-[2]`} value={link.url || ''} onChange={e => updateItem('social_links', i, 'url', e.target.value)} placeholder="URL or handle" />
                {link.url && <button onClick={() => copyText(link.url)} className="px-2 text-[#1a1420]/30 hover:text-[#1a1420]/60"><Copy className="w-3.5 h-3.5" /></button>}
                <button onClick={() => removeItem('social_links', i)} className="px-2 text-[#1a1420]/30 hover:text-[#1a1420]/60"><X className="w-4 h-4" /></button>
              </div>
            ))}
            <button onClick={() => addItem('social_links', { platform: '', url: '' })} className="flex items-center gap-1.5 text-sm text-[#b3232c] hover:opacity-80 transition-opacity"><Plus className="w-4 h-4" /> Add Social</button>
          </div>
        </section>

        <div className="h-px bg-black/10" />

        {/* Custom Links — up to 5 */}
        <section>
          <h2 className="font-heading text-lg mb-4">Custom Links <span className="font-body text-sm text-[#1a1420]/40 font-normal">(up to 5)</span></h2>
          <div className="space-y-2">
            {form.feature_links.map((link, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${inputClass} flex-1`} value={link.label || ''} onChange={e => updateItem('feature_links', i, 'label', e.target.value)} placeholder="Label" />
                <input className={`${inputClass} flex-[2]`} value={link.url || ''} onChange={e => updateItem('feature_links', i, 'url', e.target.value)} placeholder="URL" />
                {link.url && <button onClick={() => copyText(link.url)} className="px-2 text-[#1a1420]/30 hover:text-[#1a1420]/60"><Copy className="w-3.5 h-3.5" /></button>}
                <button onClick={() => removeItem('feature_links', i)} className="px-2 text-[#1a1420]/30 hover:text-[#1a1420]/60"><X className="w-4 h-4" /></button>
              </div>
            ))}
            {form.feature_links.length < 5 && (
              <button onClick={() => addItem('feature_links', { label: '', url: '' })} className="flex items-center gap-1.5 text-sm text-[#b3232c] hover:opacity-80 transition-opacity"><Plus className="w-4 h-4" /> Add Link</button>
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

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs uppercase tracking-widest text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}
        >
          {saved ? <Check className="w-4 h-4" /> : null}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Media Kit'}
        </button>
      </div>
    </div>
  );
}