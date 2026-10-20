import React from 'react';
import StudioPriceItem from '@/components/proposal/studio/StudioPriceItem';
import StudioField from '@/components/proposal/studio/StudioField';
import { fmtMoney } from '@/lib/proposalFormat';
export default function StudioInvestment({ doc, editing, onChange, quote, selections, setSelections }) {
  const inv = doc.investment;
  const updateItem = (old,item) => {
    const price = n => `$${(n/100).toLocaleString('en-US',{maximumFractionDigits:2})}`;
    const s = doc.content.studio;
    const blocks = s.blocks.map(b => ({ ...b,text: old.unit_price_cents != null && old.unit_price_cents !== item.unit_price_cents ? b.text.replaceAll(price(old.unit_price_cents),price(item.unit_price_cents)) : b.text }));
    onChange({ ...doc, content: { ...doc.content,studio:{ ...s,blocks,services:s.services.map(m => m.id === item.module_id || item.module_ids?.includes(m.id) ? { ...m,acceptance_mode:item.acceptance_mode } : m) } },investment:{ ...inv,items:inv.items.map(i => i.id === item.id ? item : i) } });
  };
  return <div className="space-y-5">
    {inv.items.map(item => <StudioPriceItem key={item.id} item={item} editing={editing} onChange={i => updateItem(item,i)} selection={selections[item.id]} onSelect={v => setSelections(prev => { const next = { ...prev }; if (item.alternative_group) inv.items.filter(i => i.alternative_group === item.alternative_group).forEach(i => { next[i.id] = { ...next[i.id],selected:false }; }); next[item.id] = v; return next; })} />)}
    {editing && <button type="button" className="text-sm text-primary" onClick={() => onChange({ ...doc,investment:{ ...inv,items:[...inv.items,{ id:crypto.randomUUID(),label:'New item',acceptance_mode:'unclear',billing_type:'unclear',quantity_default:1,unit_price_cents:null }] } })}>Add price or option</button>}
    {(inv.credits || []).map((c,i) => editing ? <div key={i} className="grid gap-3 sm:grid-cols-2"><StudioField label={`Credit ${i+1} label`} value={c.label} onChange={v => onChange({ ...doc,investment:{ ...inv,credits:inv.credits.map((x,n) => n===i ? { ...x,label:v } : x) } })} /><StudioField type="number" label={`Credit ${i+1} USD`} value={c.amount_cents/100} onChange={v => onChange({ ...doc,investment:{ ...inv,credits:inv.credits.map((x,n) => n===i ? { ...x,amount_cents:Math.round(v*100) } : x) } })} /></div> : <p key={i} className="text-sm">{c.label}: −{fmtMoney(c.amount_cents)}</p>)}
    {editing && <button type="button" className="text-sm text-primary" onClick={() => onChange({ ...doc,investment:{ ...inv,credits:[...(inv.credits || []),{label:'Credit',amount_cents:0}] } })}>Add credit / discount</button>}
    <div className="rounded-sm border border-primary/30 bg-primary/5 p-5" data-testid="studio-totals"><p className="text-xs uppercase tracking-widest text-muted-foreground">Current agreement only</p><p className="mt-1 font-heading text-3xl">{quote ? fmtMoney(quote.totalCents) : 'Calculating…'}</p><p className="mt-2 text-sm">Initial payment: {quote ? fmtMoney(quote.depositCents) : '…'}</p></div>
    <h3 className="font-heading text-2xl">Payment obligations</h3>
    {(inv.schedule || []).map((entry,i) => <div key={i} className="border-b border-border pb-4">{editing ? <div className="grid gap-3 sm:grid-cols-2">{['label','due_event','due_date','percent','amount_cents'].map(key => <StudioField key={key} label={`Payment ${i+1} ${key === 'amount_cents' ? 'fixed amount USD' : key.replaceAll('_',' ')}`} type={['percent','amount_cents'].includes(key) ? 'number' : key === 'due_date' ? 'date' : 'text'} value={key === 'amount_cents' ? entry.amount_cents == null ? null : entry.amount_cents/100 : entry[key]} onChange={v => onChange({ ...doc,investment:{ ...inv,schedule:inv.schedule.map((s,n) => n===i ? { ...s,[key]:key==='amount_cents' ? v==null ? null : Math.round(v*100) : v } : s) } })} />)}</div> : <p className="text-sm">{entry.label}: {fmtMoney(quote?.obligations?.[i]?.amount_cents || 0)} · {entry.due_event}{entry.due_date ? ` (${entry.due_date})` : ''}</p>}</div>)}
    {editing && <button type="button" className="text-sm text-primary" onClick={() => onChange({ ...doc,investment:{ ...inv,schedule:[...(inv.schedule || []),{label:'Payment',percent:null,amount_cents:null,due_event:''}] } })}>Add payment obligation</button>}
  </div>;
}