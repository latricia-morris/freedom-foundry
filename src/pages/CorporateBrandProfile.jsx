import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Plus, X, Check, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function CorporateBrandProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [lightMode, setLightMode] = useState(false);

  useEffect(() => {
    base44.entities.CorporateBrandProfile.filter({}, '-created_date', 1)
      .then(p => setProfile(p?.[0] || null))
      .finally(() => setLoading(false));
  }, []);

  const init = { company_name: '', tagline: '', mission_statement: '', colors: [], typography: '', logo_urls: [], moodboard_urls: [], brand_voice: '', brand_personality: '' };
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
        await base44.entities.CorporateBrandProfile.update(profile.id, form);
      } else {
        const created = await base44.entities.CorporateBrandProfile.create(form);
        setProfile(created);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {}
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className={`max-w-3xl mx-auto animate-fade-in brand-portal-page ${lightMode ? 'light-mode' : ''}`}>
      <Link to="/brand-portal" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Brand Portal
      </Link>

      <button onClick={() => setLightMode(!lightMode)} className="brand-portal-toggle">
        {lightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        {lightMode ? 'Dark View' : 'Light View'}
      </button>

      <div className="editorial-container">
        <h1 className="text-2xl mb-1">Corporate Brand Profile</h1>
        <p className="text-sm mb-8 opacity-70">Your company identity, colors, typography, and voice.</p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm mb-1">Company Name</label>
            <input value={form.company_name} onChange={e => update('company_name', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Tagline</label>
            <input value={form.tagline} onChange={e => update('tagline', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Mission Statement</label>
            <textarea value={form.mission_statement} onChange={e => update('mission_statement', e.target.value)} rows={3} />
          </div>

          {/* Colors */}
          <div>
            <label className="block text-sm mb-2">Brand Colors</label>
            <div className="space-y-2">
              {form.colors.map((color, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input type="color" value={color.hex || '#000000'} onChange={e => updateArrayItem('colors', i, 'hex', e.target.value)} className="w-12 h-10 rounded border border-black/10" />
                  <input value={color.name || ''} onChange={e => updateArrayItem('colors', i, 'name', e.target.value)} placeholder="Color name" className="flex-1" />
                  <input value={color.hex || ''} onChange={e => updateArrayItem('colors', i, 'hex', e.target.value)} placeholder="#000000" className="w-28" />
                  <button onClick={() => removeArrayItem('colors', i)} className="px-2"><X className="w-4 h-4 opacity-50" /></button>
                </div>
              ))}
              <button onClick={() => addArrayItem('colors', { name: '', hex: '#000000' })} className="flex items-center gap-1 text-sm text-primary"><Plus className="w-4 h-4" /> Add Color</button>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Typography</label>
            <input value={form.typography} onChange={e => update('typography', e.target.value)} placeholder="e.g. Cormorant Garamond / Urbanist" />
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

          {/* Moodboard */}
          <div>
            <label className="block text-sm mb-2">Mood Board</label>
            <div className="flex flex-wrap gap-3 mb-2">
              {form.moodboard_urls.map((url, i) => (
                <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-black/10">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removeArrayItem('moodboard_urls', i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center"><X className="w-3 h-3" /></button>
                </div>
              ))}
              <label className="w-24 h-24 rounded-lg border border-dashed border-black/20 flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                <Upload className="w-4 h-4 opacity-50" />
                <input type="file" accept="image/*" className="hidden" onChange={e => handleUpload('moodboard_urls', e.target.files[0])} />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Brand Voice</label>
            <textarea value={form.brand_voice} onChange={e => update('brand_voice', e.target.value)} rows={3} placeholder="Describe your brand's tone and voice..." />
          </div>
          <div>
            <label className="block text-sm mb-1">Brand Personality</label>
            <textarea value={form.brand_personality} onChange={e => update('brand_personality', e.target.value)} rows={3} placeholder="Describe your brand's personality traits..." />
          </div>

          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 forged-gradient rounded-lg text-xs uppercase tracking-widest text-white disabled:opacity-50">
            {saved ? <Check className="w-4 h-4" /> : null}{saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}