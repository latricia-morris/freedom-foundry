import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Plus, X, Check, Link2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function PersonalBrandProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.entities.PersonalBrandProfile.filter({}, '-created_date', 1)
      .then(p => setProfile(p?.[0] || null))
      .finally(() => setLoading(false));
  }, []);

  const init = { first_name: '', last_name: '', headshot_urls: [], short_bio: '', long_bio: '', logo_urls: [], speaker_one_sheet_url: '', feature_links: [], phone: '', email: '', website: '', social_links: [] };
  const [form, setForm] = useState(init);

  useEffect(() => {
    if (profile) setForm({ ...init, ...profile });
  }, [profile]);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const updateArrayItem = (key, index, field, val) => setForm(prev => ({ ...prev, [key]: prev[key].map((item, i) => i === index ? { ...item, [field]: val } : item) }));
  const addArrayItem = (key, obj) => setForm(prev => ({ ...prev, [key]: [...prev[key], obj] }));
  const removeArrayItem = (key, index) => setForm(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));

  const handleUpload = async (key, file) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, [key]: [...prev[key], file_url] }));
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
    } catch (e) {}
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <Link to="/brand-portal" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Brand Portal
      </Link>

      <div className="editorial-container">
        <h1 className="text-2xl mb-1">Personal Brand Profile</h1>
        <p className="text-sm mb-8 opacity-70">Your personal identity, bio, and assets.</p>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">First Name</label>
              <input value={form.first_name} onChange={e => update('first_name', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">Last Name</label>
              <input value={form.last_name} onChange={e => update('last_name', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input value={form.email} onChange={e => update('email', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">Phone</label>
              <input value={form.phone} onChange={e => update('phone', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Website</label>
            <input value={form.website} onChange={e => update('website', e.target.value)} placeholder="https://" />
          </div>

          <div>
            <label className="block text-sm mb-1">Short Bio</label>
            <input value={form.short_bio} onChange={e => update('short_bio', e.target.value)} placeholder="One-line bio" />
          </div>

          <div>
            <label className="block text-sm mb-1">Long Bio</label>
            <textarea value={form.long_bio} onChange={e => update('long_bio', e.target.value)} rows={5} />
          </div>

          <div>
            <label className="block text-sm mb-1">Speaker One-Sheet URL</label>
            <input value={form.speaker_one_sheet_url} onChange={e => update('speaker_one_sheet_url', e.target.value)} placeholder="https://" />
          </div>

          {/* Headshots */}
          <div>
            <label className="block text-sm mb-2">Headshots</label>
            <div className="flex flex-wrap gap-3 mb-2">
              {form.headshot_urls.map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-black/10">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeArrayItem('headshot_urls', i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center"><X className="w-3 h-3" /></button>
                </div>
              ))}
              <label className="w-20 h-20 rounded-lg border border-dashed border-black/20 flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                <Upload className="w-4 h-4 opacity-50" />
                <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload('headshot_urls', e.target.files[0])} />
              </label>
            </div>
          </div>

          {/* Logos */}
          <div>
            <label className="block text-sm mb-2">Logos</label>
            <div className="flex flex-wrap gap-3 mb-2">
              {form.logo_urls.map((url, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-black/10 bg-white">
                  <img src={url} alt="" className="w-full h-full object-contain p-1" />
                  <button onClick={() => removeArrayItem('logo_urls', i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center"><X className="w-3 h-3" /></button>
                </div>
              ))}
              <label className="w-20 h-20 rounded-lg border border-dashed border-black/20 flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                <Upload className="w-4 h-4 opacity-50" />
                <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload('logo_urls', e.target.files[0])} />
              </label>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <label className="block text-sm mb-2">Social Links</label>
            <div className="space-y-2">
              {form.social_links.map((link, i) => (
                <div key={i} className="flex gap-2">
                  <input value={link.platform || ''} onChange={e => updateArrayItem('social_links', i, 'platform', e.target.value)} placeholder="Platform" className="flex-1" />
                  <input value={link.url || ''} onChange={e => updateArrayItem('social_links', i, 'url', e.target.value)} placeholder="URL" className="flex-1" />
                  <button onClick={() => removeArrayItem('social_links', i)} className="px-2"><X className="w-4 h-4 opacity-50" /></button>
                </div>
              ))}
              <button onClick={() => addArrayItem('social_links', { platform: '', url: '' })} className="flex items-center gap-1 text-sm text-primary"><Plus className="w-4 h-4" /> Add Link</button>
            </div>
          </div>

          {/* Feature Links */}
          <div>
            <label className="block text-sm mb-2">Feature Links</label>
            <div className="space-y-2">
              {form.feature_links.map((link, i) => (
                <div key={i} className="flex gap-2">
                  <input value={link.label || ''} onChange={e => updateArrayItem('feature_links', i, 'label', e.target.value)} placeholder="Label" className="flex-1" />
                  <input value={link.url || ''} onChange={e => updateArrayItem('feature_links', i, 'url', e.target.value)} placeholder="URL" className="flex-1" />
                  <button onClick={() => removeArrayItem('feature_links', i)} className="px-2"><X className="w-4 h-4 opacity-50" /></button>
                </div>
              ))}
              <button onClick={() => addArrayItem('feature_links', { label: '', url: '' })} className="flex items-center gap-1 text-sm text-primary"><Plus className="w-4 h-4" /> Add Feature</button>
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 forged-gradient rounded-lg text-xs uppercase tracking-widest text-white disabled:opacity-50">
            {saved ? <Check className="w-4 h-4" /> : null}{saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}