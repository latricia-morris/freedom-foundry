import React, { useEffect, useState } from 'react';
import { Receipt } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const usd = (cents) =>
  `$${((cents || 0) / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function ClientQbHistory() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [client, setClient] = useState(null);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    base44.functions.invoke('client-billing-history', {})
      .then((res) => {
        const data = res.data || {};
        setClient(data.client);
        setRecords(data.records || []);
      })
      .catch((e) => setError(e.message || 'Could not load your billing history.'))
      .finally(() => setLoading(false));
  }, []);

  const totals = records.reduce(
    (acc, r) => {
      if (r.record_type === 'payment') acc.paid += r.amount_cents || 0;
      if (r.record_type === 'invoice') acc.outstanding += r.balance_cents || 0;
      return acc;
    },
    { paid: 0, outstanding: 0 }
  );

  return (
    <div className="p-6 border border-black/10 rounded-lg bg-white/50">
      <div className="flex items-center gap-3 mb-4">
        <Receipt className="w-4 h-4 text-merlot" strokeWidth={1.5} />
        <h3 className="font-heading text-lg">Billing History</h3>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 rounded-full border-2 border-black/10 border-t-merlot animate-spin" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-700">{error}</p>
      ) : !client ? (
        <p className="text-sm opacity-70">
          No agency billing records are linked to your account yet. They will appear here once your project billing is set up.
        </p>
      ) : records.length === 0 ? (
        <p className="text-sm opacity-70">
          Your billing history is being prepared and will appear here soon.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="p-4 rounded-lg bg-white/60 border border-black/10">
              <p className="text-xs uppercase tracking-widest opacity-60 mb-1">Paid to date</p>
              <p className="font-heading text-2xl">{usd(totals.paid)}</p>
            </div>
            <div className="p-4 rounded-lg bg-white/60 border border-black/10">
              <p className="text-xs uppercase tracking-widest opacity-60 mb-1">Outstanding</p>
              <p className="font-heading text-2xl">{usd(totals.outstanding)}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest opacity-60 border-b border-black/10">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">#</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Balance</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-black/5">
                    <td className="py-2.5 pr-4 opacity-70">{r.txn_date ? new Date(r.txn_date).toLocaleDateString() : '—'}</td>
                    <td className="py-2.5 pr-4 capitalize opacity-70">{r.record_type}</td>
                    <td className="py-2.5 pr-4">{r.doc_number || '—'}</td>
                    <td className="py-2.5 pr-4">{usd(r.amount_cents)}</td>
                    <td className="py-2.5 pr-4 opacity-70">{r.record_type === 'invoice' ? usd(r.balance_cents) : '—'}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs uppercase tracking-wider ${r.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-merlot/10 text-merlot'}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs opacity-50 mt-3">Synced from QuickBooks. Questions about a charge? Contact us and we will review it.</p>
        </>
      )}
    </div>
  );
}