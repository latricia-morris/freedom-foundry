import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Shield, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { ACCOUNT_TYPE_LABELS } from '@/lib/useMembership';

const ACCOUNT_TYPES = ['free', 'premium', 'client', 'premium_client'];

export default function AdminUserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [accountType, setAccountType] = useState('free');
  const [bpmUnlocked, setBpmUnlocked] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    base44.auth.me().then(async me => {
      if (me.role !== 'admin') { setDenied(true); setLoading(false); return; }
      try {
        const users = await base44.entities.User.list();
        const u = users.find(u => u.id === id) || null;
        setUser(u);
        if (u) {
          const profiles = await base44.entities.UserProfile.filter({ user_id: u.id }, '-created_date', 1).catch(() => []);
          const p = profiles?.[0] || null;
          setUserProfile(p);
          setAccountType(p?.account_type || 'free');
          setBpmUnlocked(p?.brand_power_moves_unlocked || false);
          setNotes(p?.notes || '');
        }
      } catch (_) {}
      setLoading(false);
    }).catch(() => { setDenied(true); setLoading(false); });
  }, [id]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const data = { user_id: user.id, account_type: accountType, brand_power_moves_unlocked: bpmUnlocked, notes };
      if (userProfile?.id) {
        await base44.entities.UserProfile.update(userProfile.id, data);
      } else {
        const created = await base44.entities.UserProfile.create(data);
        setUserProfile(created);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (_) {}
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;
  if (denied) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-3" strokeWidth={1} />
        <h1 className="font-heading text-xl text-foreground mb-1">Admin Access Required</h1>
      </div>
    </div>
  );
  if (!user) return (
    <div className="text-center py-20">
      <h1 className="font-heading text-xl text-foreground mb-2">User not found</h1>
      <Link to="/admin/users" className="text-sm text-primary">Back to Users</Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Link to="/admin/users" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </Link>

      <div className="editorial-container space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full border border-black/10 flex items-center justify-center bg-[#f0ece4]">
            <span className="font-heading text-lg text-[#1a1420]">{(user.full_name || user.email || 'U')[0].toUpperCase()}</span>
          </div>
          <div>
            <h1 className="font-heading text-xl text-[#1a1420]">{user.full_name || 'Unnamed User'}</h1>
            <p className="text-sm text-[#1a1420]/60">{user.email}</p>
          </div>
        </div>

        <div className="h-px bg-black/10" />

        {/* Account Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-[#1a1420]/60">User ID</span>
            <span className="text-xs font-mono text-[#1a1420]/80">{user.id}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-[#1a1420]/60">Platform Role</span>
            <span className={`text-xs uppercase tracking-widest ${user.role === 'admin' ? 'text-[#b3232c]' : 'text-[#1a1420]/60'}`}>{user.role || 'user'}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-[#1a1420]/60">Joined</span>
            <span className="text-sm text-[#1a1420]">{user.created_date ? new Date(user.created_date).toLocaleDateString() : '—'}</span>
          </div>
        </div>

        <div className="h-px bg-black/10" />

        {/* Membership Type */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-3">Membership Type</label>
          <div className="flex flex-wrap gap-2">
            {ACCOUNT_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setAccountType(type)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${accountType === type ? 'text-white' : 'text-[#1a1420]/60 border border-black/10 hover:border-black/20'}`}
                style={accountType === type ? { background: 'linear-gradient(131deg, #b3232c, #d9622c)' } : {}}
              >
                {ACCOUNT_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        {/* BPM Unlock */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#1a1420]">Brand Power Moves Access</p>
            <p className="text-xs text-[#1a1420]/50 mt-0.5">Grant or revoke unlock access</p>
          </div>
          <button
            onClick={() => setBpmUnlocked(!bpmUnlocked)}
            className={`relative w-12 h-6 rounded-full transition-colors ${bpmUnlocked ? '' : 'bg-black/10'}`}
            style={bpmUnlocked ? { background: 'linear-gradient(131deg, #b3232c, #d9622c)' } : {}}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${bpmUnlocked ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-2">Admin Notes</label>
          <textarea
            className="w-full rounded-xl px-4 py-3 text-sm text-[#1a1420] bg-white border border-black/10 outline-none focus:border-[#b3232c] transition-colors resize-none"
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Internal notes about this user..."
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs uppercase tracking-widest text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}
        >
          {saved ? <Check className="w-4 h-4" /> : null}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}