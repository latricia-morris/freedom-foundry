import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { STAGES } from '@/lib/crm';
import { E } from '@/components/crm/useCrm';
import { PageHeader, Spinner, money } from '@/components/crm/CrmUi';
import ReportChart from '@/components/crm/reports/ReportChart';

const cap = (s) => (s || 'other').replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

export default function CrmReports() {
  const { data, isLoading } = useQuery({
    queryKey: ['crm', 'reports'],
    queryFn: async () => {
      const [rev, pipe, time, exp] = await Promise.all([
        E.CrmInvoice.aggregate({ query: { status: 'paid' }, groupBy: 'status', sum: ['total'], dateBucket: { field: 'paid_date', unit: 'month' } }),
        E.CrmOpportunity.aggregate({ groupBy: 'stage', sum: ['value'] }),
        E.TimeEntry.aggregate({ groupBy: 'activity_type', sum: ['duration_minutes'] }),
        E.Expense.aggregate({ groupBy: 'category', sum: ['amount'] }),
      ]);
      return {
        revenue: rev.rows.filter((r) => r.paid_date).sort((a, b) => a.paid_date.localeCompare(b.paid_date))
          .map((r) => ({ name: new Date(r.paid_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' }), value: r.sum_total || 0 })),
        pipeline: STAGES.map((s) => ({ name: s.label, value: pipe.rows.find((r) => r.stage === s.key)?.sum_value || 0 })),
        time: time.rows.map((r) => ({ name: cap(r.activity_type), value: Math.round((r.sum_duration_minutes || 0) / 6) / 10 })),
        expenses: exp.rows.map((r) => ({ name: cap(r.category), value: r.sum_amount || 0 })),
      };
    },
  });

  if (isLoading) return <Spinner />;
  return (
    <div className="mx-auto max-w-6xl animate-fade-in pb-12">
      <PageHeader title="Agency" accent="Reports" subtitle="Revenue, pipeline, effort and spend, drawn from invoices, deals, time and expenses." />
      <div className="grid gap-6 lg:grid-cols-2">
        <ReportChart title="Revenue collected by month" data={data.revenue} format={money} />
        <ReportChart title="Pipeline value by stage" data={data.pipeline.some((p) => p.value) ? data.pipeline : []} format={money} />
        <ReportChart title="Hours by activity" data={data.time} format={(v) => `${v}h`} />
        <ReportChart title="Spend by category" data={data.expenses} format={money} />
      </div>
    </div>
  );
}