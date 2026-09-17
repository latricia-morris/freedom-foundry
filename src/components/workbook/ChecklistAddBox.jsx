import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import apiClient from '@/api/client';

const TIMEFRAMES = [
  { key: 'none', label: 'No timeline' },
  { key: '1_month', label: '1 Month' },
  { key: '3_months', label: '3 Months' },
  { key: '6_months', label: '6 Months' },
];

export default function ChecklistAddBox({ workbookTitle }) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [timeframe, setTimeframe] = useState('none');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const computeDeadline = (tf) => {
    if (tf === 'none') return '';
    const now = new Date();
    const months = tf === '1_month' ? 1 : tf === '3_months' ? 3 : 6;
    now.setMonth(now.getMonth() + months);
    return now.toISOString().split('T')[0];
  };

  const handleTimeframe = (tf) => {
    setTimeframe(tf);
    setDeadline(computeDeadline(tf));
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await apiClient.entities.ChecklistTask.create({
        title: title.trim(),
        deadline_date: deadline || null,
        timeframe,
        status: 'pending',
        source_workbook_title: workbookTitle || null,
      });
      setSaved(true);
      setTitle('');
      setDeadline('');
      setTimeframe('none');
      setExpanded(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (_) {}
    setSaving(false);
  };

  return (
    <div className="mt-3 border-t border-black/5 pt-3">
      {!expanded && !saved ? (
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2 text-xs text-[#1a1420]/40 hover:text-[#b3232c] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add to Brand Checklist
        </button>
      ) : saved ? (
        <p className="flex items-center gap-2 text-xs text-[#b3232c] font-medium">
          <Plus className="w-3.5 h-3.5" /> Added to your checklist!
        </p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-[#1a1420]/50 font-medium">Add to Brand Checklist</span>
            <button onClick={() => setExpanded(false)} className="text-[#1a1420]/30 hover:text-[#1a1420]/60">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What do you need to do?"
            className="w-full rounded-lg px-3 py-2 text-sm text-[#1a1420] bg-white border border-black/10 outline-none focus:border-[#b3232c] transition-colors"
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            autoFocus
          />
          <div className="flex flex-wrap items-center gap-2">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf.key}
                onClick={() => handleTimeframe(tf.key)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${timeframe === tf.key ? 'border-[#b3232c] bg-[#b3232c]/8 text-[#1a1420]' : 'border-black/10 text-[#1a1420]/50 hover:border-black/20'}`}
              >
                {tf.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={deadline}
              onChange={e => { setDeadline(e.target.value); setTimeframe('none'); }}
              className="rounded-lg px-3 py-2 text-xs text-[#1a1420] bg-white border border-black/10 outline-none focus:border-[#b3232c] transition-colors"
            />
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="ml-auto px-4 py-1.5 rounded-lg text-xs uppercase tracking-widest text-white disabled:opacity-30"
              style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}
            >
              {saving ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}