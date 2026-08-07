import React, { useState, useEffect } from 'react';
import { Target, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PrivacyNote from '@/components/brand/PrivacyNote';

const PLANNING_ITEMS = [
  'LAUNCH/REBRAND MY BUSINESS',
  'GET PUBLISHED',
  'ENTER A COMPETITION',
  'SHARPEN SKILL',
  'BEGIN A PERSONAL PROJECT',
  'DIAL IN MY PRICING/OFFERINGS',
  'ENJOY OFF A WEEK',
  'TAKE A WORKSHOP',
  'REFINE MY WORKFLOW',
  'REFRESH MY MARKETING',
  'JOIN A PROFESSIONAL GROUP'
];

const VISION_CATEGORIES = [
  { key: 'vision_health', label: 'Health' },
  { key: 'vision_career', label: 'Career Goals' },
  { key: 'vision_family', label: 'Family' },
  { key: 'vision_money', label: 'Money' },
  { key: 'vision_travels', label: 'Travels' },
  { key: 'vision_hobbies', label: 'Hobbies' },
  { key: 'vision_relationships', label: 'Relationships' },
];

export default function BigPicture() {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const init = {
    word_for_the_year: '', end_of_year_goal: '', secondary_goal: '',
    annual_revenue: '', monthly_revenue: '', weekly_revenue: '',
    pricing_strategy_month: '', client_booking_target: '', clients_per_week: '',
    travel_goals: '', learning_goals: '', meeting_goals: '',
    impact_statement: '', legacy_statement: '',
    planning_checklist: [],
    vision_health: '', vision_career: '', vision_family: '', vision_money: '',
    vision_travels: '', vision_hobbies: '', vision_relationships: '',
    breakdown_goal: '', breakdown_components: '', breakdown_priorities: '',
    breakdown_monthly_target: '', breakdown_weekly_tasks: '',
    breakdown_daily_step: '', breakdown_weekly_review: ''
  };
  const [form, setForm] = useState(init);

  useEffect(() => {
    base44.entities.BigPicture.filter({}, '-created_date', 1)
      .then(r => {
        const rec = r?.[0] || null;
        setRecord(rec);
        if (rec) setForm({ ...init, ...rec });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const toggleChecklist = (item) => {
    setForm(prev => {
      const list = prev.planning_checklist || [];
      return { ...prev, planning_checklist: list.includes(item) ? list.filter(i => i !== item) : [...list, item] };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (record?.id) {
        await base44.entities.BigPicture.update(record.id, form);
      } else {
        const created = await base44.entities.BigPicture.create(form);
        setRecord(created);
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
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#d9c9a3]">Brand Portal</span>
        <h1 className="font-heading text-3xl font-light text-[#f7f2ea] mt-1 mb-1">Big <span className="molten-text italic">Picture</span></h1>
        <p className="text-sm text-[#f7f2ea]/60">Your vision, goals, and the plan to get there.</p>
      </div>

      <PrivacyNote />

      <div className="editorial-container space-y-8">

        {/* Big Picture Thinking — Goals */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-[#b3232c]" />
            <h2 className="font-heading text-lg">Big Picture Thinking</h2>
          </div>
          <div className="space-y-4">
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">My word for the year is</label><input className={inputClass} value={form.word_for_the_year} onChange={e => update('word_for_the_year', e.target.value)} placeholder="One guiding word..." /></div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">By the end of the year I will have</label><textarea className={textareaClass} rows={2} value={form.end_of_year_goal} onChange={e => update('end_of_year_goal', e.target.value)} /></div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">My secondary goal is</label><textarea className={textareaClass} rows={2} value={form.secondary_goal} onChange={e => update('secondary_goal', e.target.value)} /></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">I will make $ /year</label><input className={inputClass} value={form.annual_revenue} onChange={e => update('annual_revenue', e.target.value)} /></div>
              <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">$ /month</label><input className={inputClass} value={form.monthly_revenue} onChange={e => update('monthly_revenue', e.target.value)} /></div>
              <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">$ /week</label><input className={inputClass} value={form.weekly_revenue} onChange={e => update('weekly_revenue', e.target.value)} /></div>
            </div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">During the month of ____ I'm going to fine-tune my pricing, strategy, and pipeline</label><input className={inputClass} value={form.pricing_strategy_month} onChange={e => update('pricing_strategy_month', e.target.value)} placeholder="Month name" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">I will book ___ clients this year</label><input className={inputClass} value={form.client_booking_target} onChange={e => update('client_booking_target', e.target.value)} /></div>
              <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">which translates to ___ /week</label><input className={inputClass} value={form.clients_per_week} onChange={e => update('clients_per_week', e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">I will travel to</label><input className={inputClass} value={form.travel_goals} onChange={e => update('travel_goals', e.target.value)} /></div>
              <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">I will learn</label><input className={inputClass} value={form.learning_goals} onChange={e => update('learning_goals', e.target.value)} /></div>
              <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">I will meet</label><input className={inputClass} value={form.meeting_goals} onChange={e => update('meeting_goals', e.target.value)} /></div>
            </div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">The impact I will make</label><textarea className={textareaClass} rows={3} value={form.impact_statement} onChange={e => update('impact_statement', e.target.value)} /></div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">The legacy I will leave</label><textarea className={textareaClass} rows={3} value={form.legacy_statement} onChange={e => update('legacy_statement', e.target.value)} /></div>
          </div>
        </section>

        <div className="h-px bg-black/10" />

        {/* Big Picture Planning — Checklist */}
        <section>
          <h2 className="font-heading text-lg mb-2">Big Picture Planning</h2>
          <p className="text-sm text-[#1a1420]/60 mb-4 italic">I will:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PLANNING_ITEMS.map(item => {
              const checked = (form.planning_checklist || []).includes(item);
              return (
                <button
                  key={item}
                  onClick={() => toggleChecklist(item)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left text-sm transition-all ${checked
                    ? 'border-[#b3232c] bg-[#b3232c]/8 text-[#1a1420]'
                    : 'border-black/10 text-[#1a1420]/60 hover:border-[#b3232c]/40'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 ${checked ? 'bg-[#b3232c] border-[#b3232c]' : 'border-black/20'}`}>
                    {checked && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  {item}
                </button>
              );
            })}
          </div>
        </section>

        <div className="h-px bg-black/10" />

        {/* Vision Board */}
        <section>
          <h2 className="font-heading text-lg mb-2">Vision Board</h2>
          <p className="text-sm text-[#1a1420]/60 mb-4 italic">What does success look like in each area?</p>
          <div className="space-y-3">
            {VISION_CATEGORIES.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">{label}</label>
                <textarea className={textareaClass} rows={2} value={form[key]} onChange={e => update(key, e.target.value)} placeholder={`Your vision for ${label.toLowerCase()}...`} />
              </div>
            ))}
          </div>
        </section>

        <div className="h-px bg-black/10" />

        {/* Breaking It Down */}
        <section>
          <h2 className="font-heading text-lg mb-2">Dismantle Your Big Goals Into Bite-Sized Wins</h2>
          <p className="text-sm text-[#1a1420]/60 mb-4 italic">Break it down step by step.</p>
          <div className="space-y-4">
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Pick a goal</label><input className={inputClass} value={form.breakdown_goal} onChange={e => update('breakdown_goal', e.target.value)} /></div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Brainstorm its components</label><textarea className={textareaClass} rows={3} value={form.breakdown_components} onChange={e => update('breakdown_components', e.target.value)} placeholder="Mind maps, flowcharts, or good old scribbles..." /></div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Prioritize: What's urgent? What can wait? What's interdependent?</label><textarea className={textareaClass} rows={3} value={form.breakdown_priorities} onChange={e => update('breakdown_priorities', e.target.value)} /></div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Monthly target</label><textarea className={textareaClass} rows={2} value={form.breakdown_monthly_target} onChange={e => update('breakdown_monthly_target', e.target.value)} placeholder="e.g. Gather brand feedback; Market research; Define client experience keywords" /></div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Weekly tasks (dissect the monthly goal)</label><textarea className={textareaClass} rows={3} value={form.breakdown_weekly_tasks} onChange={e => update('breakdown_weekly_tasks', e.target.value)} /></div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Daily: What's my next step?</label><textarea className={textareaClass} rows={2} value={form.breakdown_daily_step} onChange={e => update('breakdown_daily_step', e.target.value)} /></div>
            <div><label className="block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5">Weekly review: What worked? What didn't?</label><textarea className={textareaClass} rows={3} value={form.breakdown_weekly_review} onChange={e => update('breakdown_weekly_review', e.target.value)} /></div>
          </div>
        </section>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs uppercase tracking-widest text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}
        >
          {saved ? <Check className="w-4 h-4" /> : null}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Big Picture'}
        </button>
      </div>
    </div>
  );
}