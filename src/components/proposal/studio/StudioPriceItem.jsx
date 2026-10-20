import React from 'react';
import StudioField from '@/components/proposal/studio/StudioField';
import { MODE_LABELS } from '@/components/proposal/studio/StudioPassages';
import { fmtMoney } from '@/lib/proposalFormat';
export default function StudioPriceItem({ item, editing, onChange, selection, onSelect }) {
  const set = (key,value) => onChange({ ...item,[key]:value });
  const future = item.acceptance_mode === 'future';
  return <div className="space-y-3 rounded-sm border border-border p-4" data-price-id={item.id}>
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-heading text-xl">{item.label}</h3><p className="text-xs text-primary">{MODE_LABELS[item.acceptance_mode]}</p></div><p className="text-lg font-semibold">{fmtMoney(item.unit_price_cents || 0)}{item.billing_type === 'monthly' ? ' / month' : item.billing_type === 'per_item' ? ' / item' : ''}</p></div>
    {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
    {future && <p className="text-sm text-muted-foreground">Not included in the current total, deposit or invoice. No automatic subscription. {item.months ? `${item.months}-month term; total commitment ${fmtMoney(item.unit_price_cents * item.months)}.` : 'Term requires separate agreement.'} {item.billing_start || 'Billing start must be confirmed separately.'}</p>}
    {!editing && item.acceptance_mode === 'optional_now' && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selection?.selected === true} onChange={e => onSelect({ ...selection,selected:e.target.checked })} />Include {item.label}</label>}
    {!editing && item.alternative_group && !future && <label className="flex items-center gap-2 text-sm"><input type="radio" name={item.alternative_group} checked={selection?.selected === true} onChange={() => onSelect({ ...selection,selected:true })} />Choose this alternative</label>}
    {!editing && item.billing_type === 'per_item' && !future && <StudioField label={`${item.label} selected quantity`} type="number" value={selection?.quantity ?? item.quantity_default} onChange={v => onSelect({ ...selection,quantity:v })} />}
    {editing && <details><summary className="cursor-pointer text-sm">Edit price and acceptance</summary><div className="mt-3 grid gap-3 sm:grid-cols-2">
      <StudioField label={`${item.label} label`} value={item.label} onChange={v => set('label',v)} />
      <StudioField label={`${item.label} acceptance mode`} value={item.acceptance_mode} options={Object.entries(MODE_LABELS)} onChange={v => set('acceptance_mode',v)} />
      <StudioField label={`${item.label} price (USD)`} type="number" value={item.unit_price_cents == null ? null : item.unit_price_cents / 100} onChange={v => set('unit_price_cents',v == null ? null : Math.round(v*100))} />
      <StudioField label={`${item.label} billing type`} value={item.billing_type} options={['bundle','one_time','per_item','monthly','unclear'].map(v => [v,v.replaceAll('_',' ')])} onChange={v => set('billing_type',v)} />
      <StudioField label={`${item.label} quantity`} type="number" value={item.quantity_default} onChange={v => set('quantity_default',v)} />
      {item.billing_type === 'monthly' && <><StudioField label={`${item.label} months`} type="number" value={item.months} onChange={v => set('months',v)} /><StudioField label={`${item.label} billing start`} value={item.billing_start} onChange={v => set('billing_start',v)} /></>}
      <StudioField label={`${item.label} alternative group`} value={item.alternative_group} onChange={v => set('alternative_group',v)} />
      <StudioField label={`${item.label} parent bundle ID (no duplicate charge)`} value={item.parent_bundle_id} onChange={v => set('parent_bundle_id',v)} />
      <StudioField multiline label={`${item.label} description`} value={item.description} onChange={v => set('description',v)} />
    </div></details>}
  </div>;
}