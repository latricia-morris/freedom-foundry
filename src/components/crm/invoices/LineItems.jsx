import React from 'react';
import { Plus, X } from 'lucide-react';

export default function LineItems({ items, onChange }) {
  const update = (i, k, v) => onChange(items.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)));
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <span className="col-span-6">Description</span><span className="col-span-2">Qty</span><span className="col-span-3">Unit price</span>
      </div>
      {items.map((it, i) => (
        <div key={i} className="grid grid-cols-12 gap-2">
          <input required className="admin-input col-span-6" value={it.description} onChange={(e) => update(i, 'description', e.target.value)} />
          <input type="number" min="0" step="0.5" className="admin-input col-span-2" value={it.quantity} onChange={(e) => update(i, 'quantity', e.target.value)} />
          <input type="number" min="0" step="0.01" className="admin-input col-span-3" value={it.unit_price} onChange={(e) => update(i, 'unit_price', e.target.value)} />
          <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} aria-label="Remove line" className="col-span-1 text-muted-foreground hover:text-destructive"><X className="mx-auto h-4 w-4" /></button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, { description: '', quantity: 1, unit_price: 0 }])} className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest link-warm">
        <Plus className="h-3 w-3" /> Add line
      </button>
    </div>
  );
}