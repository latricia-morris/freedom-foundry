import React from 'react';

export default function RequestBudget({ form, update }) {
  return <fieldset className="space-y-3">
    <legend className="font-medium text-foreground">Have a budget in mind?</legend>
    <p id="budget-help" className="text-sm text-muted-foreground">If you have an amount or range allocated, you can share it here. It is also fine to leave this blank.</p>
    <label className="block text-sm" htmlFor="budget-original">Budget amount, range, or note</label>
    <input id="budget-original" className="admin-input" aria-describedby="budget-help" placeholder="An amount or range, if you have one." value={form.budget_original} onChange={(e) => update('budget_original', e.target.value)} />
    {form.budget_original.trim() && <div className="flex flex-wrap gap-3" role="group" aria-label="Budget basis">
      {[['total_project', 'Total project budget'], ['monthly', 'Monthly budget']].map(([value, label]) => <label key={value} className="request-option flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm"><input type="radio" name="budget_basis" checked={form.budget_basis === value} onChange={() => update('budget_basis', value)} />{label}</label>)}
    </div>}
    <label className="request-check-row"><input type="checkbox" checked={form.budget_help_requested} onChange={(e) => update('budget_help_requested', e.target.checked)} /><span className="text-sm">I would like help determining the budget.</span></label>
    <p className="text-sm text-muted-foreground">If this amount also includes advertising spend, printing, or other outside costs, mention that in your project details.</p>
  </fieldset>;
}