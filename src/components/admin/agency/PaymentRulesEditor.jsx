import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { centsFromInput, depositCentsFor, formatUsd, inputFromCents } from '@/lib/agency';

/** Deposit rule + milestone payment schedule editor with a live USD preview. */
export default function PaymentRulesEditor({
  depositRuleType, depositRuleValue, milestoneRules, estimatedTotalCents,
  onDepositChange, onMilestonesChange,
}) {
  const rules = milestoneRules || [];

  const updateRule = (index, patch) => {
    const next = rules.map((r, i) => (i === index ? { ...r, ...patch } : r));
    onMilestonesChange(next);
  };

  const depositCents = depositCentsFor(estimatedTotalCents, depositRuleType, depositRuleValue);
  const allocated = depositCents + rules.reduce((s, r) => s + Math.round((estimatedTotalCents * (r.percent || 0)) / 100), 0);
  const finalCents = Math.max(0, estimatedTotalCents - allocated);

  return (
    <div className="dashboard-card space-y-5 p-6">
      <div>
        <h3 className="font-heading text-2xl text-foreground">Deposit & payment schedule</h3>
        <p className="text-xs text-muted-foreground/70">
          The deposit is collected immediately at signing. Milestones bill as a percentage of the contract total.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">Deposit rule</span>
          <select className="admin-input py-1.5 text-sm" value={depositRuleType} onChange={(e) => onDepositChange(e.target.value, depositRuleValue)}>
            <option value="percentage">Percentage of total</option>
            <option value="fixed_amount">Fixed amount</option>
            <option value="full_payment">Full payment upfront</option>
          </select>
        </label>
        {depositRuleType !== 'full_payment' && (
          <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">
              {depositRuleType === 'percentage' ? 'Deposit percent (%)' : 'Deposit amount (USD)'}
            </span>
            <input
              className="admin-input py-1.5 text-sm"
              value={depositRuleType === 'percentage' ? (depositRuleValue ?? 50) : inputFromCents(depositRuleValue)}
              onChange={(e) => {
                const raw = e.target.value;
                if (depositRuleType === 'percentage') onDepositChange('percentage', Math.min(100, Math.max(0, Number(raw) || 0)));
                else onDepositChange('fixed_amount', centsFromInput(raw));
              }}
            />
          </label>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Milestone payments</p>
          <button type="button" onClick={() => onMilestonesChange([...rules, { description: '', percent: 0, due_days: 30 }])} className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
            <Plus className="h-3.5 w-3.5" /> Add milestone
          </button>
        </div>
        <div className="space-y-2">
          {rules.length === 0 && (
            <p className="text-xs text-muted-foreground/60">No milestones — the balance is due as a single final payment.</p>
          )}
          {rules.map((rule, index) => (
            <div key={index} className="grid grid-cols-[1fr_80px_90px_32px] items-center gap-2">
              <input className="admin-input py-1.5 text-sm" placeholder="Strategy delivery" value={rule.description || ''} onChange={(e) => updateRule(index, { description: e.target.value })} />
              <input className="admin-input py-1.5 text-sm" type="number" min="0" max="100" value={rule.percent ?? 0} onChange={(e) => updateRule(index, { percent: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })} />
              <input className="admin-input py-1.5 text-sm" type="number" min="1" value={rule.due_days ?? 30} onChange={(e) => updateRule(index, { due_days: Math.max(1, Number(e.target.value) || 30) })} />
              <button type="button" onClick={() => onMilestonesChange(rules.filter((_, i) => i !== index))} className="rounded-sm p-1.5 text-muted-foreground hover:text-destructive" aria-label="Remove milestone"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          {rules.length > 0 && (
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50">Description · % of total · due in (business days)</p>
          )}
        </div>
      </div>

      <div className="rounded-md border border-border/70 bg-background/40 p-4 text-sm">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Schedule preview (based on {formatUsd(estimatedTotalCents)} estimated total)</p>
        <div className="mt-2 flex items-center justify-between"><span className="text-muted-foreground">Deposit at signing</span><span className="text-primary">{formatUsd(depositCents)}</span></div>
        {rules.map((rule, i) => (
          <div key={i} className="mt-1 flex items-center justify-between">
            <span className="text-muted-foreground">{rule.description || 'Milestone'} ({rule.percent}%)</span>
            <span className="text-muted-foreground">{formatUsd(Math.round((estimatedTotalCents * (rule.percent || 0)) / 100))}</span>
          </div>
        ))}
        <div className="mt-1 flex items-center justify-between border-t border-border/60 pt-2">
          <span className="text-muted-foreground">Final payment</span>
          <span className="text-foreground">{formatUsd(finalCents)}</span>
        </div>
      </div>
    </div>
  );
}