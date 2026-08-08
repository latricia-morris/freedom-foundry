import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Check } from 'lucide-react';
import { useMembership } from '@/lib/useMembership';
import { SETUP_TASKS } from '@/lib/setupProgress';

export default function SetupTaskFooter({ taskKey, form, onSave }) {
  const [saving, setSaving] = useState(false);
  const { profile, refreshProfile } = useMembership();
  const navigate = useNavigate();

  const task = SETUP_TASKS.find(t => t.key === taskKey);
  if (!task) return null;

  const allFieldsFilled = () => {
    for (const f of task.fields) {
      const val = form?.[f];
      if (!val || !String(val).trim()) return false;
    }
    for (const f of (task.arrayFields || [])) {
      const val = form?.[f];
      if (!Array.isArray(val) || val.length === 0) return false;
    }
    return true;
  };

  const updateSetupStatus = async (status) => {
    if (!profile?.id) return;
    const currentStatus = profile.setup_status || {};
    const newStatus = { ...currentStatus, [taskKey]: status };
    try {
      await base44.entities.UserProfile.update(profile.id, { setup_status: newStatus });
      await refreshProfile();
    } catch (_) {}
  };

  const handleComplete = async () => {
    setSaving(true);
    await onSave();
    await updateSetupStatus('complete');
    setSaving(false);
    navigate('/');
  };

  const handleComeBackLater = async () => {
    setSaving(true);
    await onSave();
    await updateSetupStatus('in_progress');
    setSaving(false);
    navigate('/');
  };

  const complete = allFieldsFilled();

  return (
    <div className="flex items-center gap-3 mt-6 pt-6 border-t border-black/10">
      {!complete && (
        <button
          onClick={handleComeBackLater}
          disabled={saving}
          className="px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest text-[#1a1420]/50 border border-black/10 hover:bg-black/5 transition-colors disabled:opacity-50"
        >
          Come Back to This Later
        </button>
      )}
      <button
        onClick={handleComplete}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs uppercase tracking-widest text-white disabled:opacity-50 ml-auto"
        style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}
      >
        <Check className="w-4 h-4" /> {saving ? 'Saving...' : 'Complete'}
      </button>
    </div>
  );
}