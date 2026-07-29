import React, { useState, useEffect } from 'react';
import { User as UserIcon, Bug, Trash2, AlertTriangle, Upload, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [headshot, setHeadshot] = useState(null);
  const [headshotUrl, setHeadshotUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [bugReport, setBugReport] = useState('');
  const [bugSubmitted, setBugSubmitted] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteText, setDeleteText] = useState('');

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setFirstName(u.first_name || '');
      setLastName(u.last_name || '');
      setPhone(u.phone || '');
      setHeadshotUrl(u.headshot_image_url || '');
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = { first_name: firstName, last_name: lastName, phone };
      if (headshot) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: headshot });
        data.headshot_image_url = file_url;
        setHeadshotUrl(file_url);
      }
      await base44.auth.updateMe(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {}
    setSaving(false);
  };

  const handleBugReport = async () => {
    if (!bugReport.trim()) return;
    await base44.entities.BugReport.create({ description: bugReport });
    setBugReport('');
    setBugSubmitted(true);
    setTimeout(() => setBugSubmitted(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-fade-in">
      <div>
        <h1 className="font-heading text-3xl font-light text-foreground mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences.</p>
      </div>

      {/* Profile */}
      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-primary" strokeWidth={1.5} />
          <h2 className="font-heading text-lg text-foreground">Profile</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full border border-border flex items-center justify-center bg-card overflow-hidden">
            {headshotUrl ? <img src={headshotUrl} alt="" className="w-full h-full object-cover" style={{ filter: 'grayscale(100%)' }} /> : <span className="font-heading text-lg text-foreground">{(firstName?.[0] || 'U').toUpperCase()}</span>}
          </div>
          <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
            <Upload className="w-3.5 h-3.5" /> Upload Headshot
            <input type="file" accept="image/*" className="hidden" onChange={e => setHeadshot(e.target.files[0])} />
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">First Name</Label><Input value={firstName} onChange={e => setFirstName(e.target.value)} className="bg-card" /></div>
          <div><Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Last Name</Label><Input value={lastName} onChange={e => setLastName(e.target.value)} className="bg-card" /></div>
          <div><Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Email</Label><Input value={user?.email || ''} disabled className="bg-card opacity-60" /></div>
          <div><Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} className="bg-card" /></div>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 forged-gradient rounded-lg text-xs uppercase tracking-widest text-white disabled:opacity-50">
          {saved ? <Check className="w-4 h-4" /> : null}{saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </section>

      <div className="h-px bg-border" />

      {/* Bug Report */}
      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-primary" strokeWidth={1.5} />
          <h2 className="font-heading text-lg text-foreground">Report a Bug</h2>
        </div>
        <Textarea value={bugReport} onChange={e => setBugReport(e.target.value)} placeholder="Describe the issue you encountered..." rows={4} className="bg-card" />
        <button onClick={handleBugReport} disabled={!bugReport.trim()} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
          {bugSubmitted ? <Check className="w-3.5 h-3.5" /> : <Bug className="w-3.5 h-3.5" />}{bugSubmitted ? 'Submitted!' : 'Submit Report'}
        </button>
      </section>

      <div className="h-px bg-border" />

      {/* Delete Account */}
      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-destructive" strokeWidth={1.5} />
          <h2 className="font-heading text-lg text-foreground">Delete Account</h2>
        </div>
        {!showDelete ? (
          <button onClick={() => setShowDelete(true)} className="flex items-center gap-2 px-4 py-2 border border-destructive/30 rounded-lg text-xs uppercase tracking-widest text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /> Delete My Account</button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-destructive/5 rounded-lg border border-destructive/20">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div><p className="text-sm text-foreground font-medium">This action is permanent and cannot be undone.</p><p className="text-xs text-muted-foreground mt-1">All your data will be permanently removed.</p></div>
            </div>
            <div><Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Type "DELETE" to confirm</Label><Input value={deleteText} onChange={e => setDeleteText(e.target.value)} className="bg-card" /></div>
            <div className="flex items-center gap-3">
              <button disabled={deleteText !== 'DELETE'} className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-xs uppercase tracking-widest disabled:opacity-50"><Trash2 className="w-3.5 h-3.5" /> Permanently Delete</button>
              <button onClick={() => { setShowDelete(false); setDeleteText(''); }} className="px-4 py-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}