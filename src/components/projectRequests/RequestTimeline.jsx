import React from 'react';

export default function RequestTimeline({ options, form, update }) {
  return <fieldset className="space-y-3">
    <legend className="font-medium text-foreground">When would you ideally like this completed?</legend>
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => <label key={option.value} className="request-option flex min-h-12 cursor-pointer items-center gap-3 px-3 py-2.5">
        <input type="radio" name="timeline_window" value={option.value} checked={form.timeline_window === option.value} required onChange={() => update('timeline_window', option.value)} />
        <span className="text-sm">{option.label}</span>
      </label>)}
    </div>
    {form.timeline_window === 'specific_deadline' && <div className="space-y-3 border-l-2 border-border pl-4">
      <label className="block text-sm">Desired completion date<input id="deadline-date" type="date" className="admin-input mt-2" required value={form.deadline_date} onChange={(e) => update('deadline_date', e.target.value)} /></label>
      <label className="request-check-row"><input type="checkbox" checked={form.deadline_firm} onChange={(e) => update('deadline_firm', e.target.checked)} /><span className="text-sm">This date is firm</span></label>
      <label className="block text-sm">Anything we should know about the deadline?<input className="admin-input mt-2" value={form.deadline_note} onChange={(e) => update('deadline_note', e.target.value)} /></label>
    </div>}
    <p className="text-sm text-muted-foreground">Requested timing is subject to scope and availability. We will confirm the schedule before work begins.</p>
  </fieldset>;
}