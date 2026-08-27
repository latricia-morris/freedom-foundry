import React, { useState, useEffect } from 'react';
import { User as UserIcon, Bug, Trash2, AlertTriangle, Upload, Check, Mail, Clock3, ShieldCheck } from 'lucide-react';
import apiClient from '@/api/client';
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
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [bugReport, setBugReport] = useState('');
  const [intuitTid, setIntuitTid] = useState('');
  const [bugSubmitted, setBugSubmitted] = useState(false);
  const [bugSubmitting, setBugSubmitting] = useState(false);
  const [bugError, setBugError] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [profileRecord, setProfileRecord] = useState(null);
  const [consentSaving, setConsentSaving] = useState(false);
  const [consentSaved, setConsentSaved] = useState(false);

  useEffect(() => {
    apiClient.auth.me().then(u => {
      setUser(u);
      setFirstName(u.first_name || '');
      setLastName(u.last_name || '');
      setPhone(u.phone || '');
      setHeadshotUrl(u.headshot_image_url || '');
      apiClient.entities.UserProfile.filter({}, '-created_date', 1).then(profiles => {
        const p = profiles?.[0] || null;
        setProfileRecord(p);
        setMarketingConsent(p?.marketing_consent || false);
      }).catch((e) => {
        setLoadError(e.message || 'Unable to load your profile.');
      });
    }).catch((e) => {
      setLoadError(e.message || 'Unable to load your profile.');
    });
  }, []);

  const handleConsentToggle = async () => {
    setConsentSaving(true);
    try {
      const newConsent = !marketingConsent;
      setMarketingConsent(newConsent);
      const data = { marketing_consent: newConsent, consent_date: newConsent ? new Date().toISOString() : null };
      if (profileRecord?.id) {
        await apiClient.entities.UserProfile.update(profileRecord.id, data);
      } else {
        const created = await apiClient.entities.UserProfile.create(data);
        setProfileRecord(created);
      }
      setConsentSaved(true);
      setTimeout(() => setConsentSaved(false), 2000);
    } catch (_) {}
    setConsentSaving(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setSaveError('');
    try {
      const data = { first_name: firstName, last_name: lastName, phone };
      if (headshot) {
        const { file_url } = await apiClient.integrations.Core.UploadFile({ file: headshot });
        data.headshot_image_url = file_url;
        setHeadshotUrl(file_url);
      }
      await apiClient.auth.updateMe(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setSaveError(e.message || 'Unable to save your profile. Please try again.');
    }
    setSaving(false);
  };

  const handleBugReport = async (event) => {
    event.preventDefault();
    if (!bugReport.trim() || bugSubmitting) return;
    setBugSubmitting(true);
    setBugError('');
    try {
      await apiClient.support.createReport({
        description: bugReport.trim(),
        provider: 'quickbooks',
        page_context: window.location.pathname,
        intuit_tid: intuitTid.trim() || undefined,
        occurred_at: new Date().toISOString(),
      });
      setBugReport('');
      setIntuitTid('');
      setBugSubmitted(true);
      setTimeout(() => setBugSubmitted(false), 4000);
    } catch (error) {
      setBugError(error.message || 'Unable to submit your report. Please try again.');
    } finally {
      setBugSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-light text-foreground mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <div className="editorial-container space-y-8">
        {loadError && <p role="alert" className="text-sm text-red-700">{loadError}</p>}
        {/* Profile */}
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-merlot" strokeWidth={1.5} />
            <h2 className="font-heading text-lg">Profile</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full border border-black/10 flex items-center justify-center bg-white overflow-hidden">
              {headshotUrl ? <img src={headshotUrl} alt="" className="w-full h-full object-cover" style={{ filter: 'grayscale(100%)' }} /> : <span className="font-heading text-lg">{(firstName?.[0] || 'U').toUpperCase()}</span>}
            </div>
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-black/10 rounded-lg text-xs uppercase tracking-widest text-black/50 hover:text-black transition-colors">
              <Upload className="w-3.5 h-3.5" /> Upload Headshot
              <input type="file" accept="image/*" className="hidden" onChange={e => setHeadshot(e.target.files[0])} />
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label className="text-xs uppercase tracking-wider mb-2 block">First Name</Label><Input value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
            <div><Label className="text-xs uppercase tracking-wider mb-2 block">Last Name</Label><Input value={lastName} onChange={e => setLastName(e.target.value)} /></div>
            <div><Label className="text-xs uppercase tracking-wider mb-2 block">Email</Label><Input value={user?.email || ''} disabled /></div>
            <div><Label className="text-xs uppercase tracking-wider mb-2 block">Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
          </div>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 forged-gradient rounded-lg text-xs uppercase tracking-widest text-white disabled:opacity-50">
            {saved ? <Check className="w-4 h-4" /> : null}{saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          </button>
          {saveError && <p role="alert" className="text-sm text-red-700">{saveError}</p>}
        </section>

        <div className="h-px bg-black/10" />

        {/* Email Preferences */}
        <section id="quickbooks-support" className="space-y-5 scroll-mt-6">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-merlot" strokeWidth={1.5} />
            <h2 className="font-heading text-lg">Email Preferences</h2>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl border border-black/10">
            <div>
              <p className="text-sm font-medium text-[#1a1420]">Resource Updates</p>
              <p className="text-xs text-[#1a1420]/50 mt-0.5">Receive occasional emails about new resources and content. Unsubscribe at any time.</p>
            </div>
            <button
              onClick={handleConsentToggle}
              disabled={consentSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs uppercase tracking-widest transition-colors"
              style={marketingConsent
                ? { background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)', color: '#fff' }
                : { border: '1px solid rgba(0,0,0,0.1)', color: 'rgba(26,20,32,0.5)' }}
            >
              {consentSaved && <Check className="w-3.5 h-3.5" />}
              {consentSaving ? 'Saving...' : consentSaved ? 'Saved!' : marketingConsent ? 'Subscribed' : 'Unsubscribed'}
            </button>
          </div>
        </section>

        <div className="h-px bg-black/10" />

        {/* QuickBooks support report */}
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4 text-merlot" strokeWidth={1.5} />
            <h2 className="font-heading text-lg">Report a QuickBooks Problem</h2>
          </div>
          <p className="text-sm text-[#1a1420]/65">
            Tell us what happened and we’ll include the page, time, and troubleshooting details our support team needs.
          </p>
          <form onSubmit={handleBugReport} className="space-y-4">
            <div>
              <Label htmlFor="quickbooks-problem" className="text-xs uppercase tracking-wider mb-2 block">What went wrong?</Label>
              <Textarea
                id="quickbooks-problem"
                value={bugReport}
                onChange={e => setBugReport(e.target.value)}
                placeholder="Describe the QuickBooks issue you encountered..."
                rows={5}
                maxLength={5000}
                required
              />
              <p className="mt-1 text-right text-[11px] text-[#1a1420]/45">{bugReport.length}/5000</p>
            </div>
            <div>
              <Label htmlFor="intuit-tid" className="text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Error TID, if shown
              </Label>
              <Input
                id="intuit-tid"
                value={intuitTid}
                onChange={e => setIntuitTid(e.target.value)}
                placeholder="Paste the intuit_tid shown with the error"
                maxLength={256}
              />
              <p className="mt-1 text-xs text-[#1a1420]/50">This is a troubleshooting reference, not a password or access code.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" disabled={!bugReport.trim() || bugSubmitting} className="flex items-center gap-2 px-4 py-2 forged-gradient text-white rounded-lg text-xs uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50">
                {bugSubmitted ? <Check className="w-3.5 h-3.5" /> : <Bug className="w-3.5 h-3.5" />}
                {bugSubmitting ? 'Sending...' : bugSubmitted ? 'Report Sent' : 'Send to Support'}
              </button>
              <span className="flex items-center gap-1.5 text-xs text-[#1a1420]/50">
                <Clock3 className="w-3.5 h-3.5" /> Includes page and timestamp
              </span>
            </div>
            {bugError && <p role="alert" className="text-sm text-red-700">{bugError}</p>}
            {bugSubmitted && <p role="status" className="text-sm text-green-700">Thanks — your report is available to the support team.</p>}
          </form>
        </section>

        <div className="h-px bg-black/10" />

        {/* Delete Account */}
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-red-700" strokeWidth={1.5} />
            <h2 className="font-heading text-lg">Delete Account</h2>
          </div>
          {!showDelete ? (
            <button onClick={() => setShowDelete(true)} className="flex items-center gap-2 px-4 py-2 border border-red-700/30 rounded-lg text-xs uppercase tracking-widest text-red-700 hover:bg-red-700/10 transition-colors"><Trash2 className="w-3.5 h-3.5" /> Delete My Account</button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <div><p className="text-sm font-medium">This action is permanent and cannot be undone.</p><p className="text-xs opacity-70 mt-1">All your data will be permanently removed.</p></div>
              </div>
              <div><Label className="text-xs uppercase tracking-wider mb-2 block">Type "DELETE" to confirm</Label><Input value={deleteText} onChange={e => setDeleteText(e.target.value)} /></div>
              <div className="flex items-center gap-3">
                <button disabled={deleteText !== 'DELETE'} className="flex items-center gap-2 px-4 py-2 bg-red-700 text-white rounded-lg text-xs uppercase tracking-widest disabled:opacity-50"><Trash2 className="w-3.5 h-3.5" /> Permanently Delete</button>
                <button onClick={() => { setShowDelete(false); setDeleteText(''); }} className="px-4 py-2 text-xs uppercase tracking-widest text-black/50 hover:text-black transition-colors">Cancel</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}