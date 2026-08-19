import React, { useState, useEffect, useRef } from 'react';
import { Target, Check } from 'lucide-react';
import apiClient from '@/api/client';
import PrivacyNote from '@/components/brand/PrivacyNote';
import SetupTaskFooter from '@/components/brand/SetupTaskFooter';

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

const TABS = [
  { key: 'short', label: 'Short Term' },
  { key: 'year', label: 'The Year' },
  { key: 'long', label: 'Long Term' },
  { key: 'legacy', label: 'Life & Legacy' },
];

export default function BigPicture() {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('short');

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
    breakdown_daily_step: '', breakdown_weekly_review: '',
    long_term_goal_3yr: '', long_term_goal_5yr: '', long_term_revenue: '', long_term_positioning: ''
  };
  const [form, setForm] = useState(init);

  useEffect(() => {
    apiClient.entities.BigPicture.filter({}, '-created_date', 1)
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
        await apiClient.entities.BigPicture.update(record.id, form);
      } else {
        const created = await apiClient.entities.BigPicture.create(form);
        setRecord(created);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (_) {}
    setSaving(false);
  };

  const recordRef = useRef(record);
  recordRef.current = record;
  const isInitialLoad = useRef(true);
  useEffect(() => {
    if (loading) return;
    if (isInitialLoad.current) { isInitialLoad.current = false; return; }
    const timer = setTimeout(async () => {
      try {
        if (recordRef.current?.id) {
          await apiClient.entities.BigPicture.update(recordRef.current.id, form);
        } else {
          const created = await apiClient.entities.BigPicture.create(form);
          setRecord(created);
        }
      } catch (_) {}
    }, 2000);
    return () => clearTimeout(timer);
  }, [form, loading]);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" /></div>;

  const inputClass = "w-full rounded-xl px-4 py-2.5 text-sm text-[#1a1420] bg-white border border-black/10 placeholder:text-black/30 outline-none focus:border-[#b3232c] transition-colors";
  const textareaClass = "w-full rounded-xl px-4 py-3 text-sm text-[#1a1420] bg-white border border-black/10 placeholder:text-black/30 outline-none focus:border-[#b3232c] transition-colors resize-y";
  const labelClass = "block text-xs uppercase tracking-wider text-[#1a1420]/50 mb-1.5";

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#d9c9a3]">Brand Portal</span>
        <h1 className="font-heading text-3xl font-light text-[#f7f2ea] mt-1 mb-1">Big <span className="molten-text italic">Picture</span></h1>
        <p className="text-sm text-[#f7f2ea]/60">Your vision, goals, and the plan to get there.</p>
      </div>

      <PrivacyNote />

      <div className="editorial-container space-y-8">

        {/* Tabbed section header with file-folder tabs */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4" style={{ stroke: 'url(#warmGradientSvg)' }} />
            <h2 className="font-heading text-lg">Big Picture Thinking</h2>
          </div>

          {/* File folder tabs */}
          <div className="flex gap-1 mb-0">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2.5 text-xs uppercase tracking-wider font-medium transition-all rounded-t-lg ${
                  activeTab === tab.key
                    ? 'bg-white text-[#1a1420] border-t border-l border-r border-black/10 -mb-px relative z-10'
                    : 'bg-[#1a1420]/5 text-[#1a1420]/50 hover:text-[#1a1420]/70 border-t border-l border-r border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content panel */}
          <div className="bg-white rounded-b-xl rounded-tr-xl border border-black/10 p-6 -mt-px relative space-y-4">

            {/* SHORT TERM */}
            {activeTab === 'short' && (
              <>
                <div><label className={labelClass}>Pick a goal</label><input className={inputClass} value={form.breakdown_goal} onChange={e => update('breakdown_goal', e.target.value)} /></div>
                <div><label className={labelClass}>Brainstorm its components</label><textarea className={textareaClass} rows={3} value={form.breakdown_components} onChange={e => update('breakdown_components', e.target.value)} placeholder="Mind maps, flowcharts, or good old scribbles..." /></div>
                <div><label className={labelClass}>Prioritize: What's urgent? What can wait? What's interdependent?</label><textarea className={textareaClass} rows={3} value={form.breakdown_priorities} onChange={e => update('breakdown_priorities', e.target.value)} /></div>
                <div><label className={labelClass}>Monthly target</label><textarea className={textareaClass} rows={2} value={form.breakdown_monthly_target} onChange={e => update('breakdown_monthly_target', e.target.value)} placeholder="e.g. Gather brand feedback; Market research; Define client experience keywords" /></div>
                <div><label className={labelClass}>Weekly tasks (dissect the monthly goal)</label><textarea className={textareaClass} rows={3} value={form.breakdown_weekly_tasks} onChange={e => update('breakdown_weekly_tasks', e.target.value)} /></div>
                <div><label className={labelClass}>Daily: What's my next step?</label><textarea className={textareaClass} rows={2} value={form.breakdown_daily_step} onChange={e => update('breakdown_daily_step', e.target.value)} /></div>
                <div><label className={labelClass}>Weekly review: What worked? What didn't?</label><textarea className={textareaClass} rows={3} value={form.breakdown_weekly_review} onChange={e => update('breakdown_weekly_review', e.target.value)} /></div>
              </>
            )}

            {/* THE YEAR */}
            {activeTab === 'year' && (
              <>
                <div><label className={labelClass}>My word for the year is</label><input className={inputClass} value={form.word_for_the_year} onChange={e => update('word_for_the_year', e.target.value)} placeholder="One guiding word..." /></div>
                <div><label className={labelClass}>By the end of the year I will have</label><textarea className={textareaClass} rows={2} value={form.end_of_year_goal} onChange={e => update('end_of_year_goal', e.target.value)} /></div>
                <div><label className={labelClass}>My secondary goal is</label><textarea className={textareaClass} rows={2} value={form.secondary_goal} onChange={e => update('secondary_goal', e.target.value)} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div><label className={labelClass}>I will make $ /year</label><input className={inputClass} value={form.annual_revenue} onChange={e => update('annual_revenue', e.target.value)} /></div>
                  <div><label className={labelClass}>$ /month</label><input className={inputClass} value={form.monthly_revenue} onChange={e => update('monthly_revenue', e.target.value)} /></div>
                  <div><label className={labelClass}>$ /week</label><input className={inputClass} value={form.weekly_revenue} onChange={e => update('weekly_revenue', e.target.value)} /></div>
                </div>
                <div><label className={labelClass}>During the month of ____ I'm going to fine-tune my pricing, strategy, and pipeline</label><input className={inputClass} value={form.pricing_strategy_month} onChange={e => update('pricing_strategy_month', e.target.value)} placeholder="Month name" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelClass}>I will book ___ clients this year</label><input className={inputClass} value={form.client_booking_target} onChange={e => update('client_booking_target', e.target.value)} /></div>
                  <div><label className={labelClass}>which translates to ___ /week</label><input className={inputClass} value={form.clients_per_week} onChange={e => update('clients_per_week', e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div><label className={labelClass}>I will travel to</label><input className={inputClass} value={form.travel_goals} onChange={e => update('travel_goals', e.target.value)} /></div>
                  <div><label className={labelClass}>I will learn</label><input className={inputClass} value={form.learning_goals} onChange={e => update('learning_goals', e.target.value)} /></div>
                  <div><label className={labelClass}>I will meet</label><input className={inputClass} value={form.meeting_goals} onChange={e => update('meeting_goals', e.target.value)} /></div>
                </div>
                <div className="h-px bg-black/10" />
                <div>
                  <p className="text-sm text-[#1a1420]/60 mb-3 italic">I will:</p>
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
                </div>
              </>
            )}

            {/* LONG TERM (3-5 Years) */}
            {activeTab === 'long' && (
              <>
                <p className="text-sm text-[#1a1420]/60 italic mb-4">Where do you see your brand in 3-5 years?</p>
                <div><label className={labelClass}>In 3 years, my brand will have achieved</label><textarea className={textareaClass} rows={3} value={form.long_term_goal_3yr} onChange={e => update('long_term_goal_3yr', e.target.value)} placeholder="Define your 3-year milestones..." /></div>
                <div><label className={labelClass}>In 5 years, my brand will be</label><textarea className={textareaClass} rows={3} value={form.long_term_goal_5yr} onChange={e => update('long_term_goal_5yr', e.target.value)} placeholder="Describe your 5-year vision..." /></div>
                <div><label className={labelClass}>Target revenue in 3-5 years</label><input className={inputClass} value={form.long_term_revenue} onChange={e => update('long_term_revenue', e.target.value)} placeholder="e.g. $500K/year" /></div>
                <div><label className={labelClass}>Where I want my brand positioned in the market</label><textarea className={textareaClass} rows={3} value={form.long_term_positioning} onChange={e => update('long_term_positioning', e.target.value)} placeholder="Describe your desired market position..." /></div>
              </>
            )}

            {/* LIFE & LEGACY */}
            {activeTab === 'legacy' && (
              <>
                <div><label className={labelClass}>The impact I will make</label><textarea className={textareaClass} rows={3} value={form.impact_statement} onChange={e => update('impact_statement', e.target.value)} /></div>
                <div><label className={labelClass}>The legacy I will leave</label><textarea className={textareaClass} rows={3} value={form.legacy_statement} onChange={e => update('legacy_statement', e.target.value)} /></div>
                <div className="h-px bg-black/10" />
                <p className="text-sm text-[#1a1420]/60 italic">What does success look like in each area?</p>
                <div className="space-y-3">
                  {VISION_CATEGORIES.map(({ key, label }) => (
                    <div key={key}>
                      <label className={labelClass}>{label}</label>
                      <textarea className={textareaClass} rows={2} value={form[key]} onChange={e => update(key, e.target.value)} placeholder={`Your vision for ${label.toLowerCase()}...`} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs uppercase tracking-widest text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}
        >
          {saved ? <Check className="w-4 h-4" /> : null}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Big Picture'}
        </button>

        <SetupTaskFooter taskKey="big_picture" form={form} onSave={handleSave} />
      </div>
    </div>
  );
}