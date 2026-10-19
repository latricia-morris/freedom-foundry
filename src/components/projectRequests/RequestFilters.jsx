import React from 'react';

export default function RequestFilters({ filters, setFilters, context }) {
  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const selects = [
    ['timeline', 'Requested completion window', context.timelines],
    ['firm', 'Firm deadline', [{ value: 'firm', label: 'Firm' }, { value: 'flexible', label: 'Not firm' }]],
    ['budget', 'Budget information', [{ value: 'provided', label: 'Budget provided' }, { value: 'not_provided', label: 'Not provided' }, { value: 'help', label: 'Help requested' }]],
    ['basis', 'Budget basis', [{ value: 'total_project', label: 'Total project' }, { value: 'monthly', label: 'Monthly' }]],
    ['status', 'Request status', context.statuses],
  ];
  return <details open className="dashboard-card rounded-[7px] p-4">
    <summary className="cursor-pointer font-medium">Filter requests</summary>
    <p className="my-3 text-sm text-muted-foreground">Matches any selected service category. Other filters narrow the results.</p>
    <fieldset className="mb-4"><legend className="mb-2 text-sm">Service categories</legend><div className="flex flex-wrap gap-2">{context.services.map((service) => <button type="button" role="checkbox" key={service} aria-checked={filters.services.includes(service)} className="request-choice px-3 py-2 text-xs" onClick={() => update('services', filters.services.includes(service) ? filters.services.filter((item) => item !== service) : [...filters.services, service])}>{filters.services.includes(service) ? '✓ ' : ''}{service}</button>)}</div></fieldset>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {selects.map(([key, label, options]) => <label key={key} className="text-sm">{label}<select className="admin-input mt-1" aria-label={label} value={filters[key]} onChange={(e) => update(key, e.target.value)}><option value="">All</option>{options.map(({ value, label: text }) => <option value={value} key={value}>{text}</option>)}</select></label>)}
      {[['deadlineFrom','Deadline on or after','date'], ['deadlineTo','Deadline on or before','date'], ['min','Numeric budget minimum','number'], ['max','Numeric budget maximum','number']].map(([key,label,type]) => <label key={key} className="text-sm">{label}<input aria-label={label} className="admin-input mt-1" type={type} min={type === 'number' ? 0 : undefined} value={filters[key]} onChange={(e) => update(key, e.target.value)} /></label>)}
    </div>
    <p className="mt-3 text-xs text-muted-foreground">Numeric filters match overlapping, reliably stated amounts/ranges only. Vague notes remain unpriced, and the original wording is retained.</p>
    <button type="button" className="mt-3 rounded-[7px] border border-border px-3 py-2 text-sm" onClick={() => setFilters({ services: [], timeline: '', firm: '', deadlineFrom: '', deadlineTo: '', budget: '', basis: '', min: '', max: '', status: '' })}>Clear filters</button>
  </details>;
}