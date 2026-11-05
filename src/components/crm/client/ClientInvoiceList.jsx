import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { shortDate } from '@/lib/crm';
import { Panel, Empty, Pill, money } from '@/components/crm/CrmUi';

export default function ClientInvoiceList({ invoices }) {
  const [open, setOpen] = useState(null);
  return (
    <Panel title="Invoices">
      {invoices.length === 0 ? <Empty>No invoices have been shared with you yet.</Empty> : (
        <div className="divide-y divide-border/40">
          {invoices.map((i) => (
            <div key={i.id}>
              <button onClick={() => setOpen(open === i.id ? null : i.id)} aria-expanded={open === i.id} className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-accent/40">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">{i.number}</p>
                  <p className="text-xs text-muted-foreground">Due {shortDate(i.due_date)}{i.paid_date ? ` · Paid ${shortDate(i.paid_date)}` : ''}</p>
                </div>
                <Pill>{i.status}</Pill>
                <span className="w-24 text-right text-sm text-foreground">{money(i.total, i.currency)}</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open === i.id ? 'rotate-180' : ''}`} />
              </button>
              {open === i.id && (
                <div className="space-y-1.5 px-5 pb-4 text-sm">
                  {i.items.map((it, n) => (
                    <div key={n} className="flex justify-between text-muted-foreground"><span>{it.description} × {it.quantity}</span><span>{money(it.quantity * it.unit_price, i.currency)}</span></div>
                  ))}
                  <div className="flex justify-between border-t border-border/50 pt-1.5 text-muted-foreground"><span>Tax</span><span>{money(i.tax_amount, i.currency)}</span></div>
                  {i.payment_terms && <p className="pt-1 text-xs text-muted-foreground">{i.payment_terms}</p>}
                  {i.notes && <p className="text-xs text-muted-foreground">{i.notes}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}